// js/config.js
const CONFIG = {
  GAME_DURATION: 60,
  WARNING_TIME: 15,
  FORCE_END_TIME: 30,
  OPTIONS_PER_ROUND: 3,
  MAX_CARRY_ITEMS: 3,
  DOUZHI_UNLOCK_ITEM: 'rusty_key',
  DOUZHI_APPEAR_CHANCE: 0.3,
  TICK_INTERVAL_MS: 100,
  FEED_COOLDOWN: 0.85,
  STORAGE_KEY: 'si_game_save',

  // 前台传呼机
  MENU_REFRESH_COST: 5,

  // 暴食假牙
  RAGE_DURATION: 5,
  POST_RAGE_WARNING_DURATION: 10,

  // 劣质静音耳塞
  EARPLUG_WARNING_TIME: 20,

  // 记忆保鲜盒
  MEMORY_BOX_NEW_ENDING_MULTIPLIER: 2,
  MEMORY_BOX_OLD_ENDING_PENALTY: 10,

  // 盲盒外卖袋
  MYSTERY_BAG_MAX_USES: 3,

  // 废弃针管
  SYRINGE_TIME_COST: 10,          // 使用针管扣除的秒数
  SYRINGE_FEED_COUNT: 5,          // 使用针管强制投喂的份数

  // 肮脏的单片镜
  MONOCLE_DURATION: 10,           // 单片镜乱码持续时间（秒）
  MONOCLE_MASH_THRESHOLD: 10,     // 盲人摸象结局需要盲点投喂的次数
  MONOCLE_USES_FOR_ENDING: 3      // 不可名状的真理结局需要使用的次数
};