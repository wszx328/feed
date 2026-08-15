// js/state.js

let gameState = null;

function initGameState(carriedItemIds) {
  const foodCounts = {};
  FOODS.forEach(f => { foodCounts[f.id] = 0; });

  gameState = {
    carriedItems: carriedItemIds || [],
    startTime: Date.now(),
    remainingTime: CONFIG.GAME_DURATION,
    finalRemainingTime: null,

    totalFeedCount: 0,
    feedClicks: 0,
    foodCounts: foodCounts,
    feedTimestamps: [],

    lastFeedTimestamp: null,
    warningTriggered: false,
    warningTriggeredAt: null,
    firstFeedAfterWarning: null,
    forcedEnd: false,
    isRampaging: false,

    endedByPlayer: false,

    itemUses: {},
    gloveMultiplier: 1,
    pendingDiceFoodId: null,
    diceCorrectCount: 0,
    diceDefied: false,
    douzhiAppearedCount: 0,

    bellElapsed: null,
    timeRecords: [],

    // 暴食假牙相关
    rageActive: false,
    rageEndTime: null,
    rageWarningActive: false,
    postRageWarningUntil: null,

    // 全红狂躁状态
    rageOverlayActive: false,
    rageOverlayEndTime: null,

    // 盲盒外卖袋
    mysteryBagUses: 0
  };

  return gameState;
}

function getGameState() {
  return gameState;
}

function updateRemainingTime(newTime) {
  if (gameState) {
    gameState.remainingTime = newTime;
  }
}

function recordFeed(foodId) {
  const state = getGameState();
  const now = Date.now();

  const multiplier = state.gloveMultiplier;
  const amount = 1 * multiplier;

  state.totalFeedCount += amount;
  state.foodCounts[foodId] += amount;
  state.feedClicks += 1;
  state.feedTimestamps.push(now);
  state.lastFeedTimestamp = now;

  if (state.warningTriggered && state.firstFeedAfterWarning === null) {
    state.firstFeedAfterWarning = foodId;
  }

  if (state.pendingDiceFoodId) {
    if (foodId === state.pendingDiceFoodId) {
      state.diceCorrectCount += 1;
    } else {
      state.diceCorrectCount = 0;
      state.diceDefied = true;
    }
    state.pendingDiceFoodId = null;
  }

  state.gloveMultiplier = 1;
  state.isRampaging = false;
  state.rageWarningActive = false; // 投喂可解除狂暴预警

  state.timeRecords.push({
    type: 'feed',
    foodId,
    amount,
    remainingTime: state.remainingTime,
    timestamp: now
  });
}

function checkRampage() {
  const state = getGameState();
  if (!state) return null;

  const now = Date.now();
  if (state.lastFeedTimestamp === null) {
    state.lastFeedTimestamp = state.startTime;
  }
  const elapsed = (now - state.lastFeedTimestamp) / 1000;

  // 动态判断警戒时间：携带耳塞则延长至20秒
  const warningTime = state.carriedItems.includes('earplug')
    ? CONFIG.EARPLUG_WARNING_TIME
    : CONFIG.WARNING_TIME;

  if (elapsed >= CONFIG.FORCE_END_TIME) {
    state.forcedEnd = true;
    return 'force_end';
  } else if (elapsed >= warningTime && !state.warningTriggered) {
    state.warningTriggered = true;
    state.warningTriggeredAt = now;
    return 'warning';
  }
  return null;
}

function useSoothingBell() {
  const state = getGameState();
  if (!state) return false;

  const now = Date.now();
  const lastTime = state.lastFeedTimestamp || state.startTime;
  const elapsed = (now - lastTime) / 1000;

  // 狂暴预警期间不可安抚
  if (state.rageWarningActive && now < (state.postRageWarningUntil || 0)) {
    return false;
  }

  if (state.isRampaging && !state.forcedEnd && elapsed < CONFIG.FORCE_END_TIME) {
    state.bellElapsed = elapsed;
    state.lastFeedTimestamp = now;
    state.warningTriggeredAt = null;
    state.isRampaging = false;
    state.itemUses['soothing_bell'] = (state.itemUses['soothing_bell'] || 0) + 1;
    state.timeRecords.push({
      type: 'bell',
      elapsed,
      remainingTime: state.remainingTime,
      timestamp: now
    });
    return true;
  }
  return false;
}

function useHourglass() {
  const state = getGameState();
  if (!state) return;

  state.remainingTime += 15;
  state.itemUses['hourglass'] = (state.itemUses['hourglass'] || 0) + 1;
  state.timeRecords.push({
    type: 'hourglass',
    remainingTime: state.remainingTime,
    timestamp: Date.now()
  });
}

function useDuplicateGlove() {
  const state = getGameState();
  if (!state) return;

  state.gloveMultiplier += 1;
  state.itemUses['duplicate_glove'] = (state.itemUses['duplicate_glove'] || 0) + 1;
  state.timeRecords.push({
    type: 'glove',
    multiplier: state.gloveMultiplier,
    remainingTime: state.remainingTime,
    timestamp: Date.now()
  });
}

function useDivinationDice(foodId) {
  const state = getGameState();
  if (!state) return;

  state.pendingDiceFoodId = foodId;
  state.itemUses['divination_dice'] = (state.itemUses['divination_dice'] || 0) + 1;
  state.timeRecords.push({
    type: 'dice',
    foodId,
    remainingTime: state.remainingTime,
    timestamp: Date.now()
  });
}

function recordDouzhiAppeared() {
  const state = getGameState();
  if (state) {
    state.douzhiAppearedCount += 1;
  }
}

function setFinalRemainingTime(time) {
  const state = getGameState();
  if (state) {
    state.finalRemainingTime = time;
  }
}