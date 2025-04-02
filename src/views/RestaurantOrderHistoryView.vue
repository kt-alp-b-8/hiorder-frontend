<template>
  <div class="owner-dashboard">
    <!-- 상단 헤더 -->
    <div class="dashboard-header">
      <div class="header-content">
        <h2>실시간 주문 내역</h2>
        <div class="restaurant-name">
          <span>{{ restaurantName }}</span>
        </div>
      </div>
      <button class="logout-btn" @click="confirmLogout">
        <i class="icon-logout"></i>
        <span>로그아웃</span>
      </button>
    </div>

    <!-- 탭 영역 -->
    <div class="tabs-wrapper">
      <div class="tabs-container">
        <button
          class="tab-button"
          :class="{ active: currentTab === 'orders' }"
          @click="goToOrdersTab"
        >
          <i class="icon-orders"></i>
          주문내역
        </button>
        <button
          class="tab-button"
          :class="{ active: currentTab === 'clear' }"
          @click="goToClearTab"
        >
          <i class="icon-clear"></i>
          테이블 주문내역 비우기
        </button>
        <button
          class="tab-button"
          :class="{ active: currentTab === 'manage' }"
          @click="goToManageTab"
        >
          <i class="icon-menu"></i>
          메뉴 관리
        </button>
      </div>
    </div>

    <!-- 주문 리스트 -->
    <div class="dashboard-content">
      <div class="order-list" v-if="orders.length > 0">
        <div
          class="order-card"
          v-for="(order, idx) in orders"
          :key="order.orderId"
          :class="{ 'recent-highlight': idx === 0 }"  
        >
          <!-- "최근 주문" 뱃지 -->
          <div class="recent-badge" v-if="idx === 0">
            <i class="icon-new"></i>
            최근 주문
          </div>

          <!-- 테이블명 + 주문번호 -->
          <div class="order-top-row">
            <div class="table-name">
              <i class="icon-table"></i>
              {{ order.orderTable }}
            </div>
            <div class="order-code">주문번호 #{{ order.orderCode }}</div>
          </div>

          <!-- 주문시각 -->
          <div class="order-time">
            <i class="icon-time"></i>
            {{ formatDateTime(order.createdAt) }}
          </div>

          <!-- 아이템 목록 -->
          <div class="order-items">
            <div
              class="order-item-line"
              v-for="(item, iIndex) in order.items"
              :key="iIndex"
            >
              <div class="menu-name">{{ item.menuName }}</div>
              <div class="menu-qty">x {{ item.quantity }}</div>
            </div>
          </div>

          <!-- 총금액 -->
          <div class="order-amount">
            <span class="amount-label">합계</span>
            <span class="amount-value">{{ order.totalAmount.toLocaleString() }}원</span>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <div class="empty-icon">📋</div>
        <p>주문 내역이 없습니다.</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        <i class="icon-error"></i>
        {{ errorMessage }}
      </div>
    </div>

    <!-- 로그아웃 모달 -->
    <div class="modal-overlay" v-if="showLogoutModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>로그아웃</h3>
          <button class="modal-close" @click="cancelLogout">×</button>
        </div>
        <div class="modal-body">
          <p>정말 로그아웃하시겠습니까?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelLogout">아니오</button>
          <button class="btn btn-primary" @click="doLogout">로그아웃</button>
        </div>
      </div>
    </div>
    <ChatBot />
  </div>
</template>

