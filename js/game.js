// js/game.js

let gameTimer = null;
let currentFoodOptions = [];
let introTimer = null;
let pendingEnding = null;
let feedCooldownUntil = 0;
let rampageOverlayOpacity = 0;
let rampageWarningShown = false;
let playerQuitPenalty = 0;
let rageInterval = null;
let rageOverlayTimeout = null;

function startGameWithItems(carriedItems) {
  stopGameLoops();
  playerQuitPenalty = 0;
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

      // 狂暴进食期间：倒计时暂停
      if (s.rageActive) {
        if (Date.now() >= s.rageEndTime) {
          endRageMode(s);
        }
        updateTimerDisplay(s.remainingTime);
        return;
      }

      // 全红狂躁期间：倒计时继续，但禁止操作
      if (s.rageOverlayActive) {
        if (Date.now() >= s.rageOverlayEndTime) {
          hideRageOverlay(s);
        }
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
        return;
      }

      // 单片镜过期检查
      if (s.monocleActive && Date.now() >= s.monocleEndTime) {
        s.monocleActive = false;
        s.monocleEndTime = null;
        setReactionText('单片镜碎裂了，世界重新变得清晰……');
        generateFoodOptions();
        renderFoodOptions(currentFoodOptions);
      }

      // 普通倒计时
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

    // 延迟绑定监听器：避免点击“开始新游戏”的幽灵事件立即触发纸条消失
    setTimeout(() => {
      const onPaperClick = function (e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        paper.removeEventListener('pointerdown', onPaperClick);
        paper.removeEventListener('click', onPaperClick);
        paper.classList.add('hidden');
        smoke.classList.remove('hidden');
        eye.classList.remove('hidden');

        introTimer = setTimeout(() => {
          introView.classList.remove('active');
          callback();
        }, 5000);
      };
      paper.addEventListener('pointerdown', onPaperClick);
      paper.addEventListener('click', onPaperClick);
    }, 500);
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
  if (rageInterval) {
    clearInterval(rageInterval);
    rageInterval = null;
  }
  if (rageOverlayTimeout) {
    clearTimeout(rageOverlayTimeout);
    rageOverlayTimeout = null;
  }
}

function resetRampageUI() {
  const overlay = document.getElementById('rampage-overlay');
  if (overlay) overlay.style.opacity = '0';
  rampageOverlayOpacity = 0;
  rampageWarningShown = false;
  const state = getGameState();
  if (state) {
    state.isRampaging = false;
    state.rageWarningActive = false;
    state.postRageWarningUntil = null;
  }
}

