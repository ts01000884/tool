/**
 * 台股股價查詢功能
 * 可在各個功能頁面重複使用的股票價格查詢模組
 */

/**
 * 從Yahoo Finance API獲取台股股價，支援本地快取功能
 * @param {string} stockCode 台股股票代碼
 * @param {boolean} forceRefresh 是否強制刷新資料
 * @returns {Promise<Object>} 股價查詢結果
 */
async function fetchStockPrice(stockCode, forceRefresh = false) {
  try {
    // 檢查本地存儲是否有這支股票的資料
    const cacheKey = `stock_${stockCode}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    // 如果存在快取資料，檢查是否在10分鐘內
    if (cachedData && !forceRefresh) {
      const parsedCache = JSON.parse(cachedData);
      const currentTime = Math.floor(Date.now() / 1000);
      const cacheTime = parsedCache.timestamp;
      const timeDiff = currentTime - cacheTime;
      
      // 如果快取資料在10分鐘(600秒)內，直接使用快取
      if (timeDiff < 600) {
        console.log(`使用本地快取資料: ${stockCode}`);
        return {
          ...parsedCache,
          isCache: true,
          cacheTime: timeDiff
        };
      }
    }

    // 使用公共 CORS 代理服務來解決跨域問題
    const corsProxies = [
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://proxy.cors.sh/',
      'https://cors-proxy.htmldriven.com/?url=',
      'https://cors.eu.org/',
      'https://thingproxy.freeboard.io/fetch/',
      'https://crossorigin.me/',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://cors.bridged.cc/'
    ];
    
    // 嘗試所有代理
    let lastError = null;
    for (const proxy of corsProxies) {
      try {
        // Yahoo Finance API URL
        const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${stockCode}.TW`;
        const proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        // 檢查是否有錯誤或無資料
        if (data.chart.error || !data.chart.result || data.chart.result.length === 0) {
          throw new Error('無法獲取股票資料');
        }
        
        // 獲取目前股價和相關資訊
        const price = data.chart.result[0].meta.regularMarketPrice;
        const stockName = data.chart.result[0].meta.symbol.replace('.TW', '');
        const timestamp = Math.floor(Date.now() / 1000); // 使用當前時間而非API返回時間，更準確表示資料鮮度
        
        // 建立結果物件
        const result = {
          success: true,
          price: price,
          name: stockName,
          timestamp: timestamp
        };
        
        // 將股票資料儲存到本地快取
        localStorage.setItem(cacheKey, JSON.stringify(result));
        
        return result;
      } catch (error) {
        lastError = error;
        console.log(`代理 ${proxy} 失敗，嘗試下一個...`);
      }
    }
    
    // 所有代理都失敗了，檢查是否有本地快取資料可用
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      console.log('使用本地快取的舊資料');
      return {
        ...parsedCache,
        isOldCache: true,
        cacheTime: Math.floor(Date.now() / 1000) - parsedCache.timestamp
      };
    }
    
    // 所有方法都失敗，拋出錯誤
    throw lastError || new Error('所有代理服務都無法訪問且無本地快取');
    
  } catch (error) {
    console.error('獲取股價錯誤:', error);
    
    // 檢查是否有本地快取資料
    const cacheKey = `stock_${stockCode}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      console.log('發生錯誤，使用本地快取的舊資料');
      return {
        ...parsedCache,
        isOldCache: true,
        cacheTime: Math.floor(Date.now() / 1000) - parsedCache.timestamp
      };
    }
    
    return {
      success: false,
      message: '無法獲取股價資料，請稍後再試。'
    };
  }
}

/**
 * 從公開資料源獲取股票的配股配息資料
 * @param {string} stockCode 台股股票代碼
 * @param {boolean} forceRefresh 是否強制刷新資料
 * @returns {Promise<Object>} 配股配息查詢結果
 */
async function fetchStockDividend(stockCode, forceRefresh = false) {
  try {
    // 檢查本地存儲是否有這支股票的配息資料
    const cacheKey = `dividend_${stockCode}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    // 如果存在快取資料且不強制更新，檢查是否在24小時內
    if (cachedData && !forceRefresh) {
      const parsedCache = JSON.parse(cachedData);
      const currentTime = Math.floor(Date.now() / 1000);
      const cacheTime = parsedCache.timestamp;
      const timeDiff = currentTime - cacheTime;
      
      // 如果快取資料在24小時(86400秒)內，直接使用快取
      // 配股配息資料變動頻率低，使用較長的快取時間
      if (timeDiff < 86400) {
        console.log(`使用本地快取的配股配息資料: ${stockCode}`);
        return {
          ...parsedCache,
          isCache: true,
          cacheTime: timeDiff
        };
      }
    }

    // 使用與股價查詢相同的CORS代理服務來解決跨域問題
    const corsProxies = [
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://proxy.cors.sh/',
      'https://cors-proxy.htmldriven.com/?url=',
      'https://cors.eu.org/',
      'https://thingproxy.freeboard.io/fetch/',
      'https://crossorigin.me/',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://cors.bridged.cc/'
    ];
    
    // 嘗試所有代理
    let lastError = null;
    for (const proxy of corsProxies) {
      try {
        // 從Yahoo Finance獲取股息資料
        // 使用財務摘要API端點，包含股息資訊
        const apiUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${stockCode}.TW?modules=summaryDetail,assetProfile,financialData,defaultKeyStatistics`;
        const proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        // 檢查是否有錯誤或無資料
        if (!data || !data.quoteSummary || !data.quoteSummary.result || data.quoteSummary.result.length === 0) {
          throw new Error('無法獲取股票配息資料');
        }
        
        const timestamp = Math.floor(Date.now() / 1000);
        const summary = data.quoteSummary.result[0];
        
        // 獲取最近的配息資訊
        let cashDividend = 0;
        let dividendDate = '';
        let dividendYield = 0;
        
        // 從summaryDetail獲取股息率和最近支付日期
        if (summary.summaryDetail && summary.summaryDetail.dividendYield && summary.summaryDetail.dividendYield.raw) {
          dividendYield = summary.summaryDetail.dividendYield.raw * 100; // 轉換為百分比
        }
        
        if (summary.summaryDetail && summary.summaryDetail.exDividendDate && summary.summaryDetail.exDividendDate.fmt) {
          dividendDate = summary.summaryDetail.exDividendDate.fmt;
        }
        
        // 計算現金股利 (可根據股息率和當前股價估算)
        if (summary.summaryDetail && summary.summaryDetail.dividendRate && summary.summaryDetail.dividendRate.raw) {
          cashDividend = summary.summaryDetail.dividendRate.raw;
        } else if (dividendYield > 0 && summary.summaryDetail && summary.summaryDetail.regularMarketPrice) {
          // 如果沒有直接提供股息率，但有提供股息收益率和價格，可以反推
          const price = summary.summaryDetail.regularMarketPrice.raw;
          cashDividend = (dividendYield / 100) * price;
        }
        
        // 嘗試獲取股票股利信息 (Yahoo API中不直接提供，可能需要其他資料源)
        // 這裡我們設置一個預設值，實際應用中可能需要從台灣證交所或其他資料源獲取
        const stockDividend = 0;
        
        // 建立結果物件
        const result = {
          success: true,
          cashDividend: parseFloat(cashDividend.toFixed(2)),
          stockDividend: stockDividend,
          dividendYield: parseFloat(dividendYield.toFixed(2)),
          dividendDate: dividendDate,
          timestamp: timestamp
        };
        
        // 將配息資料儲存到本地快取
        localStorage.setItem(cacheKey, JSON.stringify(result));
        
        return result;
      } catch (error) {
        lastError = error;
        console.log(`代理 ${proxy} 獲取配息資料失敗，嘗試下一個...`);
      }
    }
    
    // 所有代理都失敗了，使用備用方案獲取資料
    const backupResult = await fetchDividendFromBackupSource(stockCode);
    if (backupResult.success) {
      return backupResult;
    }
    
    // 檢查是否有本地快取舊資料可用
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      console.log('使用本地快取的舊配息資料');
      return {
        ...parsedCache,
        isOldCache: true,
        cacheTime: Math.floor(Date.now() / 1000) - parsedCache.timestamp
      };
    }
    
    // 所有方法都失敗，拋出錯誤
    throw lastError || new Error('無法獲取配息資料且無本地快取');
    
  } catch (error) {
    console.error('獲取配息資料錯誤:', error);
    
    // 檢查是否有本地快取資料
    const cacheKey = `dividend_${stockCode}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      console.log('發生錯誤，使用本地快取的舊配息資料');
      return {
        ...parsedCache,
        isOldCache: true,
        cacheTime: Math.floor(Date.now() / 1000) - parsedCache.timestamp
      };
    }
    
    // 如果沒有快取資料，返回模擬數據
    return await getMockDividendData(stockCode);
  }
}

