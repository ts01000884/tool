/**
 * 金融股排行榜功能
 * 提供金融類股的股價、配股/配息信息和殖利率等數據的查詢和排行功能
 */

// 主要金融股列表 (股票代碼和名稱)
const FINANCE_STOCKS = [
  { code: '2881', name: '富邦金' },
  { code: '2882', name: '國泰金' },
  { code: '2883', name: '開發金' },
  { code: '2884', name: '玉山金' },
  { code: '2885', name: '元大金' },
  { code: '2886', name: '兆豐金' },
  { code: '2887', name: '台新金' },
  { code: '2888', name: '新光金' },
  { code: '2889', name: '國票金' },
  { code: '2890', name: '永豐金' },
  { code: '2891', name: '中信金' },
  { code: '2892', name: '第一金' },
  { code: '2897', name: '王道銀' },
  { code: '5820', name: '日盛金' },
  { code: '5876', name: '上海商銀' },
  { code: '5880', name: '合庫金' }
];

// 股票資料狀態
let stocksData = [];
let maxRetries = 3;
let currentRetries = 0;
let isProcessing = false;
let sortOrder = 'none';
let failedStocks = [];

// 頁面載入後執行
document.addEventListener('DOMContentLoaded', () => {
  initializeRankPage();
});

/**
 * 初始化排行榜頁面
 */
function initializeRankPage() {
  // 初始化頁面元素和事件監聽
  bindEventHandlers();
  
  // 隱藏進度條，等待用戶操作
  const progressInfo = document.getElementById('progressInfo');
  progressInfo.style.display = 'none';
  
  // 預先顯示空表格，讓用戶知道格式
  initializeTable();
  
  // 自動開始載入資料
  setTimeout(() => {
    startDataFetching();
  }, 500);
}

/**
 * 綁定事件處理器
 */
function bindEventHandlers() {
  // 重新整理按鈕
  const refreshButton = document.getElementById('refreshAllData');
  refreshButton.addEventListener('click', () => {
    if (!isProcessing) {
      startDataFetching(true); // true 表示強制刷新
    } else {
      alert('數據正在處理中，請稍候...');
    }
  });
  
  // 排序選項
  const sortByCashYield = document.getElementById('sortByCashYield');
  const sortByTotalYield = document.getElementById('sortByTotalYield');
  
  sortByCashYield.addEventListener('change', () => {
    if (sortByCashYield.checked) {
      sortByTotalYield.checked = false;
      sortOrder = 'cash';
      renderTable();
    } else if (!sortByTotalYield.checked) {
      sortOrder = 'none';
      renderTable();
    }
  });
  
  sortByTotalYield.addEventListener('change', () => {
    if (sortByTotalYield.checked) {
      sortByCashYield.checked = false;
      sortOrder = 'total';
      renderTable();
    } else if (!sortByCashYield.checked) {
      sortOrder = 'none';
      renderTable();
    }
  });
}

/**
 * 初始化股票排行表格結構
 */
function initializeTable() {
  const table = document.getElementById('stockRankTable');
  const loadingIndicator = document.querySelector('.data-loading');
  
  // 隱藏載入指示器，顯示表格
  loadingIndicator.style.display = 'none';
  table.style.display = 'table';
  
  // 清空表格內容
  const tbody = document.getElementById('stockRankBody');
  tbody.innerHTML = '';
  
  // 添加提示訊息行
  const messageRow = document.createElement('tr');
  messageRow.innerHTML = `
    <td colspan="10" style="text-align: center; padding: 20px;">
      準備載入金融股資料，請稍候...
    </td>
  `;
  tbody.appendChild(messageRow);
}

/**
 * 開始獲取所有股票資料
 * @param {boolean} forceRefresh 是否強制重新整理資料
 */
function startDataFetching(forceRefresh = false) {
  // 重置資料和狀態
  stocksData = [];
  failedStocks = [];
  isProcessing = true;
  currentRetries = 0;
  
  // 顯示進度條
  const progressInfo = document.getElementById('progressInfo');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  progressInfo.style.display = 'block';
  progressBar.style.width = '0%';
  progressText.textContent = '準備獲取資料...';
  
  // 初始化表格
  initializeTable();
  
  // 逐一獲取每支股票的資料
  fetchStocksData(forceRefresh);
}

/**
 * 獲取所有股票資料
 * @param {boolean} forceRefresh 是否強制刷新
 */
