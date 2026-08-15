// js/main.js

document.addEventListener('DOMContentLoaded', function() {
  try {
    updateMenuInfo();
    initUI();
  } catch (error) {
    console.error('初始化失败：', error);
  }
});