/**
 * 從備用數據源獲取配息資料
 * 實際應用中，可以使用其他API如台灣證交所或公開資料平台
 * @param {string} stockCode 股票代碼
 * @returns {Promise<Object>} 配息資料
 */
async function fetchDividendFromBackupSource(stockCode) {
  try {
    // 這裡可以實現從台灣證交所或其他公開資料平台獲取資料
    // 目前先返回失敗，實際使用時應替換為真實API調用
    return {
      success: false,
      message: '備用資料源暫未實現'
    };
  } catch (error) {
    console.error('從備用源獲取配息資料失敗:', error);
    return {
      success: false,
      message: '從備用資料源獲取失敗'
    };
  }
}

/**
 * 獲取模擬的配息資料 (當API不可用時的備用資料)
 * @param {string} stockCode 股票代碼
 * @returns {Promise<Object>} 模擬的配息資料
 */
async function getMockDividendData(stockCode) {
  // 根據需求不再返回模擬資料，直接返回無數據
  return {
    success: true,
    cashDividend: 0,
    stockDividend: 0,
    dividendDate: '暫無資料',
    timestamp: Math.floor(Date.now() / 1000),
    isMock: false
  };
}

/**
 * 獲取股票完整資訊 (包含股價和配息資料)
 * @param {string} stockCode 股票代碼
 * @param {boolean} forceRefresh 是否強制刷新
 * @returns {Promise<Object>} 完整股票資訊
 */