async function fetchStocksData(forceRefresh = false) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  // 計算總股票數量
  const totalStocks = FINANCE_STOCKS.length;
  
  // 重設失敗股票列表
  failedStocks = [];
  
  // 逐一獲取股票資料
  for (let i = 0; i < totalStocks; i++) {
    const stock = FINANCE_STOCKS[i];
    const progress = Math.floor((i / totalStocks) * 100);
    
    // 更新進度條和文字
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `正在獲取 ${stock.code} ${stock.name} 的資料... (${i+1}/${totalStocks})`;
    
    try {
      // 獲取股價資料
      const priceResult = await fetchStockPrice(stock.code, forceRefresh);
      
      // 檢查是否成功獲取股價
      if (priceResult.success) {
        // 獲取配息配股資料
        const dividendInfo = getDividendInfo(stock.code);
        
        // 計算殖利率
        const price = priceResult.price;
        const cashYield = calculateCashYield(price, dividendInfo.cash);
        const stockYield = calculateStockYield(price, dividendInfo.stock);
        const totalYield = cashYield + stockYield;
        
        // 將資料添加到列表
        stocksData.push({
          code: stock.code,
          name: stock.name,
          price: price,
          cashDividend: dividendInfo.cash,
          stockDividend: dividendInfo.stock,
          cashYield: cashYield,
          stockYield: stockYield,
          totalYield: totalYield,
          dividendDate: dividendInfo.date,
          priceTimestamp: priceResult.timestamp,
          isCache: priceResult.isCache || priceResult.isOldCache,
          isConfirmedDividend: dividendInfo.isConfirmed,
          isEstimatedDividend: dividendInfo.isEstimated
        });
      } else {
        // 如果獲取失敗，加入失敗列表
        failedStocks.push(stock);
      }
    } catch (error) {
      console.error(`獲取 ${stock.code} 資料失敗:`, error);
      failedStocks.push(stock);
    }
    
    // 每次獲取後稍微暫停，避免API限制
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // 如果有失敗的股票且重試次數未超出限制，嘗試重新獲取
  if (failedStocks.length > 0 && currentRetries < maxRetries) {
    currentRetries++;
    progressText.textContent = `部分股票資料獲取失敗，正在重試 (${currentRetries}/${maxRetries})...`;
    await retryFailedStocks(forceRefresh);
  }
  
  // 完成資料獲取，渲染表格
  progressBar.style.width = '100%';
  progressText.textContent = `資料獲取完成，顯示 ${stocksData.length} 支股票資料，失敗 ${failedStocks.length} 支`;
  
  // 渲染表格
  renderTable();
  
  // 完成處理
  isProcessing = false;
}

/**
 * 重試獲取失敗的股票資料
 * @param {boolean} forceRefresh 是否強制刷新
 */
