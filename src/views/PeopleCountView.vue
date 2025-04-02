<template>
  <div class="people-count-wrapper">
    <h2>인원 수를 선택해주세요</h2>
    <div class="counter-box">
      <button class="count-btn" @click="decrease">＜</button>
      <span class="count-number">{{ count }}</span>
      <button class="count-btn" @click="increase">＞</button>
    </div>
    <button class="confirm-btn" @click="confirmCount">확인</button>
  </div>
</template>

<script>
export default {
  name: 'PeopleCountView',
  data() {
    return {
      count: 1,
    };
  },
  methods: {
    increase() {
      this.count++;
    },
    decrease() {
      if (this.count > 1) this.count--;
    },
    confirmCount() {
      console.log('선택된 인원 수:', this.count);
      window.location.href = `https://team08.kro.kr/ocr/page/qr?count=${this.count}`;
    }

  },
};
</script>

<style scoped>
.people-count-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Noto Sans KR', sans-serif;
  padding: 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 40px;
  color: #333;
}

.counter-box {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 40px 60px;
  border-radius: 20px;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
  min-width: 320px;
}

.count-btn {
  font-size: 36px;
  font-weight: bold;
  padding: 0 30px;
  background: none;
  border: none;
  cursor: pointer;
  color: #00b8a9;
  transition: transform 0.2s ease;
}

.count-btn:hover {
  transform: scale(1.2);
}

.count-number {
  font-size: 60px;
  font-weight: 700;
  margin: 0 50px;
  color: #333;
}

.confirm-btn {
  margin-top: 40px;
  padding: 14px 40px;
  background-color: #00b8a9;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.confirm-btn:hover {
  background-color: #008b8b;
}
</style>