async function fetchStockFullInfo(stockCode, forceRefresh = false) {
  try {
    // 並行獲取股價和配息資料，提高效率
    const [priceResult, dividendResult] = await Promise.all([
      fetchStockPrice(stockCode, forceRefresh),
      fetchStockDividend(stockCode, forceRefresh)
    ]);
    
    // 如果股價獲取失敗，則整體視為失敗
    if (!priceResult.success) {
      return {
        success: false,
        message: priceResult.message || '無法獲取股價資料'
      };
    }
    
    // 合併股價和配息資料
    return {
      success: true,
      code: stockCode,
      name: priceResult.name,
      price: priceResult.price,
      cashDividend: dividendResult.success ? dividendResult.cashDividend : 0,
      stockDividend: dividendResult.success ? dividendResult.stockDividend : 0,
      dividendDate: dividendResult.success ? dividendResult.dividendDate : '暫無資料',
      cashYield: dividendResult.success ? calculateCashYield(priceResult.price, dividendResult.cashDividend) : 0,
      stockYield: dividendResult.success ? calculateStockYield(priceResult.price, dividendResult.stockDividend) : 0,
      timestamp: priceResult.timestamp,
      isCache: priceResult.isCache || dividendResult.isCache,
      isOldCache: priceResult.isOldCache || dividendResult.isOldCache,
      isMock: priceResult.isMock || dividendResult.isMock
    };
  } catch (error) {
    console.error('獲取股票完整資訊錯誤:', error);
    return {
      success: false,
      message: '獲取股票資訊時發生錯誤'
    };
  }
}

/**
 * 計算現金殖利率
 * @param {number} price 股價
 * @param {number} cashDividend 現金股利
 * @returns {number} 現金殖利率百分比
 */
function calculateCashYield(price, cashDividend) {
  if (!price || price <= 0) return 0;
  return (cashDividend / price) * 100;
}

/**
 * 計算股票殖利率
 * @param {number} price 股價
 * @param {number} stockDividend 股票股利
 * @returns {number} 股票殖利率百分比
 */
function calculateStockYield(price, stockDividend) {
  if (!price || price <= 0) return 0;
  return (stockDividend * 10 / price) * 100; // 股票股利通常以每股配發股數表示，需乘以10
}

/**
 * 獲取模擬的股票資料 (當API不可用時的備用方案)
 * 此功能暫時保留但不再主動使用
 * @param {string} stockCode 股票代碼
 * @returns {Promise<Object>} 模擬的股票資料
 */
