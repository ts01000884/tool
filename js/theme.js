/**
 * 主題切換功能
 * 提供網站深色模式/淺色模式切換功能
 */
// 這段程式碼會在 DOM 內容載入完成後執行

// 當 DOM 內容載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
});

/**
 * 初始化主題切換功能
 */
function initThemeToggle() {
  // 尋找切換按鈕
  const themeToggleBtn = document.getElementById('toggleDarkMode');
  if (!themeToggleBtn) return;

  // 載入先前儲存的主題設定
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // 根據儲存的設定切換主題
  setTheme(isDarkMode);
  
  // 更新按鈕文字
  updateToggleButtonText(themeToggleBtn, isDarkMode);
  
  // 綁定點擊事件
  themeToggleBtn.addEventListener('click', () => {
    // 切換主題
    const newDarkMode = !document.body.classList.contains('dark-mode');
    setTheme(newDarkMode);
    
    // 儲存設定
    localStorage.setItem('darkMode', newDarkMode);
    
    // 更新按鈕文字
    updateToggleButtonText(themeToggleBtn, newDarkMode);
  });
}

/**
 * 設定頁面主題
 * @param {boolean} isDark 是否使用深色主題
 */
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

/**
 * 更新主題切換按鈕的文字
 * @param {HTMLElement} button 按鈕元素
 * @param {boolean} isDark 目前是否為深色模式
 */
function updateToggleButtonText(button, isDark) {
  button.textContent = isDark ? '切換淺色模式' : '切換深色模式';
}