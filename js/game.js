// js/game.js

let gameTimer = null;
let currentFoodOptions = [];
let introTimer = null;
let pendingEnding = null;
let feedCooldownUntil = 0;
let rampageOverlayOpacity = 0;
let rampageWarningShown = false;
let playerQuitPenalty = 0; // 主动结束的扣分

function startGameWithItems(carriedItems) {
  stopGameLoops();
  playerQuitPenalty = 0; // 重置扣分
  try {
    const hasSeenIntro = localStorage.getItem('si_has_seen_intro') === 'true';
    if (!hasSeenIntro) {
      localStorage.setItem('si_has_seen_intro', 'true');
      showIntroAnimation(() => {
        actuallyStartGame(carriedItems);
      });
    } else {
      actuallyStartGame(carriedItems);
    }
  } catch (error) {
    console.error('开始游戏失败：', error);
    actuallyStartGame(carriedItems);
  }
}

function actuallyStartGame(carriedItems) {
  try {
    initGameState(carriedItems);
    const state = getGameState();

    showView('game-view');
    clearWarning();
    setReactionText(TEXTS.GAME.FEED_PROMPT || '选择食物投喂');
    updateTimerDisplay(state.remainingTime);
    renderItemBar(state.carriedItems, state.itemUses, {});
    resetRampageUI();

    feedCooldownUntil = 0;

    generateFoodOptions();
    renderFoodOptions(currentFoodOptions);

    gameTimer = setInterval(() => {
      const s = getGameState();
      if (!s) return;

      s.remainingTime -= CONFIG.TICK_INTERVAL_MS / 1000;
      if (s.remainingTime <= 0) {
        s.remainingTime = 0;
        updateTimerDisplay(0);
        stopGameLoops();
        finishGame('timeout');
        return;
      }
      updateTimerDisplay(s.remainingTime);

      handleRampageLogic();

      if (feedCooldownUntil > 0 && Date.now() >= feedCooldownUntil) {
        feedCooldownUntil = 0;
        renderFoodOptions(currentFoodOptions);
      }
    }, CONFIG.TICK_INTERVAL_MS);
  } catch (error) {
    console.error('actuallyStartGame 失败：', error);
  }
}

function showIntroAnimation(callback) {
  try {
    const introView = document.getElementById('intro-view');
    const paper = document.getElementById('intro-paper');
    const paperText = document.getElementById('intro-paper-text');
    const smoke = document.getElementById('intro-smoke');
    const eye = document.getElementById('intro-eye');

    if (!introView || !paper || !paperText || !smoke || !eye) {
      console.warn('开场动画元素缺失，直接进入游戏');
      callback();
      return;
    }

    showView('intro-view');
    paperText.textContent = TEXTS.OPENING;
    paper.classList.remove('hidden');
    smoke.classList.add('hidden');
    eye.classList.add('hidden');

    paper.addEventListener('click', function onPaperClick() {
      paper.removeEventListener('click', onPaperClick);
      paper.classList.add('hidden');
      smoke.classList.remove('hidden');
      eye.classList.remove('hidden');

      introTimer = setTimeout(() => {
        introView.classList.remove('active');
        callback();
      }, 5000);
    });
  } catch (error) {
    console.error('开场动画失败：', error);
    callback();
  }
}

function stopGameLoops() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  if (introTimer) {
    clearTimeout(introTimer);
    introTimer = null;
  }
}

function resetRampageUI() {
  const overlay = document.getElementById('rampage-overlay');
  if (overlay) overlay.style.opacity = '0';
  rampageOverlayOpacity = 0;
  rampageWarningShown = false;
  const state = getGameState();
  if (state) state.isRampaging = false;
}

function handleRampageLogic() {
  const state = getGameState();
  if (!state) return;

  const now = Date.now();
  const lastTime = state.lastFeedTimestamp || state.startTime;
  const elapsed = (now - lastTime) / 1000;

  if (elapsed >= CONFIG.FORCE_END_TIME) {
    showWarning(TEXTS.GAME.WARNING_30S);
    stopGameLoops();
    finishGame('forced_end');
    return;
  }

  if (elapsed >= CONFIG.WARNING_TIME) {
    if (!rampageWarningShown) {
      const warningText = randomPick(TEXTS.GAME.WARNING_TEXTS);
      showWarning(warningText);
      rampageWarningShown = true;
      state.warningTriggered = true;
    }
    state.isRampaging = true;

    const intensity = Math.min(1, (elapsed - CONFIG.WARNING_TIME) / (CONFIG.FORCE_END_TIME - CONFIG.WARNING_TIME));
    updateRampageOverlay(intensity);
  } else {
    state.isRampaging = false;
    if (rampageOverlayOpacity > 0) updateRampageOverlay(0);
    if (rampageWarningShown) {
      clearWarning();
      rampageWarningShown = false;
    }
  }
}

function updateRampageOverlay(intensity) {
  const overlay = document.getElementById('rampage-overlay');
  if (!overlay) return;
  overlay.style.opacity = intensity * 0.6;
  rampageOverlayOpacity = intensity;
}

