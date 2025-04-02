import { createRouter, createWebHistory } from 'vue-router'
import CustomerLoginView from '../views/CustomerLoginView.vue'
import RestaurantMenuView from '../views/RestaurantMenuView.vue'
import OrderCartView from '../views/OrderCartView.vue'
import TableOrderHistoryView from '../views/TableOrderHistoryView.vue'
import OwnerLoginView from '../views/OwnerLoginView.vue'
import RestaurantOrderHistoryView from '../views/RestaurantOrderHistoryView.vue'
import TableOrderHistoryClearView from '../views/TableOrderHistoryClearView.vue'
import OwnerMenuManageView from '../views/OwnerMenuManageView.vue'
import PaymentView from '../views/PaymentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/customer/login',
      name: 'CustomerLoginView',
      component: CustomerLoginView,
    },
    {
      // path: '/restaurant/menu',
      path: '/restaurants/:restaurantId/tables/:tableId/menu',
      name: 'RestaurantMenuView',
      component: RestaurantMenuView
    },
    {
      // path: '/order/cart',
      path: '/restaurants/:restaurantId/tables/:tableId/cart',
      name: 'OrderCartView',
      component: OrderCartView
    },
    {
      // path: "/order/table/history",
      path: "/restaurants/:restaurantId/tables/:tableId/history",
      name: "TableOrderHistoryView",
      component: TableOrderHistoryView
    },
    {
      path: "/owner/login",
      name: "OwnerLoginView",
      component: OwnerLoginView,
    },
    // 사장님 주문내역 실시간 확인
    {
      // path: "/order/restaurant/history",
      path: "/restaurants/:restaurantId/orders/history",
      name: "RestaurantOrderHistoryView",
      component: RestaurantOrderHistoryView
    },
    {
      // path: "/order/table/clear",
      path: "/restaurants/:restaurantId/tables",
      name: "TableOrderHistoryClearView",
      component: TableOrderHistoryClearView
    },
    // [CHANGED] 메뉴 관리 라우트 추가
    {
      // path: "/owner/menu/manage",
      path: "/restaurants/:restaurantId/menus/manage",
      name: "OwnerMenuManageView",
      component: OwnerMenuManageView
    },
    {
      path: "/payment",
      name: "PaymentView",
      component: PaymentView
    }
  ],
})

export default router