async function getMockStockData(stockCode) {
  // 常見台股的模擬資料
  const mockStocks = {
    '2330': { name: '台積電', price: 930.0 },
    '2317': { name: '鴻海', price: 142.5 },
    '2308': { name: '台達電', price: 362.0 },
    '2454': { name: '聯發科', price: 1280.0 },
    '1303': { name: '南亞', price: 85.6 },
    '2412': { name: '中華電', price: 125.5 },
    '2881': { name: '富邦金', price: 80.3 },
    '2882': { name: '國泰金', price: 64.2 },
    '2303': { name: '聯電', price: 53.4 },
    '1301': { name: '台塑', price: 78.9 },
    '2002': { name: '中鋼', price: 30.5 },
    '3045': { name: '台灣大', price: 110.0 }
  };
  
  if (mockStocks[stockCode]) {
    const priceVariation = (Math.random() - 0.5) * mockStocks[stockCode].price * 0.02;
    const currentPrice = parseFloat((mockStocks[stockCode].price + priceVariation).toFixed(2));
    
    return {
      success: true,
      price: currentPrice,
      name: mockStocks[stockCode].name,
      timestamp: Math.floor(Date.now() / 1000),
      isMock: true
    };
  }
  
  // 如果沒有模擬資料，返回null
  return null;
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
      <button class="stock-refresh-button" title="強制更新資料">重新整理</button>
    </div>
    <div class="stock-result"></div>
  `;
  
  // 添加到容器
  container.appendChild(queryBox);
  
  // 綁定事件處理
  const codeInput = queryBox.querySelector('.stock-code-input');
  const searchButton = queryBox.querySelector('.stock-search-button');
  const refreshButton = queryBox.querySelector('.stock-refresh-button');
  const resultElement = queryBox.querySelector('.stock-result');
  
  // 顯示股價結果的函數
  const displayStockResult = (result, stockCode) => {
    if (result.success) {
      let statusTag = '';
      let priceClass = 'price-current';
      
      // 根據資料來源設置不同的顯示狀態
      if (result.isCache) {
        // 10分鐘內的本地快取
        const minutes = Math.floor(result.cacheTime / 60);
        const seconds = result.cacheTime % 60;
        const timeAgo = minutes > 0 ? `${minutes}分${seconds}秒前` : `${seconds}秒前`;
        statusTag = `<span class="cache-tag" style="color:#4caf50;font-size:0.85em;">[本地快取 ${timeAgo}]</span>`;
        priceClass = 'price-cached';
      } else if (result.isOldCache) {
        // 超過10分鐘的舊資料
        const minutes = Math.floor(result.cacheTime / 60);
        statusTag = `<span class="old-cache-tag" style="color:#ff9800;font-size:0.85em;">[舊資料 ${Math.floor(minutes/60)}小時${minutes%60}分鐘前]</span>`;
        priceClass = 'price-old';
      }
      
      const timeStr = result.timestamp ? `<div class="query-time">查詢時間: ${formatStockDateTime(result.timestamp)}</div>` : '';
      
      resultElement.innerHTML = `
        <div class="stock-price-result">
          <div class="stock-info">
            <span class="stock-code">${stockCode}</span>
            <span class="${priceClass}">${result.price}</span> 元
            ${statusTag}
          </div>
          ${timeStr}
        </div>
      `;
      
      // 如果有回調函數，則調用它
      if (typeof onStockPrice === 'function') {
        onStockPrice(result);
      }
    } else {
      resultElement.innerHTML = `<span class="error-message">${result.message || '查詢失敗，請稍後再試'}</span>`;
    }
  };
  
  // 查詢函數
  const queryStock = async (forceRefresh = false) => {
    const stockCode = formatStockCode(codeInput.value);
    
    if (!stockCode || stockCode.length < 4) {
      resultElement.innerHTML = '<span class="error-message">請輸入有效的股票代碼</span>';
      return;
    }
    
    resultElement.innerHTML = '<div class="loading-message">查詢中，請稍候...</div>';
    
    try {
      const result = await fetchStockPrice(stockCode, forceRefresh);
      displayStockResult(result, stockCode);
    } catch (error) {
      resultElement.innerHTML = '<span class="error-message">查詢時發生錯誤，請稍後再試</span>';
      console.error('股價查詢錯誤:', error);
    }
  };
  
  // 查詢按鈕點擊處理
  searchButton.addEventListener('click', () => queryStock(false));
  
  // 重新整理按鈕 (強制更新)
  refreshButton.addEventListener('click', () => queryStock(true));
  
  // 按Enter鍵搜尋
  codeInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      searchButton.click();
    }
  });
  
  // 添加簡單的CSS樣式
  const style = document.createElement('style');
  style.textContent = `
    .stock-search-box {
      margin: 15px 0;
      padding: 15px;
      border-radius: 8px;
      background: #f5f5f5;
    }
    .stock-search-form {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .stock-code-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .stock-search-button, .stock-refresh-button {
      padding: 8px 12px;
      background-color: #4a6baf;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .stock-refresh-button {
      background-color: #6c757d;
    }
    .stock-result {
      min-height: 24px;
      padding: 8px;
    }
    .price-current {
      font-weight: bold;
      color: #1976d2;
      font-size: 1.2em;
    }
    .price-cached {
      font-weight: bold;
      color: #4caf50;
      font-size: 1.2em;
    }
    .price-old {
      font-weight: bold;
      color: #ff9800;
      font-size: 1.2em;
    }
    .error-message {
      color: #f44336;
    }
    .loading-message {
      color: #666;
      font-style: italic;
    }
    .query-time {
      font-size: 0.8em;
      color: #666;
      margin-top: 5px;
    }
  `;
  document.head.appendChild(style);
  
  return {
    input: codeInput,
    button: searchButton,
    refreshButton: refreshButton,
    result: resultElement,
    queryStock: queryStock
  };
}

/**
 * 擴展股票查詢元素，包含配股配息資訊
 * @param {HTMLElement} container 要添加股票查詢功能的容器元素
 * @param {Function} onStockInfo 查詢到股價後的回調函數 (可選)
 */
function createStockInfoElement(container, onStockInfo) {
  if (!container) return;
  
  // 建立股票查詢HTML元素
  const queryBox = document.createElement('div');
  queryBox.className = 'stock-search-box';
  queryBox.innerHTML = `
    <h3>股票資訊查詢</h3>
    <div class="stock-search-form">
      <input type="text" class="stock-code-input" placeholder="輸入股票代碼" maxlength="6">
      <button class="stock-search-button">查詢</button>
      <button class="stock-refresh-button" title="強制更新資料">重新整理</button>
    </div>
    <div class="stock-result"></div>
  `;
  
  // 添加到容器
  container.appendChild(queryBox);
  
  // 綁定事件處理
  const codeInput = queryBox.querySelector('.stock-code-input');
  const searchButton = queryBox.querySelector('.stock-search-button');
  const refreshButton = queryBox.querySelector('.stock-refresh-button');
  const resultElement = queryBox.querySelector('.stock-result');
  
  // 顯示股票資訊結果的函數
  const displayStockResult = (result, stockCode) => {
    if (result.success) {
      let statusTag = '';
      let priceClass = 'price-current';
      
      // 根據資料來源設置不同的顯示狀態
      if (result.isCache) {
        // 快取資料
        const minutes = Math.floor(result.cacheTime / 60);
        const seconds = result.cacheTime % 60;
        const timeAgo = minutes > 0 ? `${minutes}分${seconds}秒前` : `${seconds}秒前`;
        statusTag = `<span class="cache-tag" style="color:#4caf50;font-size:0.85em;">[本地快取 ${timeAgo}]</span>`;
        priceClass = 'price-cached';
      } else if (result.isOldCache) {
        // 舊資料
        const minutes = Math.floor(result.cacheTime / 60);
        statusTag = `<span class="old-cache-tag" style="color:#ff9800;font-size:0.85em;">[舊資料 ${Math.floor(minutes/60)}小時${minutes%60}分鐘前]</span>`;
        priceClass = 'price-old';
      } else if (result.isMock) {
        // 模擬資料
        statusTag = `<span class="mock-tag" style="color:#9c27b0;font-size:0.85em;">[模擬資料]</span>`;
        priceClass = 'price-mock';
      }
      
      const timeStr = result.timestamp ? `<div class="query-time">查詢時間: ${formatStockDateTime(result.timestamp)}</div>` : '';
      
      // 顯示是否有股利資料
      const hasDividend = result.cashDividend > 0 || result.stockDividend > 0;
      const dividendInfoClass = hasDividend ? 'dividend-info' : 'no-dividend-info';
      
      // 計算總殖利率
      const totalYield = result.cashYield + result.stockYield;
      const totalYieldClass = getYieldClass(totalYield);
      
      resultElement.innerHTML = `
        <div class="stock-full-result">
          <div class="stock-info">
            <div class="stock-title">
              <span class="stock-code">${stockCode}</span>
              <span class="stock-name">${result.name || ''}</span>
              ${statusTag}
            </div>
            <div class="stock-price">
              <span class="${priceClass}">${result.price}</span> 元
            </div>
            <div class="${dividendInfoClass}">
              ${hasDividend ? `
                <div class="dividend-data">
                  <div>現金股利: <span class="cash-dividend">${result.cashDividend.toFixed(2)}</span> 元 (殖利率 <span class="${getYieldClass(result.cashYield)}">${result.cashYield.toFixed(2)}%</span>)</div>
                  <div>股票股利: <span class="stock-dividend">${result.stockDividend.toFixed(2)}</span> 股 (殖利率 <span class="${getYieldClass(result.stockYield)}">${result.stockYield.toFixed(2)}%</span>)</div>
                  <div>合計殖利率: <span class="${totalYieldClass}">${totalYield.toFixed(2)}%</span></div>
                  <div>除權息日期: ${result.dividendDate}</div>
                </div>
              ` : '<div class="no-dividend">尚無配股配息資料</div>'}
            </div>
          </div>
          ${timeStr}
        </div>
      `;
      
      // 如果有回調函數，則調用它
      if (typeof onStockInfo === 'function') {
        onStockInfo(result);
      }
    } else {
      resultElement.innerHTML = `<span class="error-message">${result.message || '查詢失敗，請稍後再試'}</span>`;
    }
  };
  
  // 查詢函數
  const queryStock = async (forceRefresh = false) => {
    const stockCode = formatStockCode(codeInput.value);
    
    if (!stockCode || stockCode.length < 4) {
      resultElement.innerHTML = '<span class="error-message">請輸入有效的股票代碼</span>';
      return;
    }
    
    resultElement.innerHTML = '<div class="loading-message">查詢中，請稍候...</div>';
    
    try {
      const result = await fetchStockFullInfo(stockCode, forceRefresh);
      displayStockResult(result, stockCode);
    } catch (error) {
      resultElement.innerHTML = '<span class="error-message">查詢時發生錯誤，請稍後再試</span>';
      console.error('股票資訊查詢錯誤:', error);
    }
  };
  
  // 查詢按鈕點擊處理
  searchButton.addEventListener('click', () => queryStock(false));
  
  // 重新整理按鈕 (強制更新)
  refreshButton.addEventListener('click', () => queryStock(true));
  
  // 按Enter鍵搜尋
  codeInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      searchButton.click();
    }
  });
  
  // 添加更多樣式
  const style = document.createElement('style');
  style.textContent = `
    .stock-full-result {
      background: #f9f9f9;
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stock-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .stock-code {
      font-weight: bold;
      font-size: 1.1em;
    }
    .stock-name {
      color: #555;
    }
    .stock-price {
      margin-bottom: 10px;
      font-size: 1.1em;
    }
    .dividend-info {
      background: rgba(25, 118, 210, 0.05);
      padding: 8px;
      border-radius: 4px;
      margin-top: 10px;
    }
    .no-dividend-info {
      color: #666;
      font-style: italic;
      margin-top: 10px;
    }
    .dividend-data {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .cash-dividend, .stock-dividend {
      font-weight: bold;
      color: #2196f3;
    }
    .yield-high {
      color: #f44336;
      font-weight: bold;
    }
    .yield-medium {
      color: #ff9800;
      font-weight: bold;
    }
    .yield-low {
      color: #4caf50;
      font-weight: bold;
    }
    .price-mock {
      font-weight: bold;
      color: #9c27b0;
      font-size: 1.2em;
    }
  `;
  document.head.appendChild(style);
  
  return {
    input: codeInput,
    button: searchButton,
    refreshButton: refreshButton,
    result: resultElement,
    queryStock: queryStock
  };
}

/**
 * 根據殖利率返回對應的CSS類別
 * @param {number} yield 殖利率數值
 * @returns {string} CSS類別名稱
 */
function getYieldClass(yield) {
  if (yield >= 5) return 'yield-high';
  if (yield >= 3) return 'yield-medium';
  return 'yield-low';
}