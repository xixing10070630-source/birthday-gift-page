import { REAL_CHIIKAWA_BG_1, REAL_CHIIKAWA_BG_2 } from '../components/ChiikawaMascots';

export const ASSETS = {
  realChiikawaGroup: REAL_CHIIKAWA_BG_1,
  realChiikawaSky: REAL_CHIIKAWA_BG_2,
  coastalCity: '/src/assets/images/trip_coastal_city_1795337950361.jpg',
  karstRiver: '/src/assets/images/trip_karst_river_1795337950597.jpg',
  koreaJeju: '/src/assets/images/trip_korea_jeju_1795337952465.jpg',
  nanchangLantern: '/src/assets/images/trip_nanchang_lantern_1795337951600.jpg',
};

export interface TravelStop {
  id: string;
  order: string;
  city: string;
  englishName: string;
  seasonTag: string;
  moodLine: string;
  story: string;
  highlights: string[];
  defaultImage: string;
  mapX: number;
  mapY: number;
  accentColor: string;
}

export const TRAVEL_STOPS: TravelStop[] = [
  {
    id: 'macau',
    order: '01',
    city: '澳门',
    englishName: 'Macau',
    seasonTag: '日光葡式石阶 · 蛋挞香气',
    moodLine: '阳光洒在马卡龙色的小巷里，走累了就买一只刚出炉的葡挞。',
    story: '2024.12.31染色体家族跨年狂欢演唱会 记忆犹新 我1000🐟收的票 你在门口300收的票😤 就这样我两参加了染色体第一届家演~以及澳门通宵🤪',
    highlights: ['官也街的甜品散步', '东望洋斜巷拍胶片感照片', '吹着晚风等跨海大桥亮灯'],
    defaultImage: '/assets/aistudio/_____20261122192348_53_2_7a8d2890.jpg',
    mapX: 88,
    mapY: 282,
    accentColor: '#E87A90',
  },
  {
    id: 'nanchang',
    order: '02',
    city: '南昌',
    englishName: 'Nanchang',
    seasonTag: '赣江夜灯 · 烟火夜市',
    moodLine: '江边晚风吹过阁楼灯火，转身又一头扎进热热闹闹的美食街。',
    story: '2025.2.16-2.20 南昌之旅 冷得要鼠，辣得要鼠，吃美了，唱爽了~',
    highlights: ['滕王阁旁等一场橘子海日落', '热乎乎的瓦罐汤与拌粉', '沿着江畔散步聊天到很晚'],
    defaultImage: '/assets/aistudio/_____20261122193519_60_2_f1700d0c.jpg',
    mapX: 186,
    mapY: 186,
    accentColor: '#E5A94C',
  },
  {
    id: 'shenzhen',
    order: '03',
    city: '深圳',
    englishName: 'Shenzhen',
    seasonTag: '海边栈道 · 咖啡与晚霞',
    moodLine: '在海风和椰林之间找一家好看的咖啡店，把烦恼都丢进海浪里。',
    story: '2025.3.7 我两第一次 kpop cn！嗨爆啦！怎么不算内场第一排呢~',
    highlights: ['深圳湾公园的日落余晖', '南头古城巷子里的可爱小店', '海边草坪吹风发呆'],
    defaultImage: '/assets/aistudio/_____20261122193503_59_2_098292db.jpg',
    mapX: 284,
    mapY: 298,
    accentColor: '#6AAEE0',
  },
  {
    id: 'guilin',
    order: '04',
    city: '桂林',
    englishName: 'Guilin',
    seasonTag: '山水烟雨 · 漓江慢舟',
    moodLine: '像走进水墨绘本的一天，远山起雾，船桨轻轻划开水面。',
    story: '2025.5.1-5.2 好美的吧~',
    highlights: ['漓江边吹着微风看山影', '遇龙河竹筏漂流', '西街夜晚买到可爱小纪念品'],
    defaultImage: '/assets/aistudio/_____20261122193613_62_2_df01fe3c.jpg',
    mapX: 392,
    mapY: 198,
    accentColor: '#67B89A',
  },
  {
    id: 'liuzhou',
    order: '05',
    city: '柳州',
    englishName: 'Liuzhou',
    seasonTag: '螺蛳粉快乐 · 霓虹江畔',
    moodLine: '为了一碗粉奔赴一座城，结果连夜色和山风都意外地让人心动。',
    story: '2025.5.3-5.5 好吃！😋',
    highlights: ['满街飘香的地道螺蛳粉', '马鞍山山顶亮灯瞬间', '窑埠古镇夜晚的微风'],
    defaultImage: '/assets/aistudio/_____20261122193557_61_2_0146416e.jpg',
    mapX: 488,
    mapY: 278,
    accentColor: '#D9728C',
  },
  {
    id: 'seoul',
    order: '06',
    city: '首尔',
    englishName: 'Seoul',
    seasonTag: '延南洞街头 · 韩系拍贴',
    moodLine: '把整条街的可爱文创店和奶油甜品店全都打卡一遍。',
    story: '2026.2.24-3.1 计划了很久的一次出国~',
    highlights: ['人生四格拍贴机拍到手软', '弘大与延南洞周边店淘宝', '路边鱼饼摊的暖呼呼夜晚'],
    defaultImage: '/assets/aistudio/_____20261122192349_54_2_56ad7246.jpg',
    mapX: 590,
    mapY: 138,
    accentColor: '#8B9AE6',
  },
  {
    id: 'jeju',
    order: '07',
    city: '济州岛',
    englishName: 'Jeju Island',
    seasonTag: '果冻蓝大海 · 白房子咖啡',
    moodLine: '海风把云朵吹成棉花糖，我们在济州岛把开心存进相册。',
    story: '2026.10.26-29 说走就走的旅行 幸好是免签的~',
    highlights: ['涯月邑果冻海与海边咖啡馆', '偶遇盛开的绣球花小路', '橘子味冰淇淋与海边日落'],
    defaultImage: '/assets/aistudio/_____20261122194102_63_2_4dafab97.jpg',
    mapX: 696,
    mapY: 224,
    accentColor: '#5BAED8',
  },
];

