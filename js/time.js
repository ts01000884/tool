/**
 * 顯示目前時間功能
 * 在頁面上動態更新顯示目前時間
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

  // 立即更新一次時間
  updateCurrentTime(timeElement);
  
  // 每秒更新一次
  setInterval(() => {
    updateCurrentTime(timeElement);
  }, 1000);
}

/**
 * 更新時間顯示元素
 * @param {HTMLElement} element 要更新的元素
 */
function updateCurrentTime(element) {
  const now = new Date();
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  
  // 使用台灣地區時間格式
  element.textContent = now.toLocaleDateString('zh-TW', options);
}