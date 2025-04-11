document.addEventListener("DOMContentLoaded", () => {
  const currentTimeElement = document.getElementById("currentTime");

  function updateTime() {
    const now = new Date();
    const formattedTime = now.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    currentTimeElement.textContent = `目前時間：${formattedTime}`;
  }

  updateTime();
  setInterval(updateTime, 1000);
});
