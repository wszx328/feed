// js/storage.js

const STORAGE_KEY = CONFIG.STORAGE_KEY;

/**
 * 获取默认存档结构
 */
function getDefaultSaveData() {
  return {
    totalScore: 0,
    playCount: 0,
    unlockedEndings: [],
    inventory: {
      hourglass: 0,
      duplicate_glove: 0,
      divination_dice: 0,
      soothing_bell: 0,
      rusty_key: 0,
      reception_pager: 0,     // 前台传呼机
      glutton_denture: 0,     // 暴食假牙
      memory_box: 0,          // 记忆保鲜盒
      earplug: 0,             // 劣质静音耳塞
      mystery_bag: 0          // 盲盒外卖袋
    }
  };
}

/**
 * 从 localStorage 读取存档，如果不存在或解析失败则返回默认存档
 */
function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultSaveData();
    const data = JSON.parse(raw);
    const defaults = getDefaultSaveData();
    return {
      ...defaults,
      ...data,
      inventory: {
        ...defaults.inventory,
        ...(data.inventory || {})
      }
    };
  } catch (e) {
    console.warn('读取存档失败，使用默认存档', e);
    return getDefaultSaveData();
  }
}

/**
 * 将存档数据写入 localStorage
 */
function saveSave(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存存档失败', e);
  }
}

/**
 * 清除存档（用于测试或重置）
 */
function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('清除存档失败', e);
  }
}

/**
 * 便捷方法：获取总积分
 */
function getTotalScore() {
  return loadSave().totalScore;
}

/**
 * 便捷方法：更新总积分（可传入增量或绝对值）
 */
function addTotalScore(delta) {
  const data = loadSave();
  data.totalScore = Math.max(0, data.totalScore + delta);
  saveSave(data);
  return data.totalScore;
}

/**
 * 便捷方法：获取游玩次数
 */
function getPlayCount() {
  return loadSave().playCount;
}

/**
 * 便捷方法：增加游玩次数
 */
function incrementPlayCount() {
  const data = loadSave();
  data.playCount += 1;
  saveSave(data);
  return data.playCount;
}

/**
 * 便捷方法：解锁结局
 * @param {number} endingId
 */
function unlockEnding(endingId) {
  const data = loadSave();
  if (!data.unlockedEndings.includes(endingId)) {
    data.unlockedEndings.push(endingId);
    saveSave(data);
  }
}

/**
 * 便捷方法：检查结局是否已解锁
 */
function isEndingUnlocked(endingId) {
  const data = loadSave();
  return data.unlockedEndings.includes(endingId);
}

/**
 * 便捷方法：获取道具库存数量
 * @param {string} itemId
 */
function getItemCount(itemId) {
  const data = loadSave();
  return data.inventory[itemId] || 0;
}

/**
 * 便捷方法：增加道具数量
 * @param {string} itemId
 * @param {number} count
 */
function addItem(itemId, count = 1) {
  const data = loadSave();
  data.inventory[itemId] = (data.inventory[itemId] || 0) + count;
  saveSave(data);
  return data.inventory[itemId];
}

/**
 * 便捷方法：减少道具数量
 * @param {string} itemId
 * @param {number} count
 */
function removeItem(itemId, count = 1) {
  const data = loadSave();
  data.inventory[itemId] = Math.max(0, (data.inventory[itemId] || 0) - count);
  saveSave(data);
  return data.inventory[itemId];
}