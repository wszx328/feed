// js/gallery.js

function renderGallery() {
  const galleryProgress = document.getElementById('gallery-progress');
  const galleryList = document.getElementById('gallery-list');

  const total = ENDINGS.length;
  const unlockedCount = ENDINGS.filter(e => isEndingUnlocked(e.id)).length;
  galleryProgress.textContent = `收集进度：${unlockedCount} / ${total}`;

  galleryList.innerHTML = '';
  ENDINGS.forEach(ending => {
    const unlocked = isEndingUnlocked(ending.id);
    const card = document.createElement('div');
    card.className = `gallery-card ${unlocked ? 'unlocked' : 'locked'}`;
    card.textContent = unlocked ? ending.name : '???';
    card.addEventListener('click', () => {
      if (unlocked) {
        showEndingDetailModal(ending);
      } else {
        showCustomModal(`解锁条件：${ending.conditionDesc}`);
      }
    });
    galleryList.appendChild(card);
  });
}