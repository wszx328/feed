// js/shop.js

let shopCarriedItems = []; // 当前背包栏选择的道具id列表，可重复

function renderShop() {
  const shopItemsContainer = document.getElementById('shop-items');
  const shopScore = document.getElementById('shop-score-value');
  const carryCount = document.getElementById('carry-count');
  const backpackSlots = document.getElementById('backpack-slots');

  shopScore.textContent = getTotalScore();
  carryCount.textContent = `${shopCarriedItems.length} / ${CONFIG.MAX_CARRY_ITEMS}`;

  // 渲染道具卡片
  shopItemsContainer.innerHTML = '';
  ITEMS.forEach(item => {
    const owned = getItemCount(item.id);
    const card = document.createElement('div');
    card.className = 'shop-item-card';
    card.innerHTML = `
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-name">${item.name}</div>
      <div class="shop-item-effect">${item.effect}</div>
      <div class="shop-item-price">兑换所需积分：${item.price}</div>
      <div class="shop-item-owned">当前拥有：${owned}</div>
      <div class="shop-item-actions">
        <button class="btn btn-secondary btn-buy-item" data-id="${item.id}">购买</button>
        <button class="btn btn-secondary btn-carry-item" data-id="${item.id}">携带</button>
      </div>
    `;
    card.title = item.description;
    shopItemsContainer.appendChild(card);
  });

  // 绑定购买：只增加拥有数量，不自动加入背包
  document.querySelectorAll('.btn-buy-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      const item = ITEMS.find(i => i.id === itemId);
      if (!item) return;
      if (getTotalScore() < item.price) {
        showCustomModal('积分不足，无法购买。');
        return;
      }
      addTotalScore(-item.price);
      addItem(itemId, 1);
      renderShop(); // 刷新拥有数量和积分
    });
  });

  // 绑定携带：每次点击添加一个到背包（可重复），直到背包满
  document.querySelectorAll('.btn-carry-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.dataset.id;
      const owned = getItemCount(itemId);
      if (owned <= 0) {
        showCustomModal('你还没有拥有该道具，请先购买。');
        return;
      }
      // 检查背包中该道具的数量是否已经达到拥有数量
      const countInBackpack = shopCarriedItems.filter(id => id === itemId).length;
      if (countInBackpack >= owned) {
        showCustomModal('背包中该道具数量已达拥有上限。');
        return;
      }
      if (shopCarriedItems.length >= CONFIG.MAX_CARRY_ITEMS) {
        showCustomModal('背包栏已满（最多3个）。');
        return;
      }
      shopCarriedItems.push(itemId);
      renderShop();
    });
  });

  // 渲染背包栏
  renderBackpack(backpackSlots);

  // 绑定清除
  document.getElementById('btn-clear-carry').addEventListener('click', () => {
    shopCarriedItems = [];
    renderShop();
  });

  // 绑定确认
  document.getElementById('btn-confirm-carry').addEventListener('click', () => {
    // 过滤掉库存为0的（理论上不会，但防止）
    shopCarriedItems = shopCarriedItems.filter(id => getItemCount(id) > 0);
    if (shopCarriedItems.length === 0) {
      showCustomModal('请至少选择一件道具，或直接开始游戏。');
      return;
    }
    startGameWithItems(shopCarriedItems);
  });
}

function renderBackpack(container) {
  container.innerHTML = '';
  for (let i = 0; i < CONFIG.MAX_CARRY_ITEMS; i++) {
    const slot = document.createElement('div');
    slot.className = 'backpack-slot';
    if (i < shopCarriedItems.length) {
      const item = ITEMS.find(it => it.id === shopCarriedItems[i]);
      slot.classList.add('filled');
      slot.textContent = item ? `${item.icon} ${item.name}` : '';
      // 点击已携带道具可移除该特定实例
      slot.addEventListener('click', () => {
        shopCarriedItems.splice(i, 1);
        renderShop();
      });
    } else {
      slot.classList.add('empty');
      slot.textContent = '';
    }
    container.appendChild(slot);
  }
}