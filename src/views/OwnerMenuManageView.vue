```vue type="vue" project="Restaurant Management" file="OwnerMenuManageView.vue"
[v0-no-op-code-block-prefix]<template>
  <div class="owner-dashboard">
    <!-- 상단 헤더 -->
    <div class="dashboard-header">
      <div class="header-content">
        <h2>메뉴 관리</h2>
        <div class="restaurant-name">
          <span>{{ restaurantName }}</span>
        </div>
      </div>
      <button class="logout-btn" @click="goLogout">
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

    <!-- 카테고리 탭 -->
    <div class="category-wrapper" v-if="categories.length > 0">
      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat.menuCategoryId"
          class="category-tab"
          :class="{ active: cat.menuCategoryId === selectedCategoryId }"
          @click="selectCategory(cat.menuCategoryId)"
        >
          {{ cat.menuCategoryName }}  
        </button>
      </div>
    </div>
    <div class="empty-state" v-else>
      <div class="empty-icon">📋</div>
      <p>카테고리 정보가 없습니다.</p>
    </div>

    <!-- 대시보드 콘텐츠 -->
    <div class="dashboard-content">
      <!-- 메뉴 목록 -->
      <div class="menu-grid">
        <div class="menu-card" v-for="menu in menus" :key="menu.menuId">
          <div class="menu-image">
            <img 
              v-if="menu.menuImageUrl"
              :src="menu.menuImageUrl"
              alt="메뉴 이미지"
              @error="handleImageError"
            />
            <div class="menu-image-placeholder" v-else>
              <i class="icon-food"></i>
            </div>
          </div>
          <div class="menu-details">
            <h4 class="menu-name">{{ menu.menuName }}</h4>
            <p class="menu-price">{{ menu.price.toLocaleString() }}원</p>
            <p class="menu-description" v-if="menu.menuDescription">{{ menu.menuDescription }}</p>
          </div>
          <div class="menu-actions">
            <button class="action-btn edit" @click="openEditForm(menu)">
              <i class="icon-edit"></i>
              <span>수정</span>
            </button>
            <button class="action-btn delete" @click="deleteMenu(menu)">
              <i class="icon-delete"></i>
              <span>삭제</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="errorMessage" class="error-message">
        <i class="icon-error"></i>
        {{ errorMessage }}
      </div>
    </div>

    <!-- 메뉴 등록 버튼 -->
    <button class="add-menu-btn" @click="openCreateForm" title="메뉴 등록">
    <span>등록</span>
  </button>

    <!-- 메뉴 등록/수정 모달 -->
    <div class="modal-overlay" v-if="showFormModal">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <h3>{{ formMode === 'create' ? '메뉴 등록' : '메뉴 수정' }}</h3>
          <button class="modal-close" @click="closeFormModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>카테고리</label>
            <select v-model="formData.categoryId" class="form-control">
              <option
                v-for="cat in categories"
                :key="cat.menuCategoryId"
                :value="cat.menuCategoryId"
              >
                {{ cat.menuCategoryName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>메뉴명</label>
            <input 
              type="text" 
              v-model="formData.menuNameKr" 
              class="form-control" 
              maxlength="100" 
              placeholder="메뉴 이름을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label>메뉴 설명 <span class="optional">(선택사항)</span></label>
            <textarea 
              v-model="formData.menuDescriptionKr" 
              class="form-control" 
              maxlength="200"
              placeholder="메뉴에 대한 설명을 입력하세요 (최대 200자)"
              rows="3"
            ></textarea>
            <div class="char-count">{{ formData.menuDescriptionKr.length }}/200</div>
          </div>

          <div class="form-group">
            <label>가격 (원)</label>
            <input 
              type="number" 
              v-model="formData.price" 
              class="form-control" 
              min="0"
              placeholder="가격을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label>메뉴 이미지 URL <span class="optional">(선택사항)</span></label>
            <input 
              type="text" 
              v-model="formData.menuImageUrl" 
              class="form-control"
              placeholder="이미지 URL을 입력하세요"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeFormModal">취소</button>
          <button class="btn btn-primary" @click="saveMenu">
            {{ formMode === 'create' ? '등록' : '수정' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 메뉴 삭제 확인 모달 -->
    <div class="modal-overlay" v-if="showDeleteModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>메뉴 삭제</h3>
          <button class="modal-close" @click="cancelDelete">×</button>
        </div>
        <div class="modal-body">
          <div class="delete-confirm">
            <i class="icon-warning"></i>
            <div>
              <p class="confirm-title">{{ deleteTargetMenu.menuName }}</p>
              <p class="confirm-message">해당 메뉴를 삭제하시겠습니까?</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelDelete">취소</button>
          <button class="btn btn-danger" @click="confirmDeleteMenu">삭제</button>
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
  name: "OwnerMenuManageView",
  components: {
    ChatBot
  },
  data() {
    return {
      restaurantName: "", // [CHANGED] 실제 레스토랑 이름
      categories: [],
      menus: [],
      selectedCategoryId: null,
      errorMessage: "",
      showFormModal: false,
      formMode: "create",
      currentTab: "manage", // [CHANGED] default tab
      formData: {
        menuId: null,
        categoryId: null, // for category
        menuNameKr: "",
        menuDescriptionKr: "",
        price: 0,
        menuImageUrl: ""
      },
      // (1) [추가] 삭제 모달 상태/대상
      showDeleteModal: false,
      deleteTargetMenu: null,
      /* [CHANGED] Toast 관련 */
      toastVisible: false,
      toastMessage: "",
    };
  },
  async mounted() {
    // [CHANGED] restaurantName
    const { restaurantId } = this.$route.params;
    // Assume we have an API to get restaurantName or store it in localStorage
    const storedName = localStorage.getItem("ownerRestaurantName") || "사장님 식당";
    this.restaurantName = storedName;

    // 1) 카테고리 조회
    try {
      const catRes = await axios.get(
        `http://localhost:8080/restaurants/${restaurantId}/categories?sort=displayOrder`
      );
      if (catRes.data.success) {
        this.categories = catRes.data.data;
        if (this.categories.length > 0) {
          this.selectedCategoryId = this.categories[0].menuCategoryId;
          this.fetchMenus(this.selectedCategoryId);
        }
      } else {
        this.errorMessage = catRes.data.message || "카테고리 조회 실패.";
      }
    } catch (err) {
      this.handleError(err);
    }
  },
  methods: {
    // (A) 탭 전환: 주문내역 / 테이블내역비우기 / 메뉴관리
    goToOrdersTab() {
      this.currentTab = "orders";
      const { restaurantId } = this.$route.params;
      this.$router.push({
        name: "RestaurantOrderHistoryView",
        params: { restaurantId }
      });
    },
    goToClearTab() {
      this.currentTab = "clear";
      const { restaurantId } = this.$route.params;
      this.$router.push({
        name: "TableOrderHistoryClearView",
        params: { restaurantId }
      });
    },
    goToManageTab() {
      // 현재 화면
      this.currentTab = "manage";
    },

    async fetchMenus(catId) {
      this.errorMessage = "";
      const { restaurantId } = this.$route.params;
      try {
        const menuRes = await axios.get(
          `http://localhost:8080/restaurants/${restaurantId}/categories/${catId}/menus?sort=displayOrder`
        );
        if (menuRes.data.success) {
          this.menus = menuRes.data.data;
        } else {
          this.errorMessage = menuRes.data.message || "메뉴 조회 실패.";
        }
      } catch (err) {
        this.handleError(err);
      }
    },
    selectCategory(catId) {
      this.selectedCategoryId = catId;
  
      // 현재 선택한 카테고리 객체 찾기
      const foundCat = this.categories.find(c => c.menuCategoryId === catId);
      if (foundCat) {
        // 폼에 카테고리 한글명을 저장해서, 백엔드로 넘길 때 활용
        this.formData.categoryName = foundCat.menuCategoryName;
      }

      // 메뉴 목록 재조회
      this.fetchMenus(catId);
    },
    goLogout() {
      this.$router.push({ name: "OwnerLoginView" });
    },
    openCreateForm() {
      this.formMode = "create";
      // default category = selectedCategoryId
      const catId = this.selectedCategoryId;

      // 카테고리 목록에서 해당 ID를 찾아, 한글 카테고리명 가져오기
      let foundCat = this.categories.find(c => c.menuCategoryId === catId);
      this.formData = {
        menuId: null,
        categoryId: this.selectedCategoryId || null,
        categoryName: foundCat.menuCategoryName,
        menuNameKr: "",
        menuDescriptionKr: "",
        price: 0,
        menuImageUrl: ""
      };
      this.showFormModal = true;
    },
    openEditForm(menu) {
      this.formMode = "edit";
      const catId = this.selectedCategoryId;

      // 카테고리 목록에서 해당 ID를 찾아, 한글 카테고리명 가져오기
      let foundCat = this.categories.find(c => c.menuCategoryId === catId);
      // for now, assume "menu.categoryId" is in data or we store it
      // if not, we might store "categoryId" in the response
      this.formData = {
        menuId: menu.menuId,
        categoryId: this.selectedCategoryId,
        categoryName: foundCat.menuCategoryName,
        menuNameKr: menu.menuName, // or menu.menuNameKr if stored
        menuDescriptionKr: menu.menuDescription || "",  // if we had "menuDescription" from API
        price: menu.price,
        menuImageUrl: menu.menuImageUrl || ""
      };
      this.showFormModal = true;
    },
    closeFormModal() {
      this.showFormModal = false;
    },
    async saveMenu() {
      const { restaurantId } = this.$route.params;

      try {
        if (this.formMode === "create") {
          // (A) 등록 API
          const reqBody = {
            menuCategoryId: this.formData.categoryId,
            menuCategoryName: this.formData.categoryName, // (옵션) form에서 카테고리명 직접 변경 가능하면 입력
            menuName: this.formData.menuNameKr,
            menuDescription: this.formData.menuDescriptionKr,
            price: this.formData.price,
            menuImageUrl: this.formData.menuImageUrl
          };
          const response = await axios.post(
            `http://localhost:8080/restaurants/${restaurantId}/menus`,
            reqBody
          );
          /* (A1) 성공 응답 */
          if (response.data.success) {
            this.showToast(response.data.message || "메뉴 등록 성공!");
            // 등록 후 재조회
            if (this.selectedCategoryId) {
              this.fetchMenus(this.selectedCategoryId);
            }
          } else {
            /* (A2) 실패 응답 (ex. success=false) */
            this.showToast(response.data.message || "메뉴 등록 실패");
          }

        } else {
          // (B) 수정 API
          const reqBody = {
            // 수정 시, 백엔드가 어떤 DTO를 요구하는지에 맞춰야 함
            // 예: MenuUpdateRequest
            menuCategoryId: this.formData.categoryId,
            menuCategoryName: this.formData.categoryName, 
            menuName: this.formData.menuNameKr,
            menuDescription: this.formData.menuDescriptionKr,
            price: this.formData.price,
            menuImageUrl: this.formData.menuImageUrl
          };
          const menuId = this.formData.menuId;
          const response = await axios.put(
            `http://localhost:8080/restaurants/${restaurantId}/menus/${menuId}`,
            reqBody
          );
          if (response.data.success) {
            this.showToast(response.data.message || "메뉴 수정 성공!");
            // 수정 후 재조회
            if (this.selectedCategoryId) {
              this.fetchMenus(this.selectedCategoryId);
            }
          } else {
            this.showToast(response.data.message || "메뉴 수정 실패");
          }
        }
      } catch (err) {
        // (C) HTTP 4xx, 5xx 에러
        if (err.response) {
          const backendMsg = err.response.data.msg || err.response.data.message;
          this.showToast(backendMsg || "서버 오류가 발생했습니다.");
        } else {
          this.showToast("네트워크 오류가 발생했습니다.");
        }
      }

      this.showFormModal = false;
    },
    // (3) [CHANGED] 메뉴 삭제 로직
    deleteMenu(menu) {
      // 팝업 띄우기
      this.deleteTargetMenu = menu;
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteTargetMenu = null;
    },
    async confirmDeleteMenu() {
      if (!this.deleteTargetMenu) {
        return;
      }
      const { restaurantId } = this.$route.params;
      const menuId = this.deleteTargetMenu.menuId;

      try {
        // 예) DELETE /restaurants/{restaurantId}/menus/{menuId}
        const response = await axios.delete(
          `http://localhost:8080/restaurants/${restaurantId}/menus/${menuId}`
        );

        if (response.data.success) {
          this.showToast(response.data.message || "메뉴가 삭제되었습니다.");
          // 메뉴 목록 재조회
          if (this.selectedCategoryId) {
            this.fetchMenus(this.selectedCategoryId);
          }
        } else {
          this.showToast(response.data.message || "메뉴 삭제 실패");
        }
      } catch (err) {
        if (err.response) {
          const backendMsg = err.response.data.msg || err.response.data.message;
          this.showToast(backendMsg || "서버 오류가 발생했습니다.");
        } else {
          this.showToast("네트워크 오류가 발생했습니다.");
        }
      }

      // 모달 닫기
      this.showDeleteModal = false;
      this.deleteTargetMenu = null;
    },
    handleError(err) {
      if (err.response) {
        const backendMsg = err.response.data.msg || err.response.data.message;
        this.errorMessage = backendMsg || "서버 오류가 발생했습니다.";
      } else {
        this.errorMessage = "네트워크 오류가 발생했습니다.";
      }
    },
    /* Toast 표시 함수 */
    showToast(msg) {
      this.toastMessage = msg;
      this.toastVisible = true;
      setTimeout(() => {
        this.toastVisible = false;
      }, 3000); // 3초 후 자동 닫힘
    },
    handleImageError(e) {
      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1687375cfee%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1687375cfee%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23eee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2230%22%20y%3D%2255%22%3E이미지%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
    }
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
  padding-bottom: 80px;
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

/* 카테고리 탭 */
.category-wrapper {
  background-color: white;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
  overflow-x: auto;
}

.category-tabs {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 5px;
  padding: 10px 0;
}

.category-tab {
  padding: 8px 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 50px;
  white-space: nowrap;
}

.category-tab:hover {
  background-color: #f5f7fa;
  color: #7b4397;
}

.category-tab.active {
  background-color: #7b4397;
  color: white;
}

/* 콘텐츠 영역 */
.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 메뉴 그리드 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.menu-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.menu-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.menu-image {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.menu-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.menu-card:hover .menu-image img {
  transform: scale(1.05);
}

.menu-image-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-food:before {
  content: "🍽️";
  font-size: 48px;
  color: #ddd;
}

.menu-details {
  padding: 15px;
}

.menu-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.menu-price {
  font-size: 16px;
  font-weight: 700;
  color: #7b4397;
  margin: 0 0 10px 0;
}

.menu-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-actions {
  display: flex;
  padding: 0 15px 15px;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.action-btn.edit {
  background-color: #f0f0f0;
  color: #666;
}

.action-btn.edit:hover {
  background-color: #e0e0e0;
}

.action-btn.delete {
  background-color: #fff3f3;
  color: #dc2430;
}

.action-btn.delete:hover {
  background-color: #ffe0e0;
}

.icon-edit:before {
  content: "✏️";
  font-size: 14px;
}

.icon-delete:before {
  content: "🗑️";
  font-size: 14px;
}

/* 빈 상태 */
.empty-state {
  background-color: white;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 20px;
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

/* 메뉴 등록 버튼 */
.add-menu-btn {
    position: fixed;
    bottom: 90px;
    right: 20px;
    background: linear-gradient(135deg, #2e7d32, #4caf50);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 8px 16px;
    font-size: 15px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(46, 125, 50, 0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    z-index: 100;
  }

.add-menu-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(46, 125, 50, 0.5);
}

/* 아이콘 스타일 제거 (사용하지 않음) */
.icon-plus:before {
  content: "";
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

.modal-content.form-modal {
  width: 450px;
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

.delete-confirm {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-warning:before {
  content: "⚠️";
  font-size: 36px;
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

/* 폼 스타일 */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.optional {
  font-size: 12px;
  font-weight: normal;
  color: #999;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #7b4397;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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

.btn-danger {
  background-color: #dc2430;
  color: white;
}

.btn-danger:hover {
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
  .menu-grid {
    grid-template-columns: 1fr;
  }
  
  .tab-button {
    font-size: 14px;
    padding: 12px 8px;
  }
  
  .tab-button span {
    display: none;
  }
  
  .add-menu-btn span {
    display: none;
  }
  
  .add-menu-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>