async function retryFailedStocks(forceRefresh = false) {
  const progressText = document.getElementById('progressText');
  const stocksToRetry = [...failedStocks];
  failedStocks = [];
  
  for (const stock of stocksToRetry) {
    progressText.textContent = `正在重試獲取 ${stock.code} ${stock.name} 的資料...`;
    
    try {
      // 獲取股價資料
      const priceResult = await fetchStockPrice(stock.code, forceRefresh);
      
      // 檢查是否成功獲取股價
      if (priceResult.success) {
        // 獲取配息配股資料
        const dividendInfo = getDividendInfo(stock.code);
        
        // 計算殖利率
        const price = priceResult.price;
        const cashYield = calculateCashYield(price, dividendInfo.cash);
        const stockYield = calculateStockYield(price, dividendInfo.stock);
        const totalYield = cashYield + stockYield;
        
        // 將資料添加到列表
        stocksData.push({
          code: stock.code,
          name: stock.name,
          price: price,
          cashDividend: dividendInfo.cash,
          stockDividend: dividendInfo.stock,
          cashYield: cashYield,
          stockYield: stockYield,
          totalYield: totalYield,
          dividendDate: dividendInfo.date,
          priceTimestamp: priceResult.timestamp,
          isCache: priceResult.isCache || priceResult.isOldCache,
          isConfirmedDividend: dividendInfo.isConfirmed,
          isEstimatedDividend: dividendInfo.isEstimated
        });
      } else {
        // 如果獲取仍然失敗，保留在失敗列表
        failedStocks.push(stock);
      }
    } catch (error) {
      console.error(`重試獲取 ${stock.code} 資料失敗:`, error);
      failedStocks.push(stock);
    }
    
    // 暫停避免API限制
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * 獲取股票的配息配股資訊
 * @param {string} stockCode 股票代碼
 * @returns {Object} 配息配股資訊
 */
function getDividendInfo(stockCode) {
  // 從window對象獲取API獲取的配息資料
  const dividendData = window.dividendData || [];
  
  // 先查找API獲取到的實際配息資料
  const dividendInfo = dividendData.find(item => item.Code === stockCode);
  
  if (dividendInfo && dividendInfo.CashDividend) {
    // 有正式公佈的配息資料
    return {
      cash: parseFloat(dividendInfo.CashDividend) || 0,
      stock: parseFloat(dividendInfo.StockDividendRatio) || 0,
      date: formatTWDate(dividendInfo.Date),
      isConfirmed: true,
      isEstimated: false
    };
  }
  
  // 如果API數據中有這支股票但沒有配息金額，表示有除權息日期但金額未定
  const hasDividendDate = dividendData.find(item => item.Code === stockCode && item.Exdividend === '息');
  
  if (hasDividendDate) {
    return {
      cash: 0,
      stock: 0,
      date: formatTWDate(hasDividendDate.Date),
      isConfirmed: false,
      isEstimated: false
    };
  }
  
  // 返回空的預估資料
  return {
    cash: 0,
    stock: 0,
    date: '無資料',
    isConfirmed: false,
    isEstimated: false
  };
}

/**
 * 將民國日期格式(YYYMMDD)轉換為標準日期格式(YYYY/MM/DD)
 * @param {string} twDate 民國日期字串，如"1140423"
 * @returns {string} 標準日期格式
 */
function formatTWDate(twDate) {
  if (!twDate || twDate.length !== 7) return '暫無資料';
  
  try {
    const year = parseInt(twDate.substring(0, 3)) + 1911;
    const month = twDate.substring(3, 5);
    const day = twDate.substring(5, 7);
    
    return `${year}/${month}/${day}`;
  } catch (e) {
    return twDate;
  }
}

/**
 * 計算現金殖利率
 * @param {number} price 股價
 * @param {number} cashDividend 現金股利
 * @returns {number} 現金殖利率百分比
 */
function calculateCashYield(price, cashDividend) {
  if (!price || price <= 0 || !cashDividend) return 0;
  return (cashDividend / price) * 100;
}

/**
 * 計算股票殖利率
 * @param {number} price 股價
 * @param {number} stockDividend 股票股利
 * @returns {number} 股票殖利率百分比
 */
function calculateStockYield(price, stockDividend) {
  if (!price || price <= 0 || !stockDividend) return 0;
  return (stockDividend * 10 / price) * 100; // 股票股利通常以每股配發股數表示，需乘以10
}

/**
 * 根據排序選項渲染表格
 */
function renderTable() {
  // 排序資料
  let sortedData = [...stocksData];
  
  if (sortOrder === 'cash') {
    sortedData.sort((a, b) => b.cashYield - a.cashYield);
  } else if (sortOrder === 'total') {
    sortedData.sort((a, b) => b.totalYield - a.totalYield);
  } else {
    // 默認按股票代碼排序
    sortedData.sort((a, b) => a.code.localeCompare(b.code));
  }
  
  // 清空表格內容
  const tbody = document.getElementById('stockRankBody');
  tbody.innerHTML = '';
  
  // 如果沒有數據，顯示提示
  if (sortedData.length === 0) {
    const messageRow = document.createElement('tr');
    messageRow.innerHTML = `
      <td colspan="10" style="text-align: center; padding: 20px;">
        尚未獲取到股票資料，請點擊「重新整理所有資料」按鈕。
      </td>
    `;
    tbody.appendChild(messageRow);
    return;
  }
  
  // 渲染每一行資料
  sortedData.forEach(stock => {
    const row = document.createElement('tr');
    
    // 根據殖利率高低應用不同樣式
    const cashYieldClass = getYieldClass(stock.cashYield);
    const stockYieldClass = getYieldClass(stock.stockYield);
    const totalYieldClass = getYieldClass(stock.totalYield);
    
    // 根據配息資料的確認狀態設定樣式
    let cashDividendDisplay = '-';
    let stockDividendDisplay = '-';
    
    if (stock.isConfirmedDividend && stock.cashDividend > 0) {
      // 已確認的配息資料用黑體顯示
      cashDividendDisplay = `<strong>${stock.cashDividend.toFixed(2)}</strong>`;
    } else if (stock.isEstimatedDividend && stock.cashDividend > 0) {
      // 預估的配息資料用綠色顯示
      cashDividendDisplay = `<span style="color: green;">${stock.cashDividend.toFixed(2)}</span>`;
    }
    
    if (stock.isConfirmedDividend && stock.stockDividend > 0) {
      // 已確認的配股資料用黑體顯示
      stockDividendDisplay = `<strong>${stock.stockDividend.toFixed(2)}</strong>`;
    } else if (stock.isEstimatedDividend && stock.stockDividend > 0) {
      // 預估的配股資料用綠色顯示
      stockDividendDisplay = `<span style="color: green;">${stock.stockDividend.toFixed(2)}</span>`;
    }
    
    row.innerHTML = `
      <td>${stock.code}</td>
      <td>${stock.name}</td>
      <td class="number-cell">${stock.price.toFixed(2)}</td>
      <td class="number-cell">${cashDividendDisplay}</td>
      <td class="number-cell">${stockDividendDisplay}</td>
      <td class="number-cell ${cashYieldClass}">${stock.cashYield.toFixed(2)}%</td>
      <td class="number-cell ${stockYieldClass}">${stock.stockYield.toFixed(2)}%</td>
      <td class="number-cell ${totalYieldClass}">${stock.totalYield.toFixed(2)}%</td>
      <td>${stock.dividendDate}</td>
      <td class="action-cell">
        <button class="action-btn" onclick="refreshSingleStock('${stock.code}')">更新</button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  // 添加失敗的股票行
  if (failedStocks.length > 0) {
    failedStocks.forEach(stock => {
      const row = document.createElement('tr');
      row.style.backgroundColor = 'rgba(244, 67, 54, 0.05)';
      
      row.innerHTML = `
        <td>${stock.code}</td>
        <td>${stock.name}</td>
        <td colspan="7" style="text-align: center; color: #f44336;">
          無法獲取資料
        </td>
        <td class="action-cell">
          <button class="action-btn" onclick="refreshSingleStock('${stock.code}')">重試</button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  }
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

/**
 * 格式化日期字串
 * @param {string} dateStr 日期字串 (YYYY-MM-DD 格式)
 * @returns {string} 格式化後的日期
 */
function formatDateString(dateStr) {
  if (!dateStr || dateStr === '暫無資料') return '暫無資料';
  
  try {
    const [year, month, day] = dateStr.split('-');
    return `${year}/${month}/${day}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * 重新整理單一股票資料
 * @param {string} stockCode 股票代碼
 */
async function refreshSingleStock(stockCode) {
  if (isProcessing) {
    alert('正在處理其他資料，請稍候...');
    return;
  }
  
  isProcessing = true;
  
  // 找出對應的股票
  const stockIndex = stocksData.findIndex(s => s.code === stockCode);
  const failedIndex = failedStocks.findIndex(s => s.code === stockCode);
  
  // 更新進度提示
  const progressInfo = document.getElementById('progressInfo');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  progressInfo.style.display = 'block';
  progressBar.style.width = '50%';
  
  let stockName = '';
  
  // 判斷是從成功列表更新還是從失敗列表重試
  if (stockIndex >= 0) {
    stockName = stocksData[stockIndex].name;
    stocksData.splice(stockIndex, 1);
  } else if (failedIndex >= 0) {
    stockName = failedStocks[failedIndex].name;
    failedStocks.splice(failedIndex, 1);
  } else {
    // 查找股票名稱
    const stockInfo = FINANCE_STOCKS.find(s => s.code === stockCode);
    stockName = stockInfo ? stockInfo.name : stockCode;
  }
  
  progressText.textContent = `正在重新獲取 ${stockCode} ${stockName} 的資料...`;
  
  try {
    // 強制刷新獲取最新股價
    const priceResult = await fetchStockPrice(stockCode, true);
    
    if (priceResult.success) {
      // 獲取配息配股資料
      const dividendInfo = getDividendInfo(stockCode);
      
      // 計算殖利率
      const price = priceResult.price;
      const cashYield = calculateCashYield(price, dividendInfo.cash);
      const stockYield = calculateStockYield(price, dividendInfo.stock);
      const totalYield = cashYield + stockYield;
      
      // 將資料添加到列表
      stocksData.push({
        code: stockCode,
        name: stockName,
        price: price,
        cashDividend: dividendInfo.cash,
        stockDividend: dividendInfo.stock,
        cashYield: cashYield,
        stockYield: stockYield,
        totalYield: totalYield,
        dividendDate: dividendInfo.date,
        priceTimestamp: priceResult.timestamp,
        isCache: priceResult.isCache || priceResult.isOldCache,
        isConfirmedDividend: dividendInfo.isConfirmed,
        isEstimatedDividend: dividendInfo.isEstimated
      });
      
      progressText.textContent = `${stockCode} ${stockName} 資料更新成功。`;
    } else {
      // 加入失敗列表
      failedStocks.push({ code: stockCode, name: stockName });
      progressText.textContent = `${stockCode} ${stockName} 資料更新失敗。`;
    }
  } catch (error) {
    console.error(`更新 ${stockCode} 資料時發生錯誤:`, error);
    failedStocks.push({ code: stockCode, name: stockName });
    progressText.textContent = `${stockCode} ${stockName} 資料更新失敗: ${error.message}`;
  }
  
  // 完成更新
  progressBar.style.width = '100%';
  renderTable();
  isProcessing = false;
  
  // 設定定時隱藏進度條
  setTimeout(() => {
    progressInfo.style.display = 'none';
  }, 3000);
}