function generateFoodOptions() {
  const state = getGameState();
  if (!state) return;
  const basicFoods = FOODS.filter(f => f.id !== 'douzhi');
  let options = [];
  if (state.pendingDiceFoodId) {
    const specifiedFood = FOODS.find(f => f.id === state.pendingDiceFoodId);
    if (specifiedFood) options.push(specifiedFood);
  }
  while (options.length < CONFIG.OPTIONS_PER_ROUND) {
    const randomFood = randomPick(basicFoods);
    if (!options.some(f => f.id === randomFood.id)) options.push(randomFood);
  }
  if (state.carriedItems.includes(CONFIG.DOUZHI_UNLOCK_ITEM) && !state.pendingDiceFoodId && Math.random() < CONFIG.DOUZHI_APPEAR_CHANCE) {
    const douzhi = FOODS.find(f => f.id === 'douzhi');
    const replaceIndex = randomInt(0, options.length - 1);
    options[replaceIndex] = douzhi;
    recordDouzhiAppeared();
  }
  currentFoodOptions = shuffle(options);
}

function handleFeed(foodId) {
  const state = getGameState();
  if (!state || state.remainingTime <= 0) return;
  if (feedCooldownUntil > 0 && Date.now() < feedCooldownUntil) {
    setReactionText(TEXTS.GAME.CHEWING || '祂还在咀嚼……');
    return;
  }

  recordFeed(foodId);
  const food = FOODS.find(f => f.id === foodId);
  if (food) {
    let reaction = randomPick(food.reactions);
    if (state.gloveMultiplier > 1) {
      reaction += ' ' + TEXTS.GAME.GLOVE_FEED + state.gloveMultiplier + '）';
    }
    setReactionText(reaction);
  }

  feedCooldownUntil = Date.now() + CONFIG.FEED_COOLDOWN * 1000;

  generateFoodOptions();
  renderFoodOptions(currentFoodOptions);

  clearWarning();
  renderItemBar(state.carriedItems, state.itemUses, {});
  resetRampageUI();
}

function useItem(itemId) {
  const state = getGameState();
  if (!state) return;
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return;
  if (item.type !== 'active') return;

  switch (itemId) {
    case 'hourglass':
      useHourglass();
      removeCarriedItem(itemId);
      removeItem(itemId, 1);
      updateTimerDisplay(state.remainingTime);
      renderItemBar(state.carriedItems, state.itemUses, {});
      setReactionText(TEXTS.GAME.HOURGLASS_USED);
      break;

    case 'duplicate_glove':
      useDuplicateGlove();
      removeCarriedItem(itemId);
      removeItem(itemId, 1);
      renderItemBar(state.carriedItems, state.itemUses, {});
      setReactionText(TEXTS.GAME.GLOVE_ACTIVATED + '（当前倍数：×' + state.gloveMultiplier + '）');
      break;

    case 'divination_dice': {
      const basicFoods = FOODS.filter(f => f.id !== 'douzhi');
      const choiceList = basicFoods.map(f => `${f.icon} ${f.name}`).join('\n');
      const choice = prompt('选择指定食物：\n' + choiceList);
      if (choice) {
        const selectedFood = FOODS.find(f => f.name === choice.trim() || f.icon + ' ' + f.name === choice.trim());
        if (selectedFood) {
          useDivinationDice(selectedFood.id);
          removeCarriedItem(itemId);
          removeItem(itemId, 1);
          renderItemBar(state.carriedItems, state.itemUses, {});
          setReactionText(TEXTS.GAME.DICE_USED + selectedFood.name);
        } else {
          showCustomModal('无效选择');
        }
      }
      break;
    }

    case 'soothing_bell':
      if (useSoothingBell()) {
        removeCarriedItem(itemId);
        removeItem(itemId, 1);
        clearWarning();
        resetRampageUI();
        renderItemBar(state.carriedItems, state.itemUses, {});
        setReactionText(TEXTS.GAME.BELL_USED);
        generateFoodOptions();
        renderFoodOptions(currentFoodOptions);
      } else {
        setReactionText('现在使用铃铛没有效果……');
      }
      break;

    default:
      break;
  }
}

function removeCarriedItem(itemId) {
  const state = getGameState();
  if (!state) return;
  const index = state.carriedItems.indexOf(itemId);
  if (index !== -1) {
    state.carriedItems.splice(index, 1);
  }
}

function endGameByPlayer() {
  const state = getGameState();
  if (!state) return;
  stopGameLoops();
  setFinalRemainingTime(state.remainingTime);
  state.endedByPlayer = true;

  // 主动结束随机扣除5-10积分
  playerQuitPenalty = randomInt(5, 10);
  addTotalScore(-playerQuitPenalty);

  finishGame('player_quit');
}

function finishGame(endType) {
  const state = getGameState();
  if (!state) return;
  if (endType === 'forced_end') state.forcedEnd = true;
  else if (endType === 'player_quit') state.endedByPlayer = true;
  const ending = judgeEnding(state);

  // 扣除剩余未使用的携带道具（主动道具已在使用时扣除）
  if (state.carriedItems) {
    state.carriedItems.forEach(itemId => removeItem(itemId, 1));
  }

  addTotalScore(ending.score);
  unlockEnding(ending.id);
  incrementPlayCount();
  updateMenuInfo();

  pendingEnding = ending;
  const statsParts = [`总投喂数：${state.totalFeedCount}`];
  for (const fid in state.foodCounts) {
    const count = state.foodCounts[fid];
    if (count > 0) {
      const food = FOODS.find(f => f.id === fid);
      statsParts.push(`${food ? food.name : fid}：${count}`);
    }
  }
  if (endType === 'player_quit') {
    statsParts.push(`主动结束惩罚：-${playerQuitPenalty} 积分`);
  }
  showStatsModal(statsParts.join('\n'), ending);

  gameState = null;
  currentFoodOptions = [];
  feedCooldownUntil = 0;
  resetRampageUI();
  playerQuitPenalty = 0;
}