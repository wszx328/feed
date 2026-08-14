// js/endings-judge.js

/**
 * 获取指定id的结局对象
 */
function getEndingById(id) {
  return ENDINGS.find(e => e.id === id) || null;
}

/**
 * 获取基础食物id列表（不包含豆汁）
 */
function getBasicFoodIds() {
  return FOODS.filter(f => f.id !== 'douzhi').map(f => f.id);
}

/**
 * 判断是否只投喂了指定列表中的食物（至少投喂一次）
 */
function hasOnlyFoods(state, allowedIds) {
  const foodCounts = state.foodCounts;
  let fedAny = false;
  for (const fid in foodCounts) {
    const count = foodCounts[fid] || 0;
    if (count > 0) {
      fedAny = true;
      if (!allowedIds.includes(fid)) return false;
    }
  }
  return fedAny;
}

/**
 * 获取实际投喂过的食物种类数
 */
function countFedFoodTypes(state) {
  return Object.values(state.foodCounts).filter(c => c > 0).length;
}

/**
 * 获取主动道具的使用总次数
 */
function getActiveItemUseCount(state) {
  const activeIds = ITEMS.filter(i => i.type === 'active').map(i => i.id);
  let total = 0;
  for (const id of activeIds) {
    total += (state.itemUses[id] || 0);
  }
  return total;
}

/**
 * 获取结束方式：'timeout' | 'player_quit' | 'forced_end'
 */
function getEndType(state) {
  if (state.forcedEnd) return 'forced_end';
  if (state.endedByPlayer) return 'player_quit';
  return 'timeout';
}

/**
 * 判断是否使用了安抚铃铛
 */
function hasUsedBell(state) {
  return (state.itemUses['soothing_bell'] || 0) > 0;
}

/**
 * 判断是否使用了沙漏
 */
function hasUsedHourglass(state) {
  return (state.itemUses['hourglass'] || 0) > 0;
}

/**
 * 判断是否使用了复制手套
 */
function hasUsedGlove(state) {
  return (state.itemUses['duplicate_glove'] || 0) > 0;
}

/**
 * 判断是否使用了占卜骰子
 */
function hasUsedDice(state) {
  return (state.itemUses['divination_dice'] || 0) > 0;
}

/* ========== 各结局判定函数 ========== */

function checkEnding1(state) {
  return state.totalFeedCount === 0 && hasUsedBell(state) && getEndType(state) === 'timeout';
}

function checkEnding2(state) {
  return state.totalFeedCount === 0 && state.forcedEnd && !hasUsedBell(state);
}

function checkEnding3(state) {
  return state.totalFeedCount >= 10 &&
         state.foodCounts['bbq_skewer'] === state.totalFeedCount &&
         state.totalFeedCount > 0;
}

function checkEnding4(state) {
  return state.totalFeedCount >= 10 &&
         state.foodCounts['bitter_melon'] === state.totalFeedCount;
}

function checkEnding5(state) {
  return state.totalFeedCount >= 10 &&
         state.foodCounts['strong_liquor'] === state.totalFeedCount;
}

function checkEnding6(state) {
  return state.totalFeedCount >= 10 &&
         state.foodCounts['rotten_meat'] === state.totalFeedCount;
}

function checkEnding7(state) {
  return state.totalFeedCount >= 10 &&
         state.foodCounts['sour_lemon'] === state.totalFeedCount;
}

function checkEnding8(state) {
  return state.totalFeedCount >= 10 &&
         state.foodCounts['chocolate'] === state.totalFeedCount;
}

function checkEnding9(state) {
  const bitter = state.foodCounts['bitter_melon'] || 0;
  const bbq = state.foodCounts['bbq_skewer'] || 0;
  return state.totalFeedCount >= 10 &&
         hasOnlyFoods(state, ['bitter_melon', 'bbq_skewer']) &&
         bitter === bbq;
}

