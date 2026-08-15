// js/data/items.js
const ITEMS = [
  {
    id: 'hourglass',
    name: '沙漏',
    effect: '倒计时增加15秒',
    price: 5,
    icon: '⏳',
    description: '打工人的专属加班神器。倒转沙漏，强行将工作时间延长15秒。资本家看了会流泪，但为了活着下班，你别无选择。',
    type: 'active',
    consumable: true
  },
  {
    id: 'duplicate_glove',
    name: '复制手套',
    effect: '下一次投喂计数翻倍（可叠加使用）',
    price: 8,
    icon: '🧤',
    description: '戴上它，你的投喂效率将突破人类生理极限。下一次投喂的食物数量直接翻倍（可叠加）。撑死胆大的，饿死胆小的。',
    type: 'active',
    consumable: true
  },
  {
    id: 'divination_dice',
    name: '占卜骰子',
    effect: '指定下一份出现的食物（从6种中选1）',
    price: 10,
    icon: '🎲',
    description: '一颗没有点数的苍白骰子。抛下它，你就能在命运的菜单上强行指定下一次出现的食物。掌控权短暂地回到了你的手里。',
    type: 'active',
    consumable: true
  },
  {
    id: 'soothing_bell',
    name: '安抚铃铛',
    effect: '情饕暴走时使用可使情饕恢复正常状态并继续计时',
    price: 6,
    icon: '🔔',
    description: '黄铜材质，声音清脆得能刺穿高维空间的迷雾。只有在祂濒临暴走、准备将你生吞活剥时摇响，才能勉强唤回祂的一丝理智。',
    type: 'active',
    consumable: true
  },
  {
    id: 'rusty_key',
    name: '生锈钥匙',
    effect: '解锁隐藏食物“豆汁”',
    price: 15,
    icon: '🗝️',
    description: '一把旧铜钥匙，上面刻着“1102”。打不开任何物理意义上的门，却能解锁一份不属于你的回忆。',
    type: 'passive',
    consumable: false
  },
  {
    id: 'reception_pager',
    name: '前台传呼机',
    effect: '刷新当前三种食物，每次消耗5积分',
    price: 12,
    icon: '📟',
    description: '连通酒店后厨的内线传呼装置，机身泛着陈旧的油光。按下去就能强行让后厨换一批情绪端上来。',
    type: 'active',
    consumable: false,          // 使用时不消耗库存
    consumedAtEnd: true,        // 游戏结束消耗
    reusable: true,             // 局内可重复使用
    costPerUse: 5               // 每次使用扣5积分
  },
  {
    id: 'glutton_denture',
    name: '暴食假牙',
    effect: '进入5秒狂暴进食，结束后10秒不可安抚',
    price: 15,
    icon: '🦷',
    description: '从酒店某个废弃房间的床底下扫出来的机械假牙，咬合力惊人且永不疲倦。',
    type: 'active',
    consumable: true            // 使用后立即消耗
  },
  {
    id: 'memory_box',
    name: '记忆保鲜盒',
    effect: '新结局积分翻倍，旧结局扣10积分',
    price: 20,
    icon: '📦',
    description: '贴着手写标签的铁皮密封盒，盒盖上刻着1102的字样。用来打包那些过于浓烈而无处安放的生命故事。',
    type: 'passive',
    consumable: false,
    consumedAtEnd: true
  },
  {
    id: 'earplug',
    name: '劣质静音耳塞',
    effect: '暴走警戒延长至20秒，隐藏倒计时',
    price: 8,
    icon: '🎧',
    description: '塞进耳朵后能屏蔽掉大部分低维杂音与低吼声。听不到催促，自然就不会感到慌张。',
    type: 'passive',
    consumable: false,
    consumedAtEnd: true
  },
  {
    id: 'mystery_bag',
    name: '盲盒外卖袋',
    effect: '当前选项变为神秘外卖袋，可随机投喂1-3份',
    price: 10,
    icon: '🛍️',
    description: '用廉价红塑料袋包裹的不明包裹，散发着复杂的混合气味。你永远不知道下一口拆出来的是惊喜还是剧毒。',
    type: 'active',
    consumable: false,
    consumedAtEnd: true,
    reusable: true,
    maxUses: 3                 // 每局最多使用3次
  }
];