<script>
import axios from "axios";
import ChatBot from "@/components/ChatBot.vue";
export default {
  name: "RestaurantOrderHistoryView",
  components: {
    ChatBot
  },
  data() {
    return {
      restaurantName: "",
      orders: [],
      errorMessage: "",
      intervalId: null, // for setInterval
      currentTab: "orders", // [CHANGED] 표시용
      // (A) 로그아웃 모달
      showLogoutModal: false
    };
  },
  async mounted() {
    const { restaurantId } = this.$route.params;

    // (A) 사장님 식당명
    const savedName = localStorage.getItem("ownerRestaurantName");
    if (savedName) {
        this.restaurantName = savedName;
    } else {
        this.restaurantName = "사장님 식당"; // fallback
    }

    // (B) 3초마다 API 호출
    this.fetchOrders();
    this.intervalId = setInterval(() => {
      this.fetchOrders();
    }, 3000);
  },
  beforeUnmount() {
    // (C) 컴포넌트 unmount 시 interval 정리
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  },
  methods: {
    async fetchOrders() {
      const { restaurantId } = this.$route.params;
      this.errorMessage = "";
      try {
        const response = await axios.get(
          `/order/${restaurantId}/order/history?orderStatus=IN_PROGRESS&orderCode=desc`
        );
        if (response.data.success) {
          this.orders = response.data.data;
        } else {
          this.errorMessage = response.data.message || "주문 내역 조회 실패.";
        }
      } catch (err) {
        if (err.response) {
          const backendMsg = err.response.data.msg || err.response.data.message;
          this.errorMessage = backendMsg || "서버 오류가 발생했습니다.";
        } else {
          this.errorMessage = "네트워크 오류가 발생했습니다.";
        }
      }
    },
    // (B) 로그아웃 모달
    confirmLogout() {
      this.showLogoutModal = true;
    },
    cancelLogout() {
      this.showLogoutModal = false;
    },
    doLogout() {
      // 실제 로그아웃 로직
      this.showLogoutModal = false;
      // 예: localStorage.removeItem("ownerRestaurantName");
      this.$router.push({ name: "OwnerLoginView" });
    },

    formatDateTime(dt) {
      if (!dt) return "";
      const dateObj = new Date(dt);
      const MM = String(dateObj.getMonth() + 1).padStart(2, "0");
      const DD = String(dateObj.getDate()).padStart(2, "0");
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const mm = String(dateObj.getMinutes()).padStart(2, "0");
      const ss = String(dateObj.getSeconds()).padStart(2, "0");
      return `${MM}:${DD} ${hh}:${mm}:${ss}`;
    },
     // [CHANGED] 탭 전환
     goToOrdersTab() {
      this.currentTab = "orders";
      // 재조회 로직 or do nothing// 현재 화면이므로 do nothing or refresh
      // but for demonstration, let's just do nothing
    },
    goToClearTab() {
      this.currentTab = "clear";
      const { restaurantId } = this.$route.params;
      this.$router.push({
        name: "TableOrderHistoryClearView",
        params: { restaurantId }
      });
    },
    // [CHANGED] 새 탭
    goToManageTab() {
      this.currentTab = "manage";
      const { restaurantId } = this.$route.params;
      this.$router.push({
        name: "OwnerMenuManageView",
        params: { restaurantId }
      });
    },
  },
};
</script>

<style scoped>
/* 기본 스타일 */
.owner-dashboard {
  max-width: 100%;
  background-color: #f5f7fa;
  min-height: 100vh;
  position: relative;
  font-family: "Noto Sans KR", sans-serif;
}

/* 헤더 스타일 */
.dashboard-header {
  background: linear-gradient(135deg, #7b4397, #dc2430);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between; 
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  text-align: center;
  flex-grow: 1;
}

.dashboard-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.restaurant-name {
  margin-top: 5px;
  font-size: 16px;
  opacity: 0.9;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.icon-logout:before {
  content: "↪";
  font-size: 16px;
}

/* 탭 스타일 */
.tabs-wrapper {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.tab-button {
  flex: 1;
  padding: 16px 8px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 15px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-button:hover {
  color: #7b4397;
}

.tab-button.active {
  color: #7b4397;
  border-bottom-color: #7b4397;
}

.icon-orders:before {
  content: "📋";
}

.icon-clear:before {
  content: "🧹";
}

.icon-menu:before {
  content: "🍽️";
}

/* 콘텐츠 영역 */
.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 주문 리스트 */
.order-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.order-card.recent-highlight {
  border-left: 4px solid #7b4397;
}

.recent-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #7b4397, #dc2430);
  color: white;
  font-size: 12px;
  padding: 6px 12px;
  border-bottom-left-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-new:before {
  content: "🔔";
  font-size: 14px;
}

.order-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-top: 5px;
}

.table-name {
  font-size: 18px;
  font-weight: 700;
  color: #7b4397;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-table:before {
  content: "🪑";
  font-size: 16px;
}

.order-code {
  font-size: 14px;
  color: #666;
  background-color: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.order-time {
  font-size: 14px;
  color: #888;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-time:before {
  content: "🕒";
  font-size: 14px;
}

.order-items {
  background-color: #f9f9fb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.order-item-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #eee;
}

.order-item-line:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.menu-name {
  font-weight: 500;
  color: #333;
}

.menu-qty {
  font-weight: 700;
  color: #7b4397;
}

.order-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.amount-label {
  font-size: 15px;
  font-weight: 600;
  color: #666;
}

.amount-value {
  font-size: 18px;
  font-weight: 700;
  color: #7b4397;
}

/* 빈 상태 */
.empty-state {
  background-color: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
}

.empty-state p {
  font-size: 16px;
  color: #888;
  margin: 0;
}

/* 에러 메시지 */
.error-message {
  background-color: #fff3f3;
  color: #dc2430;
  padding: 15px;
  margin: 15px 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-error:before {
  content: "⚠️";
  font-size: 18px;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 350px;
  max-width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #7b4397, #dc2430);
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  color: #333;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f1f1f1;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
}

.btn-primary {
  background: linear-gradient(135deg, #7b4397, #dc2430);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .order-list {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    font-size: 14px;
    padding: 12px 8px;
  }
  
  .tab-button span {
    display: none;
  }
}
</style>