function checkEnding10(state) {
  return state.totalFeedCount >= 15 &&
         hasOnlyFoods(state, ['rotten_meat', 'sour_lemon']);
}

function checkEnding11(state) {
  const basicIds = getBasicFoodIds();
  const allFed = basicIds.every(id => (state.foodCounts[id] || 0) > 0);
  if (!allFed) return false;
  return basicIds.every(id => {
    const count = state.foodCounts[id] || 0;
    return count >= 2 && count <= 4;
  });
}

function checkEnding12(state) {
  // 必须使用复制手套，且未使用沙漏
  return state.totalFeedCount >= 60 &&
         hasUsedGlove(state) &&
         !hasUsedHourglass(state) &&
         countFedFoodTypes(state) >= 3;
}

function checkEnding13(state) {
  const chocolate = state.foodCounts['chocolate'] || 0;
  const liquor = state.foodCounts['strong_liquor'] || 0;
  return state.totalFeedCount >= 10 &&
         hasOnlyFoods(state, ['chocolate', 'strong_liquor']) &&
         chocolate > liquor;
}

function checkEnding14(state) {
  return state.totalFeedCount > 0 && state.totalFeedCount <= 5 &&
         getEndType(state) === 'timeout';
}

function checkEnding15(state) {
  if (state.totalFeedCount < 20) return false;
  const basicIds = getBasicFoodIds();
  const zeroCountIds = basicIds.filter(id => (state.foodCounts[id] || 0) === 0);
  if (zeroCountIds.length !== 1) return false;
  return basicIds.every(id => {
    if (id === zeroCountIds[0]) return (state.foodCounts[id] || 0) === 0;
    return (state.foodCounts[id] || 0) > 0;
  });
}

function checkEnding16(state) {
  return state.warningTriggered &&
         state.firstFeedAfterWarning === 'rotten_meat' &&
         !state.forcedEnd;
}

function checkEnding17(state) {
  return state.warningTriggered &&
         state.firstFeedAfterWarning === 'chocolate' &&
         !state.forcedEnd;
}

function checkEnding18(state) {
  return state.endedByPlayer &&
         state.finalRemainingTime !== null &&
         state.finalRemainingTime > 30 &&
         state.totalFeedCount < 10;
}

function checkEnding19(state) {
  return state.endedByPlayer &&
         state.finalRemainingTime !== null &&
         state.finalRemainingTime >= 1 && state.finalRemainingTime <= 5 &&
         state.totalFeedCount === 24;
}

function checkEnding20(state) {
  if (!hasUsedBell(state)) return false;
  // 找到铃铛使用后的所有投喂记录
  const bellRecord = state.timeRecords.find(r => r.type === 'bell');
  if (!bellRecord) return false;
  const feedAfterBell = state.timeRecords.filter(r =>
    r.type === 'feed' && r.timestamp > bellRecord.timestamp
  );
  if (feedAfterBell.length === 0) return false;
  const allRotten = feedAfterBell.every(r => r.foodId === 'rotten_meat');
  const totalRotten = feedAfterBell.reduce((sum, r) => sum + r.amount, 0);
  return allRotten && totalRotten >= 1;
}

function checkEnding21(state) {
  return state.diceCorrectCount >= 3 &&
         !state.diceDefied &&
         hasUsedDice(state);
}

function checkEnding22(state) {
  const douzhi = state.foodCounts['douzhi'] || 0;
  if (douzhi !== 1) return false;
  return state.totalFeedCount >= 10;
}

function checkEnding23(state) {
  return state.totalFeedCount >= 10 &&
         hasOnlyFoods(state, ['douzhi', 'sour_lemon']);
}

function checkEnding24(state) {
  return state.totalFeedCount >= 20 &&
         state.foodCounts['douzhi'] === state.totalFeedCount;
}

