document.addEventListener("DOMContentLoaded", () => {
  const toggleDarkModeButton = document.getElementById("toggleDarkMode");

  // 初始化模式
  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
    toggleDarkModeButton.textContent = "切換黑暗模式";
  }

  toggleDarkModeButton.addEventListener("click", () => {
    const isDarkMode = document.body.classList.toggle("light-mode");
    toggleDarkModeButton.textContent = isDarkMode ? "切換黑暗模式" : "切換亮模式";
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
  });
});
