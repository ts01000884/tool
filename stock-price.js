// 台股股價查詢功能
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
      name: data.chart.result[0].meta.symbol.replace('.TW', '')
    };
  } catch (error) {
    console.error('獲取股價錯誤:', error);
    return {
      success: false,
      message: '無法獲取股票資料，請確認股票代碼是否正確'
    };
  }
}

// 股票代碼格式化 (移除空格並確保為純數字)
function formatStockCode(code) {
  return code.trim().replace(/\D/g, '');
}