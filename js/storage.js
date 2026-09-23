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
      reception_pager: 0,
      glutton_denture: 0,
      memory_box: 0,
      earplug: 0,
      mystery_bag: 0,
      syringe: 0,        // 废弃针管
      ash_jar: 0,        // 香灰坛
      monocle: 0         // 肮脏的单片镜
    }
  };
}

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

function saveSave(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('保存存档失败', e);
  }
}

function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('清除存档失败', e);
  }
}

function getTotalScore() {
  return loadSave().totalScore;
}

function addTotalScore(delta) {
  const data = loadSave();
  data.totalScore = Math.max(0, data.totalScore + delta);
  saveSave(data);
  return data.totalScore;
}

function getPlayCount() {
  return loadSave().playCount;
}

function incrementPlayCount() {
  const data = loadSave();
  data.playCount += 1;
  saveSave(data);
  return data.playCount;
}

function unlockEnding(endingId) {
  const data = loadSave();
  if (!data.unlockedEndings.includes(endingId)) {
    data.unlockedEndings.push(endingId);
    saveSave(data);
  }
}

function isEndingUnlocked(endingId) {
  const data = loadSave();
  return data.unlockedEndings.includes(endingId);
}

function unlockAllEndings() {
  const data = loadSave();
  data.unlockedEndings = ENDINGS.map(e => e.id);
  saveSave(data);
}

function lockEnding(endingId) {
  const data = loadSave();
  data.unlockedEndings = data.unlockedEndings.filter(id => id !== endingId);
  saveSave(data);
}

function lockAllEndings() {
  const data = loadSave();
  data.unlockedEndings = [];
  saveSave(data);
}

function getItemCount(itemId) {
  const data = loadSave();
  return data.inventory[itemId] || 0;
}

function addItem(itemId, count = 1) {
  const data = loadSave();
  data.inventory[itemId] = (data.inventory[itemId] || 0) + count;
  saveSave(data);
  return data.inventory[itemId];
}

function removeItem(itemId, count = 1) {
  const data = loadSave();
  data.inventory[itemId] = Math.max(0, (data.inventory[itemId] || 0) - count);
  saveSave(data);
  return data.inventory[itemId];
}