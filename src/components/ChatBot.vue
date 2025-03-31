<template>
    <div>
      <!-- 플로팅 버튼 -->
      <button 
        class="chatbot-floating-btn" 
        @click="toggleModal"
        :class="{ 'pulse': !showModal }"
      >
        <div class="btn-content">
          <i class="icon-robot"></i>
          <span>AI 도우미</span>
        </div>
      </button>
  
      <!-- 챗봇 모달 -->
      <transition name="slide-fade">
        <div v-if="showModal" class="chatbot-modal">
          <div class="chatbot-header">
            <div class="header-left">
              <div class="ai-avatar">AI</div>
              <h3>식당 운영 도우미</h3>
            </div>
            <button class="close-btn" @click="toggleModal">
              <span class="close-icon">×</span>
            </button>
          </div>
          
          <div class="chatbot-content" ref="chatContent">
            <div class="welcome-message" v-if="messages.length === 0">
              <h4>안녕하세요! 식당 운영에 관한 질문이 있으신가요?</h4>
              <div class="quick-questions-container">
                <p class="quick-questions-header">자주 묻는 질문</p>
                <div class="quick-questions">
                  <button @click="quickQuestion('요즘 트렌드 디저트 메뉴가 뭐야?')">요즘 트렌드 디저트 메뉴</button>
                  <button @click="quickQuestion('매출 증대를 위한 프로모션 아이디어')">매출 증대 프로모션 아이디어</button>
                  <button @click="quickQuestion('효율적인 재고 관리 방법')">효율적인 재고 관리 방법</button>
                </div>
              </div>
            </div>
            
            <div v-for="(msg, index) in messages" :key="index" 
                 class="chatbot-message"
                 :class="{ 'user-message': msg.role === 'user', 'ai-message': msg.role === 'assistant' }">
              <div class="message-avatar" v-if="msg.role === 'assistant'">AI</div>
              <div class="message-content">
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ getMessageTime() }}</div>
              </div>
            </div>
            
            <div v-if="isLoading" class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <div class="chatbot-input">
            <input 
              v-model="userInput" 
              placeholder="질문을 입력하세요..." 
              @keyup.enter="sendMessage"
              :disabled="isLoading"
            />
            <button 
              @click="sendMessage" 
              class="send-btn"
              :disabled="isLoading || !userInput.trim()"
            >
              <span class="send-icon">↑</span>
            </button>
          </div>
          
          <!-- 면책 문구 추가 -->
          <div class="disclaimer">
            AI 식당 운영 도우미는 실수를 할 수 있습니다. <br>
            중요한 정보는 재차 확인하세요.
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        showModal: false,
        messages: [],
        userInput: "",
        sessionId: "default-session", // 기본값; 추후 사용자별 세션 관리 가능
        isLoading: false
      };
    },
    methods: {
      toggleModal() {
        this.showModal = !this.showModal;
        if (this.showModal && this.$refs.chatContent) {
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      },
      async sendMessage() {
        if (!this.userInput.trim()) return;
        
        // 사용자 메시지 추가
        this.messages.push({ role: 'user', content: this.userInput });
        const question = this.userInput;
        this.userInput = "";
        
        // 스크롤 아래로
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        
        // 로딩 상태 시작
        this.isLoading = true;
        
        try {
          const response = await axios.post('/owner/chat', { question: question }, { params: { sessionId: this.sessionId } });
          // 응답: { answer: "챗봇 답변" }
          this.messages.push({ role: 'assistant', content: response.data.answer });
        } catch (error) {
          console.error(error);
          this.messages.push({ role: 'assistant', content: '죄송합니다. 답변을 받지 못했습니다.' });
        } finally {
          this.isLoading = false;
          // 스크롤 아래로
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      },
      scrollToBottom() {
        if (this.$refs.chatContent) {
          this.$refs.chatContent.scrollTop = this.$refs.chatContent.scrollHeight;
        }
      },
      getMessageTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      },
      quickQuestion(question) {
        this.userInput = question;
        this.sendMessage();
      }
    }
  };
  </script>
  
  <style scoped>
  /* 플로팅 버튼 스타일 수정 - 새로운 디자인 */
  .chatbot-floating-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 14px 22px;
    background: linear-gradient(135deg, #7b4397, #dc2430);
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(123, 67, 151, 0.4);
    transition: all 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  
  .chatbot-floating-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(123, 67, 151, 0.5);
    background: linear-gradient(135deg, #8e44ad, #c0392b);
  }
  
  .btn-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  /* 로봇 아이콘으로 변경 */
  .icon-robot {
    display: inline-block;
    width: 24px;
    height: 24px;
    background-color: white;
    border-radius: 50%;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .icon-robot:before {
    content: "🤖";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 14px;
  }
  
  /* 펄스 애니메이션 개선 */
  @keyframes pulse {
    0% {
      box-shadow: 0 4px 15px rgba(123, 67, 151, 0.4), 0 0 0 0 rgba(123, 67, 151, 0.7);
    }
    50% {
      box-shadow: 0 4px 15px rgba(123, 67, 151, 0.4), 0 0 0 15px rgba(123, 67, 151, 0);
    }
    100% {
      box-shadow: 0 4px 15px rgba(123, 67, 151, 0.4), 0 0 0 0 rgba(123, 67, 151, 0);
    }
  }
  
  .pulse {
    animation: pulse 2s infinite;
  }
  
  /* 챗봇 모달 */
  .chatbot-modal {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 350px;
    height: 500px;
    max-height: 70vh;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
  
  /* 슬라이드 애니메이션 */
  .slide-fade-enter-active, .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  .slide-fade-enter-from, .slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }
  
  /* 헤더 */
  .chatbot-header {
    background: linear-gradient(135deg, #7b4397, #dc2430);
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .ai-avatar {
    width: 30px;
    height: 30px;
    background-color: white;
    color: #7b4397;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
  }
  
  .chatbot-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  
  .close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: background 0.2s;
  }
  
  .close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .close-icon {
    font-size: 18px;
    line-height: 1;
  }
  
  /* 채팅 내용 */
  .chatbot-content {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-behavior: smooth;
  }
  
  .welcome-message {
    background: white;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    margin-bottom: 10px;
  }
  
  .welcome-message h4 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 14px;
  }
  
  .quick-questions-container {
    margin-top: 12px;
  }
  
  .quick-questions-header {
    font-size: 11px;
    color: #666;
    margin: 0 0 8px 0;
    font-weight: 500;
  }
  
  .quick-questions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .quick-questions button {
    background: #f0f0f0;
    border: none;
    padding: 8px 12px;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
    color: #333;
    font-size: 13px;
  }
  
  .quick-questions button:hover {
    background: #e0e0e0;
  }
  
  /* 메시지 스타일 */
  .chatbot-message {
    display: flex;
    gap: 10px;
    max-width: 85%;
  }
  
  .user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
  }
  
  .ai-message {
    align-self: flex-start;
  }
  
  .message-avatar {
    width: 30px;
    height: 30px;
    background-color: #7b4397;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    flex-shrink: 0;
  }
  
  .message-content {
    display: flex;
    flex-direction: column;
  }
  
  .message-text {
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.4;
    word-break: break-word;
  }
  
  .user-message .message-text {
    background-color: #7b4397;
    color: white;
    border-top-right-radius: 0;
  }
  
  .ai-message .message-text {
    background-color: white;
    color: #333;
    border-top-left-radius: 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  .message-time {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
    align-self: flex-end;
  }
  
  .user-message .message-time {
    margin-right: 4px;
  }
  
  .ai-message .message-time {
    margin-left: 4px;
  }
  
  /* 타이핑 인디케이터 */
  .typing-indicator {
    display: flex;
    align-items: center;
    align-self: flex-start;
    background: white;
    padding: 12px 15px;
    border-radius: 12px;
    border-top-left-radius: 0;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
  
  .typing-indicator span {
    height: 8px;
    width: 8px;
    background: #7b4397;
    border-radius: 50%;
    display: inline-block;
    margin: 0 2px;
    opacity: 0.4;
  }
  
  .typing-indicator span:nth-child(1) {
    animation: blink 1s infinite 0.1s;
  }
  .typing-indicator span:nth-child(2) {
    animation: blink 1s infinite 0.3s;
  }
  .typing-indicator span:nth-child(3) {
    animation: blink 1s infinite 0.5s;
  }
  
  @keyframes blink {
    0% { opacity: 0.4; }
    50% { opacity: 1; }
    100% { opacity: 0.4; }
  }
  
  /* 입력 영역 */
  .chatbot-input {
    display: flex;
    padding: 12px 15px;
    background: white;
    border-top: 1px solid #eee;
  }
  
  .chatbot-input input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    font-size: 14px;
    transition: border 0.2s;
  }
  
  .chatbot-input input:focus {
    border-color: #7b4397;
  }
  
  .chatbot-input input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .send-btn {
    margin-left: 8px;
    width: 36px;
    height: 36px;
    background: #7b4397;
    color: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .send-btn:hover:not(:disabled) {
    background: #6a3384;
    transform: scale(1.05);
  }
  
  .send-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .send-icon {
    font-size: 16px;
  }
  
  /* 면책 문구 스타일 */
  .disclaimer {
    font-size: 11px;
    color: #888;
    text-align: center;
    padding: 8px 15px;
    background-color: #f8f9fa;
    border-top: 1px solid #eee;
  }
  
  /* 반응형 디자인 */
  @media (max-width: 480px) {
    .chatbot-modal {
      width: 90%;
      right: 5%;
      left: 5%;
      height: 60vh;
    }
  }
  </style>