function checkEnding25(state) {
  const douzhi = state.foodCounts['douzhi'] || 0;
  const chocolate = state.foodCounts['chocolate'] || 0;
  if (douzhi === 0 || chocolate === 0 || douzhi !== chocolate) return false;
  return hasOnlyFoods(state, ['douzhi', 'chocolate']) &&
         (douzhi + chocolate) >= 10;
}

function checkEnding26(state) {
  // 必须仅携带生锈钥匙，不携带其他道具
  if (state.carriedItems.length !== 1 || !state.carriedItems.includes('rusty_key')) return false;
  // 未使用任何主动道具
  if (getActiveItemUseCount(state) !== 0) return false;
  // 不主动结束，等待倒计时归零
  if (state.endedByPlayer || state.forcedEnd) return false;
  // 投喂总数精确11次（未使用手套，所以总喂入数=点击次数）
  if (state.feedClicks !== 11 || state.totalFeedCount !== 11) return false;
  // 豆汁正好2次
  if ((state.foodCounts['douzhi'] || 0) !== 2) return false;
  return true;
}

function checkEnding27(state) {
  return state.diceDefied === true;
}

function checkEnding28(state) {
  return state.carriedItems.length === CONFIG.MAX_CARRY_ITEMS &&
         getActiveItemUseCount(state) === 0 &&
         state.totalFeedCount >= 40;
}

function checkEnding29(state) {
  return hasUsedGlove(state) &&
         state.gloveMultiplier > 1 &&
         (state.endedByPlayer || state.forcedEnd);
}

function checkEnding30(state) {
  if (!hasUsedBell(state)) return false;
  if (state.bellElapsed === null) return false;
  // 距离强制结束仅剩1秒，即 elapsed ≈ 29 秒
  if (state.bellElapsed < 28.5 || state.bellElapsed > 29.5) return false;
  // 铃铛之后必须有投喂
  const bellRecord = state.timeRecords.find(r => r.type === 'bell');
  if (!bellRecord) return false;
  const feedAfterBell = state.timeRecords.some(r =>
    r.type === 'feed' && r.timestamp > bellRecord.timestamp
  );
  // 结束方式为正常超时
  return feedAfterBell && getEndType(state) === 'timeout';
}

function checkEnding31(state) {
  // 全场未触发暴走（即未触发警告）
  if (state.warningTriggered) return false;
  // 投喂次数 4-5 次
  if (state.feedClicks < 4 || state.feedClicks > 5) return false;
  // 每次投喂间隔在 10-15 秒
  const timestamps = state.feedTimestamps;
  for (let i = 1; i < timestamps.length; i++) {
    const interval = (timestamps[i] - timestamps[i - 1]) / 1000;
    if (interval < 10 || interval > 15) return false;
  }
  // 结束方式为倒计时正常归零
  return getEndType(state) === 'timeout';
}

function checkEnding32(state) {
  return state.endedByPlayer &&
         state.finalRemainingTime !== null &&
         state.finalRemainingTime >= 0.1 &&
         state.finalRemainingTime <= 0.9 &&
         state.totalFeedCount >= 15;
}

function checkEnding33(state) {
  return hasUsedHourglass(state) &&
         getEndType(state) === 'timeout' &&
         state.totalFeedCount >= 75 &&
         countFedFoodTypes(state) >= 4;
}

function checkEnding34(state) {
  return state.totalFeedCount >= 15 &&
         hasOnlyFoods(state, ['bitter_melon', 'strong_liquor', 'sour_lemon']);
}

function checkEnding35(state) {
  const chocolate = state.foodCounts['chocolate'] || 0;
  const bbq = state.foodCounts['bbq_skewer'] || 0;
  return state.totalFeedCount >= 15 &&
         hasOnlyFoods(state, ['chocolate', 'bbq_skewer']) &&
         Math.abs(chocolate - bbq) <= 2;
}

function checkEnding36(state) {
  return state.totalFeedCount >= 15 &&
         hasOnlyFoods(state, ['bitter_melon', 'rotten_meat']);
}

