import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // Featured
  {
    id: 'f1',
    name: '低GI減脂餐',
    description: '精選低GI澱粉與優質蛋白，穩定血糖，持續燃脂。',
    price: 150,
    calories: 450,
    protein: 30,
    category: 'Featured',
    image: 'https://picsum.photos/seed/lowgi/400/300',
    isFeatured: true,
  },
  {
    id: 'f2',
    name: '高蛋白雞胸餐',
    description: '超嫩舒肥雞胸肉，搭配五穀飯，增肌首選。',
    price: 165,
    calories: 520,
    protein: 45,
    category: 'Featured',
    image: 'https://picsum.photos/seed/chicken/400/300',
    isFeatured: true,
  },
  // Muscle & Fat Loss
  {
    id: 'm1',
    name: '舒肥嫩肩牛排餐',
    description: '低脂紅肉提供豐富鐵質與蛋白質。',
    price: 190,
    calories: 580,
    protein: 38,
    category: 'Muscle & Fat Loss',
    image: 'https://picsum.photos/seed/steak/400/300',
  },
  // Gut Health
  {
    id: 'g1',
    name: '高纖維蔬果餐',
    description: '豐富膳食纖維，促進腸胃蠕動，清爽無負擔。',
    price: 130,
    calories: 380,
    protein: 15,
    category: 'Gut Health',
    image: 'https://picsum.photos/seed/veggie/400/300',
  },
  // Sports Nutrition
  {
    id: 's1',
    name: '運動後補給餐',
    description: '黃金比例碳水與蛋白，快速修復肌肉。',
    price: 180,
    calories: 650,
    protein: 40,
    category: 'Sports Nutrition',
    image: 'https://picsum.photos/seed/sports/400/300',
  },
  // Pregnancy
  {
    id: 'p1',
    name: '孕婦均衡營養餐',
    description: '強化葉酸與鈣質，呵護媽咪與寶寶。',
    price: 200,
    calories: 600,
    protein: 35,
    category: 'Pregnancy',
    image: 'https://picsum.photos/seed/preg/400/300',
  },
  // Elderly
  {
    id: 'e1',
    name: '軟質營養保養餐',
    description: '易咀嚼消化，高鈣配方，守護銀髮健康。',
    price: 140,
    calories: 480,
    protein: 25,
    category: 'Elderly Care',
    image: 'https://picsum.photos/seed/elder/400/300',
  },
  // Kids
  {
    id: 'k1',
    name: '兒童成長高鈣餐',
    description: '趣味造型，豐富營養，幫助孩子茁壯成長。',
    price: 120,
    calories: 420,
    protein: 20,
    category: 'Kids Growth',
    image: 'https://picsum.photos/seed/kids/400/300',
  },
  // Add-ons
  {
    id: 'a1',
    name: '乳清蛋白飲',
    description: '多種口味可選，快速補充蛋白質。',
    price: 60,
    calories: 120,
    protein: 25,
    category: 'Add-ons',
    image: 'https://picsum.photos/seed/protein/400/300',
  },
  // Trial
  {
    id: 't1',
    name: '49元體驗套餐',
    description: '限新客一次，體驗阿爸的家園核心營養。',
    price: 49,
    calories: 450,
    protein: 25,
    category: 'Trial',
    image: 'https://picsum.photos/seed/trial/400/300',
  },
];
