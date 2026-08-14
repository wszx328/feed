// js/utils.js

/**
 * 生成指定范围内的随机整数 [min, max]
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机抽取一个元素
 */
function randomPick(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 将秒数格式化为两位小数字符串，例如 60.00
 */
function formatTime(seconds) {
  return seconds.toFixed(2);
}

/**
 * 判断两个浮点数是否在容差范围内相等
 */
function nearlyEqual(a, b, tolerance = 0.01) {
  return Math.abs(a - b) <= tolerance;
}

/**
 * 深拷贝一个对象或数组（简单实现，适用于纯数据）
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 防抖函数（暂时可能用不到，先放着）
 */
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 将数组随机打乱（Fisher-Yates shuffle）
 */
function shuffle(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * 计算两个时间戳之间的秒数差
 */
function secondsBetween(timestampA, timestampB) {
  return Math.abs(timestampA - timestampB) / 1000;
}

/**
 * 判断是否在区间 [min, max] 内（包含边界）
 */
function isBetween(value, min, max) {
  return value >= min && value <= max;
}