export interface GameMemoryCard {
  id: string;
  title: string;
  dateLabel: string;
  note: string;
  imageUrl: string;
}

export const GAME_MEMORY_CARDS: GameMemoryCard[] = [
  {
    id: 'gm-1',
    title: '碰拳加油的一起吃火锅',
    dateLabel: '回忆彩蛋 · 01',
    note: '围上红围裙也要举拳比耶，21 岁的每一天都要像这样元气满满！',
    imageUrl: '/assets/aistudio/_____20261122193242_58_2_be6bf261.jpg',
  },
  {
    id: 'gm-2',
    title: '小狗小猫贴贴与大餐',
    dateLabel: '回忆彩蛋 · 02',
    note: '吃饱饱、拍美美，今天所有的美食和可可爱爱都归杨燕灵！',
    imageUrl: '/assets/aistudio/_____20261122193241_57_2_1084ead0.jpg',
  },
  {
    id: 'gm-3',
    title: '同一副耳机里的两只小猫',
    dateLabel: '回忆彩蛋 · 03',
    note: '像草地里戴同一副耳机的小猫一样，好听的歌和好心情永远分你一半。',
    imageUrl: '/assets/aistudio/_____20261122193121_56_2_7f42c316.jpg',
  },
];

export interface ScratchCardItem {
  id: string;
  label: string;
  title: string;
  secretNote: string;
  imageUrl: string;
}

export const SCRATCH_CARDS: ScratchCardItem[] = [
  {
    id: 'sc-1',
    label: '第一张显影底片',
    title: '365 Days Anniversary',
    secretNote: '举杯碰碰的好日子，从 365 天开始，往后还有无数个值得庆祝的纪念日！',
    imageUrl: '/assets/aistudio/_____20261122192344_49_2_c2a9c18c.jpg',
  },
  {
    id: 'sc-2',
    label: '第二张显影底片',
    title: '600 Days Anniversary',
    secretNote: '比出同一颗爱心的第 600 天，镜头里永远都是最好看、最合拍的我们！',
    imageUrl: '/assets/aistudio/_____20261122192345_50_2_f8580dd8.jpg',
  },
  {
    id: 'sc-3',
    label: '第三张显影底片',
    title: '结束二周年 开启第三年',
    secretNote: '你拍我、我拍你，把每一次见面和笑出声的瞬间都好好留进底片里。',
    imageUrl: '/assets/aistudio/_____20261122192422_55_2_e1ecc0dd.jpg',
  },
];
