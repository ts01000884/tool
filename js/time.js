/**
 * 顯示目前時間功能
 * 在頁面上動態更新顯示目前時間，帶有精美樣式
 * 特別強調今天日期
 */

// 當 DOM 內容載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  initCurrentTime();
});

/**
 * 初始化時間顯示功能
 */
function initCurrentTime() {
  const timeElement = document.getElementById('currentTime');
  if (!timeElement) return;

  // 創建時間顯示的HTML結構
  timeElement.innerHTML = `
    <div class="fancy-time">
      <div class="date-part">
        <div class="today-highlight">
          <span class="day"></span>
          <span class="weekday"></span>
        </div>
        <span class="month-year"></span>
      </div>
      <div class="time-part">
        <span class="time-value"></span>
        <span class="seconds"></span>
      </div>
    </div>
  `;
  
  // 添加樣式
  addTimeStyles();

  // 立即更新一次時間
  updateCurrentTime(timeElement);
  
  // 每秒更新一次
  setInterval(() => {
    updateCurrentTime(timeElement);
  }, 1000);
}

/**
 * 更新時間顯示元素
 * @param {HTMLElement} container 時間容器元素
 */
function updateCurrentTime(container) {
  const now = new Date();
  
  // 獲取時間各部分元素
  const dayElement = container.querySelector('.day');
  const weekdayElement = container.querySelector('.weekday');
  const monthYearElement = container.querySelector('.month-year');
  const timeElement = container.querySelector('.time-value');
  const secondsElement = container.querySelector('.seconds');
  
  // 設置日期部分
  const day = now.getDate();
  const month = now.toLocaleDateString('zh-TW', { month: 'long' });
  const year = now.getFullYear();
  
  // 設置時間部分
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // 週幾
  const weekday = now.toLocaleDateString('zh-TW', { weekday: 'short' });
  
  // 更新各元素內容
  dayElement.textContent = day;
  weekdayElement.textContent = weekday;
  monthYearElement.textContent = `${month} ${year}`;
  timeElement.textContent = `${hours}:${minutes}`;
  
  // 為秒數添加動畫效果
  secondsElement.textContent = seconds;
  secondsElement.classList.remove('pulse');
  void secondsElement.offsetWidth; // 觸發重繪
  secondsElement.classList.add('pulse');
}

/**
 * 添加時間顯示的CSS樣式
 */
function addTimeStyles() {
  // 如果已經添加過樣式，則不重複添加
  if (document.getElementById('fancy-time-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'fancy-time-styles';
  style.textContent = `
    .fancy-time {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.2;
      text-align: right;
    }
    
    .date-part {
      display: flex;
      flex-direction: column;
      margin-bottom: 3px;
    }
    
    .today-highlight {
      display: flex;
      align-items: center;
      background-color: #007bff;
      color: white;
      border-radius: 8px;
      padding: 3px 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      margin-bottom: 3px;
      position: relative;
      overflow: hidden;
    }
    
    .today-highlight:before {
      content: "今天";
      position: absolute;
      font-size: 0.6em;
      top: -1px;
      left: 3px;
      background-color: #ff6b6b;
      color: white;
      padding: 1px 3px;
      border-radius: 3px;
      transform: rotate(-10deg);
      opacity: 0.8;
    }
    
    .day {
      font-size: 1.3em;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      display: inline-block;
    }
    
    .weekday {
      margin-left: 6px;
      font-size: 0.8em;
      opacity: 0.9;
      font-weight: 500;
    }
    
    .month-year {
      font-size: 0.85em;
      opacity: 0.8;
    }
    
    .time-part {
      display: flex;
      align-items: baseline;
    }
    
    .time-value {
      font-size: 1.2em;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    .seconds {
      margin-left: 3px;
      font-size: 0.85em;
      opacity: 0.7;
      min-width: 1.5em;
      text-align: left;
    }
    
    .pulse {
      animation: pulse-animation 1s ease-out;
    }
    
    @keyframes pulse-animation {
      0% {
        opacity: 1;
        transform: scale(1.2);
      }
      100% {
        opacity: 0.7;
        transform: scale(1);
      }
    }
    
    /* 深色模式適配 */
    .dark-mode .fancy-time {
      color: #e1e1e1;
    }
    
    .dark-mode .today-highlight {
      background-color: #0066cc;
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
    }
    
    .dark-mode .today-highlight:before {
      background-color: #e74c3c;
    }
  `;
  
  document.head.appendChild(style);
}