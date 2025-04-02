<template>
  <div>
    <button @click="onPayment">
      결제하기
    </button>
  </div>
</template>

<script setup>

import { useRoute } from 'vue-router'; 
const route = useRoute();              

const amount = Number(route.query.amount || 0); // 전달된 amount 값

const onPayment = () => {
  // 1. 가맹점 식별하기
  const { IMP } = window;
  IMP.init('imp23456548'); // 고객사 식별코드 입력시 실제 결제가 됨

  // 2. 결제 데이터 정의하기
  const data = {
    pg: 'uplus', // PG사 코드 (예: html5_inicis, kakaopay 등)
    pay_method: 'card', // 결제 수단
    merchant_uid: `mid_${new Date().getTime()}`, // 주문 번호
    amount: amount, // 결제 금액
    name: '하이오더 결제', // 주문명
    buyer_name: '홍길동', // 구매자 이름
    buyer_tel: '01012341234', // 구매자 전화번호
    buyer_email: 'example@gmail.com', // 구매자 이메일
    buyer_addr: '신사동 661-16', // 구매자 주소
    buyer_postcode: '06018' // 구매자 우편번호
  };

  // 3. 결제 창 호출하기
  IMP.request_pay(data, callback);
};

const callback = (response) => {
  // 4. 콜백 함수 정의하기
  const {
    success,
    merchant_uid,
    error_msg
  } = response;

  console.log(response);

  if (success) {
    alert('결제 성공');
  } else {
    alert(`결제 실패: ${error_msg}`);
  }
};
</script>