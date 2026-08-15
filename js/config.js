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
  RAGE_DURATION: 5,              // 狂暴进食持续时间（秒）
  POST_RAGE_WARNING_DURATION: 10, // 结束后不可安抚的预警时间（秒）

  // 劣质静音耳塞
  EARPLUG_WARNING_TIME: 20,      // 携带后暴走警戒时间延长至20秒

  // 记忆保鲜盒
  MEMORY_BOX_NEW_ENDING_MULTIPLIER: 2, // 新结局积分倍数
  MEMORY_BOX_OLD_ENDING_PENALTY: 10,   // 旧结局扣除积分

  // 盲盒外卖袋
  MYSTERY_BAG_MAX_USES: 3        // 每局最多使用次数
};