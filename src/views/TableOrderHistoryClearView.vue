<template>
  <div class="owner-dashboard">
    <!-- 상단 헤더 -->
    <div class="dashboard-header">
      <div class="header-content">
        <h2>테이블 주문내역 비우기</h2>
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

    <!-- 대시보드 콘텐츠 -->
    <div class="dashboard-content">
      <div class="section-header">
        <h3>테이블을 선택하여 주문내역을 비우세요</h3>
        <p>테이블의 모든 주문 내역이 정리됩니다.</p>
      </div>

      <!-- 테이블 목록 -->
      <div class="table-grid" v-if="tables.length > 0">
        <div
          class="table-card"
          v-for="table in tables"
          :key="table.tableId"
          @click="confirmClear(table)"
        >
          <div class="table-icon">🪑</div>
          <div class="table-name">{{ table.tableName }}</div>
          <div class="table-action">
            <span>정리하기</span>
            <i class="icon-arrow"></i>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <div class="empty-icon">🪑</div>
        <p>테이블 정보가 없습니다.</p>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        <i class="icon-error"></i>
        {{ errorMessage }}
      </div>
    </div>

    <!-- 테이블 정리 확인 모달 -->
    <div class="modal-overlay" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>테이블 주문내역 정리</h3>
          <button class="modal-close" @click="cancelClear">×</button>
        </div>
        <div class="modal-body">
          <div class="confirm-table">
            <div class="table-icon large">🪑</div>
            <div class="table-info">
              <p class="confirm-title">{{ selectedTable.tableName }}</p>
              <p class="confirm-message">해당 테이블의 주문내역을 정리하시겠습니까?</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelClear">취소</button>
          <button class="btn btn-primary" @click="doClear">정리하기</button>
        </div>
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

    <!-- 토스트 메시지 (Bootstrap 스타일 유지) -->
    <div
      class="toast-container position-fixed bottom-0 end-0 p-3"
      style="z-index: 9999"
    >
      <div
        id="liveToast"
        class="toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        :class="{ show: toastVisible }"
      >
        <div class="toast-header">
          <strong class="me-auto">알림</strong>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="toastVisible = false"
          ></button>
        </div>
        <div class="toast-body">
          {{ toastMessage }}
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
  name: "TableOrderHistoryClearView",
  components: {
    ChatBot
  },
  data() {
    return {
      restaurantName: "",
      tables: [], // [{tableId, tableName}, ...]
      errorMessage: "",
      currentTab: "clear", // 현재 탭 표시
      showModal: false, // [CHANGED] 모달 표시 여부
      // (A) 로그아웃 모달
      showLogoutModal: false,
      selectedTable: {}, // [CHANGED] 선택한 테이블 정보
       // (B) toast
      toastVisible: false,
      toastMessage: "",
    };
  },
  async mounted() {
    const { restaurantId } = this.$route.params;
    // 식당명 불러오기 (localStorage 등)
    const savedName = localStorage.getItem("ownerRestaurantName");
    this.restaurantName = savedName || "사장님 식당";

    // (1) restaurantTableInfo API
    try {
      const response = await axios.get(
        `http://localhost:8080/restaurants/${restaurantId}/tables?sort=table_id`
      );
      if (response.data.success) {
        this.tables = response.data.data; 
      } else {
        this.errorMessage = response.data.message || "테이블 조회 실패.";
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
  methods: {
     // (B) 로그아웃 모달
     confirmLogout() {
      this.showLogoutModal = true;
    },
    cancelLogout() {
      this.showLogoutModal = false;
    },
    doLogout() {
      this.showLogoutModal = false;
      this.$router.push({ name: "OwnerLoginView" });
    },
    goToOrdersTab() {
      const { restaurantId } = this.$route.params;
      this.$router.push({
        name: "RestaurantOrderHistoryView",
        params: { restaurantId }
      });
    },
    goToClearTab() {
      // 현재 화면
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
    confirmClear(table) {
      // 팝업
      this.selectedTable = table;
      this.showModal = true; // 모달 열기
    },
    cancelClear() {
      this.showModal = false; // 모달 닫기
    },
    async doClear() {
      // (3) PUT API 호출
      this.showModal = false; // 모달 닫기
      const { restaurantId } = this.$route.params;

      try {
        const response = await axios.put(
          `/order/${restaurantId}/tables/${this.selectedTable.tableId}/orders/changeStatus`
        );
        // 성공 응답 예: { status:200, success:true, data:{ updatedCount, updatedOrderIds }, message }
        if (response.data.success) {
           // (2) toast 로 메시지 표시
           this.showToast(response.data.message || "정리 완료!");
          // (3) updatedCount>0이면 테이블 목록 다시 조회할지 여부는 선택
          // this.fetchTables(); // etc
        } else {
          // success=false
           this.showToast(response.data.message || "정리 실패!");
        }
      } catch (err) {
        if (err.response) {
          const backendMsg = err.response.data.msg || err.response.data.message;
          this.showToast(backendMsg || "서버 오류가 발생했습니다.");
        } else {
          this.showToast("네트워크 오류가 발생했습니다.");
        }
      }
    },
    // (B) toast 로직
    showToast(msg) {
      this.toastMessage = msg;
      this.toastVisible = true;
      setTimeout(() => {
        this.toastVisible = false;
      }, 3000);
    },
  }
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

.section-header {
  margin-bottom: 24px;
  text-align: center;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.section-header p {
  font-size: 15px;
  color: #666;
  margin: 0;
}

/* 테이블 그리드 */
.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.table-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.table-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.table-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.table-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.table-action {
  background-color: #f5f7fa;
  color: #7b4397;
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.table-card:hover .table-action {
  background-color: #7b4397;
  color: white;
}

.icon-arrow:before {
  content: "→";
}

/* 빈 상태 */
.empty-state {
  background-color: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.confirm-table {
  display: flex;
  align-items: center;
  gap: 15px;
}

.table-icon.large {
  font-size: 40px;
  margin: 0;
}

.table-info {
  flex: 1;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.confirm-message {
  font-size: 14px;
  color: #666;
  margin: 0;
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

/* Bootstrap 토스트 스타일 개선 */
.toast-container {
  pointer-events: auto;
}

.toast {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  pointer-events: auto;
  min-width: 300px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-header {
  background: linear-gradient(135deg, #7b4397, #dc2430);
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: none;
}

.toast-header strong {
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.8;
  padding: 0;
  margin: 0;
}

.btn-close:hover {
  opacity: 1;
}

.toast-body {
  padding: 12px 15px;
  color: #333;
  font-size: 14px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .table-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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