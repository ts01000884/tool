/**
 * 顯示目前時間功能
 * 在頁面上動態更新顯示目前時間，帶有精美樣式
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
        <span class="day"></span>
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
  dayElement.innerHTML = `${day} <small>${weekday}</small>`;
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
    
    .day {
      font-size: 1.1em;
      font-weight: 600;
      display: flex;
      align-items: baseline;
      justify-content: flex-end;
    }
    
    .day small {
      margin-left: 5px;
      font-size: 0.75em;
      opacity: 0.8;
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
  `;
  
  document.head.appendChild(style);
}