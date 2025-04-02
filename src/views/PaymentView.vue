<template>
    <div>
      <!-- 뷰 진입 시 자동 결제 -->
    </div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const router = useRouter();
  
  const amount = Number(route.query.amount || 0);
  const restaurantId = localStorage.getItem('restaurantId');

  
  // 1. 결제 함수
  const onPayment = () => {
    const { IMP } = window;
    IMP.init('imp23456548'); // 아임포트 식별자
  
    const data = {
      pg: 'uplus',
      pay_method: 'card',
      merchant_uid: `mid_${new Date().getTime()}`,
      amount: amount,
      name: '하이오더 결제',
      buyer_name: '홍길동',
      buyer_tel: '01012341234',
      buyer_email: 'example@gmail.com',
      buyer_addr: '신사동 661-16',
      buyer_postcode: '06018'
    };
  
    IMP.request_pay(data, callback);
  };
  
  // 2. 콜백 함수
  const callback = async (response) => {
    const { success, error_msg, imp_uid } = response;
    const orderIds = JSON.parse(localStorage.getItem('orderIds'));
    const tableId = localStorage.getItem('tableId');

    console.log("아이디 시작");
    console.log(orderIds);
    console.log(tableId);
    console.log(success);
    console.log(imp_uid);

    const paymentData = {
        orderIds: orderIds, // orderIds 사용
        tableId: tableId || 1,
        isSuccess: success,
        paymentKey: imp_uid
    };

    console.log(paymentData);
  try {
    await axios.post('http://localhost:8082/payment', paymentData);

    if (success) {
      alert('결제 성공');
      // 결제 성공 후 추가 로직
    } else {
      alert(`결제 실패: ${error_msg}`);
    }
  } catch (error) {
    console.error('결제 정보 전송 실패:', error);
  }

  
  console.log(restaurantId);
  restaurantId = 1;
  console.log(restaurantId);
  // 결제 후 이전 화면으로 이동
  router.push({
    name: 'TableOrderHistoryClearView',
    params: { restaurantId },
    query: { amount }
  });
};

onMounted(() => {
  onPayment();
});
</script>