function checkEnding37(state) {
  if (!state.carriedItems.includes('rusty_key')) return false;
  if (state.totalFeedCount < 15) return false;
  if (!hasOnlyFoods(state, ['douzhi', 'rotten_meat', 'strong_liquor'])) return false;
  const douzhi = state.foodCounts['douzhi'] || 0;
  const rotten = state.foodCounts['rotten_meat'] || 0;
  const liquor = state.foodCounts['strong_liquor'] || 0;
  return douzhi >= 3 && rotten >= 3 && liquor >= 3;
}

function checkEnding38(state) {
  if (!state.carriedItems.includes('rusty_key')) return false;
  return state.douzhiAppearedCount >= 3 &&
         (state.foodCounts['douzhi'] || 0) === 0 &&
         state.totalFeedCount >= 20;
}

function checkEnding39(state) {
  return state.totalFeedCount <= 15 && state.totalFeedCount > 0;
}

function checkEnding40(state) {
  return state.totalFeedCount > 15;
}

/* ========== 主判定函数 ========== */
function judgeEnding(state) {
  // 特殊优先级：先判定 #31（因 #31 优先级高于 #14）
  if (checkEnding31(state)) return getEndingById(31);

  // 按结局编号从小到大依次判定，跳过 #31
  for (let id = 1; id <= 40; id++) {
    if (id === 31) continue;
    let conditionMet = false;
    switch (id) {
      case 1: conditionMet = checkEnding1(state); break;
      case 2: conditionMet = checkEnding2(state); break;
      case 3: conditionMet = checkEnding3(state); break;
      case 4: conditionMet = checkEnding4(state); break;
      case 5: conditionMet = checkEnding5(state); break;
      case 6: conditionMet = checkEnding6(state); break;
      case 7: conditionMet = checkEnding7(state); break;
      case 8: conditionMet = checkEnding8(state); break;
      case 9: conditionMet = checkEnding9(state); break;
      case 10: conditionMet = checkEnding10(state); break;
      case 11: conditionMet = checkEnding11(state); break;
      case 12: conditionMet = checkEnding12(state); break;
      case 13: conditionMet = checkEnding13(state); break;
      case 14: conditionMet = checkEnding14(state); break;
      case 15: conditionMet = checkEnding15(state); break;
      case 16: conditionMet = checkEnding16(state); break;
      case 17: conditionMet = checkEnding17(state); break;
      case 18: conditionMet = checkEnding18(state); break;
      case 19: conditionMet = checkEnding19(state); break;
      case 20: conditionMet = checkEnding20(state); break;
      case 21: conditionMet = checkEnding21(state); break;
      case 22: conditionMet = checkEnding22(state); break;
      case 23: conditionMet = checkEnding23(state); break;
      case 24: conditionMet = checkEnding24(state); break;
      case 25: conditionMet = checkEnding25(state); break;
      case 26: conditionMet = checkEnding26(state); break;
      case 27: conditionMet = checkEnding27(state); break;
      case 28: conditionMet = checkEnding28(state); break;
      case 29: conditionMet = checkEnding29(state); break;
      case 30: conditionMet = checkEnding30(state); break;
      case 32: conditionMet = checkEnding32(state); break;
      case 33: conditionMet = checkEnding33(state); break;
      case 34: conditionMet = checkEnding34(state); break;
      case 35: conditionMet = checkEnding35(state); break;
      case 36: conditionMet = checkEnding36(state); break;
      case 37: conditionMet = checkEnding37(state); break;
      case 38: conditionMet = checkEnding38(state); break;
      case 39: conditionMet = checkEnding39(state); break;
      case 40: conditionMet = checkEnding40(state); break;
    }
    if (conditionMet) {
      return getEndingById(id);
    }
  }

  // 理论上不会到达这里，但保留兜底
  return getEndingById(40);
}