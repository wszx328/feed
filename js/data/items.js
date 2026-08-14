// js/data/items.js
const ITEMS = [
  {
    id: 'hourglass',
    name: '沙漏',
    effect: '倒计时增加15秒',
    price: 5,
    icon: '⏳',
    description: '打工人的专属加班神器。倒转沙漏，强行将工作时间延长15秒。资本家看了会流泪，但为了活着下班，你别无选择。',
    type: 'active',      // 主动使用
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
    type: 'passive',     // 被动生效
    consumable: false    // 不被消耗，只要携带即可
  }
];