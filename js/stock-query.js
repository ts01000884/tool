/**
 * 台股股價查詢功能
 * 可在各個功能頁面重複使用的股票價格查詢模組
 */

/**
 * 從Yahoo Finance API獲取台股股價
 * @param {string} stockCode 台股股票代碼
 * @returns {Promise<Object>} 股價查詢結果
 */
async function fetchStockPrice(stockCode) {
  try {
    // 使用 Yahoo Finance API 獲取台股價格
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stockCode}.TW`);
    const data = await response.json();
    
    // 檢查是否有錯誤或無資料
    if (data.chart.error || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('無法獲取股票資料');
    }
    
    // 獲取目前股價 (最後成交價)
    const price = data.chart.result[0].meta.regularMarketPrice;
    return {
      success: true,
      price: price,
      name: data.chart.result[0].meta.symbol.replace('.TW', ''),
      timestamp: data.chart.result[0].meta.regularMarketTime
    };
  } catch (error) {
    console.error('獲取股價錯誤:', error);
    
    // 處理CORS錯誤
    if (error.message && (error.message.includes('CORS') || error.message.includes('NetworkError'))) {
      return {
        success: false,
        message: '由於瀏覽器安全限制無法直接獲取股價。請嘗試使用本地伺服器運行此頁面。'
      };
    }
    
    return {
      success: false,
      message: '無法獲取股票資料，請確認股票代碼是否正確'
    };
  }
}

/**
 * 股票代碼格式化 (移除空格並確保為純數字)
 * @param {string} code 輸入的股票代碼
 * @returns {string} 格式化後的股票代碼
 */
function formatStockCode(code) {
  return code.trim().replace(/\D/g, '');
}

/**
 * 格式化日期時間顯示
 * @param {number} timestamp Unix timestamp (秒)
 * @returns {string} 格式化後的日期時間字串
 */
function formatStockDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * 建立股票查詢元素並添加到指定容器
 * @param {HTMLElement} container 要添加股票查詢功能的容器元素
 * @param {Function} onStockPrice 查詢到股價後的回調函數 (可選)
 */
function createStockQueryElement(container, onStockPrice) {
  if (!container) return;
  
  // 建立股票查詢HTML元素
  const queryBox = document.createElement('div');
  queryBox.className = 'stock-search-box';
  queryBox.innerHTML = `
    <h3>股票價格查詢</h3>
    <div class="stock-search-form">
      <input type="text" class="stock-code-input" placeholder="輸入股票代碼" maxlength="6">
      <button class="stock-search-button">查詢股價</button>
    </div>
    <div class="stock-result"></div>
  `;
  
  // 添加到容器
  container.appendChild(queryBox);
  
  // 綁定事件處理
  const codeInput = queryBox.querySelector('.stock-code-input');
  const searchButton = queryBox.querySelector('.stock-search-button');
  const resultElement = queryBox.querySelector('.stock-result');
  
  // 查詢按鈕點擊處理
  searchButton.addEventListener('click', async () => {
    const stockCode = formatStockCode(codeInput.value);
    
    if (!stockCode || stockCode.length < 4) {
      resultElement.innerHTML = '<span class="error-message">請輸入有效的股票代碼</span>';
      return;
    }
    
    resultElement.textContent = "查詢中...";
    
    try {
      const result = await fetchStockPrice(stockCode);
      
      if (result.success) {
        const timeStr = result.timestamp ? ` (${formatStockDateTime(result.timestamp)})` : '';
        resultElement.innerHTML = `<span class="success-message">${stockCode} - 目前股價：${result.price} 元${timeStr}</span>`;
        
        // 如果有回調函數，則調用它
        if (typeof onStockPrice === 'function') {
          onStockPrice(result);
        }
      } else {
        resultElement.innerHTML = `<span class="error-message">${result.message}</span>`;
      }
    } catch (error) {
      resultElement.innerHTML = '<span class="error-message">查詢時發生錯誤，請稍後再試</span>';
    }
  });
  
  // 按Enter鍵搜尋
  codeInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      searchButton.click();
    }
  });
  
  return {
    input: codeInput,
    button: searchButton,
    result: resultElement
  };
}