function handleRampageLogic() {
  const state = getGameState();
  if (!state) return;

  if (state.rageOverlayActive) return;

  // 单片镜生效期间，暴走计时暂停
  if (state.monocleActive) return;

  const now = Date.now();
  const lastTime = state.lastFeedTimestamp || state.startTime;
  const elapsed = (now - lastTime) / 1000;

  const warningTime = state.carriedItems.includes('earplug')
    ? CONFIG.EARPLUG_WARNING_TIME
    : CONFIG.WARNING_TIME;

  if (elapsed >= CONFIG.FORCE_END_TIME) {
    showWarning(TEXTS.GAME.WARNING_30S);
    stopGameLoops();
    finishGame('forced_end');
    return;
  }

  if (elapsed >= warningTime) {
    if (!rampageWarningShown) {
      const warningText = randomPick(TEXTS.GAME.WARNING_TEXTS);
      showWarning(warningText);
      rampageWarningShown = true;
      state.warningTriggered = true;
    }
    state.isRampaging = true;
    const intensity = Math.min(1, (elapsed - warningTime) / (CONFIG.FORCE_END_TIME - warningTime));
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

// 生成乱码文本（食物名）
function generateMashText() {
  const chars = '▓▒░█▚▞▙▟◣◢◤◥◇◆※§¤×÷±≠∞√∛∜∫∬∮∯∰≋≌≍≎≏';
  const length = randomInt(2, 4);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// 生成乱码图标
function generateMashIcon() {
  const icons = ['▓', '▒', '░', '█', '▚', '▞', '▙', '▟', '◣', '◢', '◤', '◥', '◇', '◆', '※', '§', '¤', '×', '÷', '±', '≠', '∞', '√', '∛', '∜', '∫', '∬', '∮', '∯', '∰', '≋', '≌', '≍', '≎', '≏', '◉', '◈', '❖', '⬢', '⬣'];
  return randomPick(icons);
}

function generateFoodOptions() {
  const state = getGameState();
  if (!state) return;
  // 排除豆汁和香灰（它们通过特殊条件加入）
  const basicFoods = FOODS.filter(f => f.id !== 'douzhi' && f.id !== 'incense_ash');
  let options = [];

  // 骰子指定
  if (state.activeDiceFoodId) {
    const specifiedFood = FOODS.find(f => f.id === state.activeDiceFoodId);
    if (specifiedFood) {
      options.push({ ...specifiedFood });
    }
  }

  // 补足随机
  while (options.length < CONFIG.OPTIONS_PER_ROUND) {
    const randomFood = randomPick(basicFoods);
    if (!options.some(f => f.id === randomFood.id)) {
      options.push({ ...randomFood });
    }
  }

  // 香灰坛：替换所有烤串为香灰
  if (state.carriedItems.includes('ash_jar')) {
    const ashFood = FOODS.find(f => f.id === 'incense_ash');
    options = options.map(opt => opt.id === 'bbq_skewer' ? { ...ashFood } : opt);
  }

  // 豆汁替换（仅在未使用骰子指定时）
  if (state.carriedItems.includes(CONFIG.DOUZHI_UNLOCK_ITEM) && !state.activeDiceFoodId && Math.random() < CONFIG.DOUZHI_APPEAR_CHANCE) {
    const douzhi = FOODS.find(f => f.id === 'douzhi');
    const replaceIndex = randomInt(0, options.length - 1);
    options[replaceIndex] = { ...douzhi };
    recordDouzhiAppeared();
  }

  // 单片镜：名称和图标同时乱码
  if (state.monocleActive) {
    options = options.map(opt => ({
      ...opt,
      name: generateMashText(),
      icon: generateMashIcon()
    }));
  }

  currentFoodOptions = shuffle(options);
}

function generateMysteryOptions() {
  const state = getGameState();
  const mysteryFood = {
    id: 'mystery_bag',
    name: '神秘外卖袋',
    icon: '🛍️',
    emotion: '未知',
    description: '打开它，你不知道会得到什么。',
    isMystery: true
  };
  // 单片镜生效时，盲盒名称和图标也乱码
  if (state && state.monocleActive) {
    mysteryFood.name = generateMashText();
    mysteryFood.icon = generateMashIcon();
  }
  currentFoodOptions = [mysteryFood, mysteryFood, mysteryFood];
}

function handleFeed(foodId) {
  const state = getGameState();
  if (!state || state.remainingTime <= 0) return;

  if (foodId === 'mystery_bag') {
    handleMysteryBagFeed();
    return;
  }

  const ignoreCooldown = state.rageActive;
  if (!ignoreCooldown && feedCooldownUntil > 0 && Date.now() < feedCooldownUntil) {
    setReactionText(TEXTS.GAME.CHEWING || '祂还在咀嚼……');
    return;
  }

  recordFeed(foodId);

  // 单片镜期间投喂计数
  if (state.monocleActive) {
    state.monocleFeedCount += 1;
  }

  const food = FOODS.find(f => f.id === foodId);

  // 香灰：无反馈
  if (foodId === 'incense_ash') {
    setReactionText('你麻木地将一把冷硬的灰烬塞进祂的嘴里。没有任何回应。');
  } else if (food) {
    let reaction = randomPick(food.reactions);
    if (state.gloveMultiplier > 1) {
      reaction += ' ' + TEXTS.GAME.GLOVE_FEED + state.gloveMultiplier + '）';
    }
    setReactionText(reaction);
  }

  if (!ignoreCooldown) {
    feedCooldownUntil = Date.now() + CONFIG.FEED_COOLDOWN * 1000;
    generateFoodOptions();
    renderFoodOptions(currentFoodOptions);
  }

  clearWarning();
  renderItemBar(state.carriedItems, state.itemUses, {});
  resetRampageUI();
}

function handleMysteryBagFeed() {
  const state = getGameState();
  if (!state) return;

  let selectedFood;
  if (Math.random() < 0.1) {
    selectedFood = FOODS.find(f => f.id === 'douzhi');
  } else {
    const basicFoods = FOODS.filter(f => f.id !== 'douzhi' && f.id !== 'incense_ash');
    selectedFood = randomPick(basicFoods);
  }

  // 血色盲盒：单片镜生效期间开出豆汁
  if (state.monocleActive && selectedFood.id === 'douzhi') {
    state.monocleMysteryDouzhi = true;
  }

  const num = randomInt(1, 3);
  const prevMultiplier = state.gloveMultiplier;
  state.gloveMultiplier = num;
  recordFeed(selectedFood.id);
  state.gloveMultiplier = prevMultiplier;

  if (state.monocleActive) {
    state.monocleFeedCount += 1;
  }

  const reaction = randomPick(selectedFood.reactions);
  setReactionText(`打开外卖袋：${selectedFood.icon} ${selectedFood.name} ×${num}！\n${reaction}`);

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
      showFoodSelectModal((selectedFoodId) => {
        const selectedFood = FOODS.find(f => f.id === selectedFoodId);
        if (selectedFood) {
          useDivinationDice(selectedFood.id);
          removeCarriedItem(itemId);
          removeItem(itemId, 1);
          renderItemBar(state.carriedItems, state.itemUses, {});
          setReactionText(TEXTS.GAME.DICE_USED + selectedFood.name);
          generateFoodOptions();
          renderFoodOptions(currentFoodOptions);
        }
      });
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

    case 'reception_pager':
      if (getTotalScore() < CONFIG.MENU_REFRESH_COST) {
        showCustomModal('积分不足，无法使用前台传呼机。');
        return;
      }
      addTotalScore(-CONFIG.MENU_REFRESH_COST);
      generateFoodOptions();
      renderFoodOptions(currentFoodOptions);
      setReactionText('📟 后厨收到指令，新的食物已经换上。');
      state.itemUses['reception_pager'] = (state.itemUses['reception_pager'] || 0) + 1;
      renderItemBar(state.carriedItems, state.itemUses, {});
      break;

    case 'glutton_denture':
      if (state.rageActive || state.rageOverlayActive) return;
      state.rageActive = true;
      state.rageEndTime = Date.now() + CONFIG.RAGE_DURATION * 1000;
      state.itemUses['glutton_denture'] = (state.itemUses['glutton_denture'] || 0) + 1;
      removeCarriedItem(itemId);
      removeItem(itemId, 1);
      setReactionText('🦷 暴食假牙激活！快点击滑过的食物！');
      startRageScroll();
      renderItemBar(state.carriedItems, state.itemUses, {});
      break;

    case 'mystery_bag':
      if (state.mysteryBagUses >= CONFIG.MYSTERY_BAG_MAX_USES) {
        showCustomModal('本局盲盒外卖袋使用次数已用完。');
        return;
      }
      state.mysteryBagUses += 1;
      state.itemUses['mystery_bag'] = (state.itemUses['mystery_bag'] || 0) + 1;
      generateMysteryOptions();
      renderFoodOptions(currentFoodOptions);
      setReactionText('🛍️ 三个神秘外卖袋出现在你面前。');
      renderItemBar(state.carriedItems, state.itemUses, {});
      break;

    case 'syringe': {
      // 废弃针管：扣除10秒，强制投喂5份随机食物
      state.itemUses['syringe'] = (state.itemUses['syringe'] || 0) + 1;
      state.syringeUses += 1;

      // 检查剩余时间是否不足10秒
      if (state.remainingTime < CONFIG.SYRINGE_TIME_COST) {
        state.syringeLowTimeUsed = true;
        state.remainingTime = 0;
        removeCarriedItem(itemId);
        removeItem(itemId, 1);
        updateTimerDisplay(0);
        setReactionText('💉 针头扎入静脉……但时间已经不够了。');
        stopGameLoops();
        finishGame('timeout');
        return;
      }

      // 正常使用：扣除10秒
      state.remainingTime -= CONFIG.SYRINGE_TIME_COST;
      removeCarriedItem(itemId);
      removeItem(itemId, 1);

      // 强制随机投喂5份（可能包含豆汁，排除香灰）
      const eligibleFoods = FOODS.filter(f => f.id !== 'incense_ash');
      for (let i = 0; i < CONFIG.SYRINGE_FEED_COUNT; i++) {
        const food = randomPick(eligibleFoods);
        recordFeed(food.id);
      }

      updateTimerDisplay(state.remainingTime);
      renderItemBar(state.carriedItems, state.itemUses, {});
      setReactionText('💉 针头刺入静脉，生命力被强行抽出，化作五份混乱的情绪塞进祂的嘴里。');

      if (state.remainingTime <= 0) {
        state.remainingTime = 0;
        updateTimerDisplay(0);
        stopGameLoops();
        finishGame('timeout');
        return;
      }

      generateFoodOptions();
      renderFoodOptions(currentFoodOptions);
      clearWarning();
      resetRampageUI();
      break;
    }

    case 'monocle': {
      // 肮脏的单片镜：10秒乱码，暂停暴走计时
      if (state.monocleActive) {
        showCustomModal('单片镜已经在生效中。');
        return;
      }
      state.monocleActive = true;
      state.monocleEndTime = Date.now() + CONFIG.MONOCLE_DURATION * 1000;
      state.monocleUses += 1;
      state.monocleFeedCount = 0;
      state.itemUses['monocle'] = (state.itemUses['monocle'] || 0) + 1;
      // 不消耗道具（可重复使用）
      setReactionText('🧐 世界变成了一片扭曲的乱码，你失去了对现实的认知……');
      generateFoodOptions();
      renderFoodOptions(currentFoodOptions);
      renderItemBar(state.carriedItems, state.itemUses, {});
      clearWarning();
      resetRampageUI();
      break;
    }

    default:
      break;
  }
}

function startRageScroll() {
  const state = getGameState();
  if (!state) return;

  const foodOptions = document.getElementById('food-options');
  const rageScroll = document.getElementById('rage-scroll');
  const rageScrollInner = document.getElementById('rage-scroll-inner');
  if (!foodOptions || !rageScroll || !rageScrollInner) return;

  foodOptions.style.display = 'none';
  rageScroll.style.display = 'block';

  const availableFoods = FOODS.filter(f => {
    if (f.id === 'incense_ash') return false;
    if (f.id === 'douzhi') return state.carriedItems.includes('rusty_key');
    return true;
  });

  const sequence = [];
  for (let i = 0; i < 20; i++) {
    sequence.push(randomPick(availableFoods));
  }

  let scrollHTML = '';
  for (let copy = 0; copy < 2; copy++) {
    sequence.forEach(food => {
      scrollHTML += `
        <div class="rage-food-item" data-food-id="${food.id}">
          <span class="rage-food-icon">${food.icon}</span>
          <span class="rage-food-name">${food.name}</span>
        </div>
      `;
    });
  }
  rageScrollInner.innerHTML = scrollHTML;

  rageScrollInner.style.animation = 'none';
  void rageScrollInner.offsetWidth;
  rageScrollInner.style.animation = '';

  rageScroll.classList.add('active');

  if (!rageScroll._listenerAttached) {
    rageScroll.addEventListener('pointerdown', function onRagePointerDown(e) {
      const item = e.target.closest('.rage-food-item');
      if (!item) return;
      const foodId = item.dataset.foodId;
      e.preventDefault();
      handleFeed(foodId);
    });
    rageScroll._listenerAttached = true;
  }
}

function endRageMode(state) {
  state.rageActive = false;
  state.rageEndTime = null;

  const rageScroll = document.getElementById('rage-scroll');
  const rageOverlay = document.getElementById('rage-overlay');
  const foodOptions = document.getElementById('food-options');

  if (rageScroll) {
    rageScroll.classList.remove('active');
    rageScroll.style.display = 'none';
  }
  if (foodOptions) {
    foodOptions.style.display = '';
  }

  if (rageOverlay) {
    rageOverlay.style.display = 'block';
    rageOverlay.style.opacity = '1';
  }

  state.rageOverlayActive = true;
  state.rageOverlayEndTime = Date.now() + CONFIG.POST_RAGE_WARNING_DURATION * 1000;

  generateFoodOptions();
  renderFoodOptions(currentFoodOptions);

  setReactionText('🔥 狂躁！祂失控了！什么都不能做！');
}

function hideRageOverlay(state) {
  state.rageOverlayActive = false;
  state.rageOverlayEndTime = null;

  const rageOverlay = document.getElementById('rage-overlay');
  if (rageOverlay) {
    rageOverlay.style.display = 'none';
    rageOverlay.style.opacity = '0';
  }

  setReactionText('祂渐渐平静下来……');
  clearWarning();
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
  if (state.rageOverlayActive) return;

  stopGameLoops();
  setFinalRemainingTime(state.remainingTime);
  state.endedByPlayer = true;

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

  let finalScore = 0;
  const hasMemoryBox = state.carriedItems.includes('memory_box');
  const isNewEnding = !isEndingUnlocked(ending.id);

  if (hasMemoryBox) {
    if (isNewEnding) {
      finalScore = ending.score * CONFIG.MEMORY_BOX_NEW_ENDING_MULTIPLIER;
    } else {
      finalScore = ending.score - CONFIG.MEMORY_BOX_OLD_ENDING_PENALTY;
      if (finalScore < 0) finalScore = 0;
    }
  } else {
    finalScore = ending.score;
  }

  if (state.carriedItems) {
    state.carriedItems.forEach(itemId => {
      removeItem(itemId, 1);
    });
  }

  addTotalScore(finalScore);
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
  if (hasMemoryBox) {
    statsParts.push(`记忆保鲜盒效果：${isNewEnding ? '新结局积分翻倍' : '旧结局扣除10积分'}`);
  }
  showStatsModal(statsParts.join('\n'), ending);

  gameState = null;
  currentFoodOptions = [];
  feedCooldownUntil = 0;
  resetRampageUI();
  playerQuitPenalty = 0;
}