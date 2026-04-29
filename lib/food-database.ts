export interface FoodItem {
  name: string;
  category: string;
  amount: string; // 預設份量說明
  calories: number;
  protein: number; // g
  carbs: number;   // g
  fat: number;     // g
}

export const FOOD_DB: FoodItem[] = [
  // 主食
  { name: '白飯',       category: '主食', amount: '1碗（200g）', calories: 280, protein: 5,  carbs: 62, fat: 1 },
  { name: '糙米飯',     category: '主食', amount: '1碗（200g）', calories: 260, protein: 6,  carbs: 55, fat: 2 },
  { name: '麵條（熟）', category: '主食', amount: '1碗（250g）', calories: 300, protein: 10, carbs: 62, fat: 2 },
  { name: '饅頭',       category: '主食', amount: '1個（100g）', calories: 220, protein: 7,  carbs: 46, fat: 1 },
  { name: '吐司',       category: '主食', amount: '2片（60g）',  calories: 160, protein: 6,  carbs: 30, fat: 2 },
  { name: '地瓜',       category: '主食', amount: '1條（150g）', calories: 130, protein: 2,  carbs: 31, fat: 0 },
  { name: '燕麥片',     category: '主食', amount: '1碗（80g乾）',calories: 300, protein: 11, carbs: 54, fat: 5 },
  { name: '義大利麵（熟）', category: '主食', amount: '1份（200g）', calories: 260, protein: 9, carbs: 52, fat: 2 },

  // 台灣小吃
  { name: '滷肉飯',     category: '台灣小吃', amount: '1碗', calories: 480, protein: 16, carbs: 68, fat: 15 },
  { name: '雞排',       category: '台灣小吃', amount: '1塊（180g）', calories: 480, protein: 30, carbs: 25, fat: 25 },
  { name: '珍珠奶茶',   category: '台灣小吃', amount: '1杯（700ml）', calories: 400, protein: 3, carbs: 78, fat: 8 },
  { name: '蚵仔煎',     category: '台灣小吃', amount: '1份', calories: 350, protein: 12, carbs: 42, fat: 14 },
  { name: '刈包',       category: '台灣小吃', amount: '1個', calories: 350, protein: 14, carbs: 40, fat: 13 },
  { name: '肉圓',       category: '台灣小吃', amount: '1個', calories: 270, protein: 8,  carbs: 40, fat: 9 },
  { name: '鹽酥雞',     category: '台灣小吃', amount: '1份（150g）', calories: 420, protein: 22, carbs: 28, fat: 24 },
  { name: '臭豆腐（炸）', category: '台灣小吃', amount: '1份', calories: 320, protein: 16, carbs: 20, fat: 20 },
  { name: '水餃',       category: '台灣小吃', amount: '10顆', calories: 420, protein: 18, carbs: 55, fat: 13 },
  { name: '蛋餅',       category: '台灣小吃', amount: '1份', calories: 300, protein: 12, carbs: 35, fat: 12 },
  { name: '飯糰',       category: '台灣小吃', amount: '1個', calories: 320, protein: 8,  carbs: 58, fat: 6 },
  { name: '便當（排骨）', category: '台灣小吃', amount: '1個', calories: 650, protein: 25, carbs: 78, fat: 22 },
  { name: '便當（雞腿）', category: '台灣小吃', amount: '1個', calories: 700, protein: 35, carbs: 75, fat: 25 },
  { name: '滷蛋',       category: '台灣小吃', amount: '1顆', calories: 80,  protein: 7,  carbs: 2,  fat: 5 },
  { name: '米粉湯',     category: '台灣小吃', amount: '1碗', calories: 250, protein: 8,  carbs: 48, fat: 3 },
  { name: '貢丸湯',     category: '台灣小吃', amount: '1碗', calories: 120, protein: 10, carbs: 8,  fat: 5 },

  // 肉類 / 蛋白質
  { name: '雞胸肉（熟）', category: '蛋白質', amount: '100g', calories: 165, protein: 31, carbs: 0, fat: 4 },
  { name: '雞腿（去皮）', category: '蛋白質', amount: '100g', calories: 170, protein: 25, carbs: 0, fat: 8 },
  { name: '水煮蛋',     category: '蛋白質', amount: '1顆（60g）', calories: 80, protein: 7,  carbs: 0, fat: 5 },
  { name: '鮭魚',       category: '蛋白質', amount: '100g', calories: 200, protein: 25, carbs: 0, fat: 11 },
  { name: '鯛魚',       category: '蛋白質', amount: '100g', calories: 130, protein: 26, carbs: 0, fat: 3 },
  { name: '牛腱',       category: '蛋白質', amount: '100g', calories: 160, protein: 28, carbs: 0, fat: 5 },
  { name: '豬里肌',     category: '蛋白質', amount: '100g', calories: 150, protein: 26, carbs: 0, fat: 5 },
  { name: '蝦仁',       category: '蛋白質', amount: '100g', calories: 90,  protein: 20, carbs: 0, fat: 1 },
  { name: '鮪魚罐頭（水煮）', category: '蛋白質', amount: '1罐（170g）', calories: 175, protein: 38, carbs: 0, fat: 2 },

  // 豆製品
  { name: '豆腐（嫩）', category: '豆製品', amount: '半盒（150g）', calories: 70,  protein: 8,  carbs: 2, fat: 3 },
  { name: '豆漿（無糖）', category: '豆製品', amount: '1杯（240ml）', calories: 90, protein: 7,  carbs: 4, fat: 4 },
  { name: '毛豆',       category: '豆製品', amount: '1碗（100g）', calories: 120, protein: 11, carbs: 9, fat: 5 },

  // 蔬菜
  { name: '花椰菜',     category: '蔬菜', amount: '1碗（100g）', calories: 35,  protein: 3,  carbs: 7,  fat: 0 },
  { name: '菠菜',       category: '蔬菜', amount: '1碗（100g）', calories: 23,  protein: 3,  carbs: 4,  fat: 0 },
  { name: '高麗菜',     category: '蔬菜', amount: '1碗（100g）', calories: 25,  protein: 1,  carbs: 6,  fat: 0 },
  { name: '空心菜',     category: '蔬菜', amount: '1碗（100g）', calories: 20,  protein: 2,  carbs: 4,  fat: 0 },
  { name: '小黃瓜',     category: '蔬菜', amount: '1條（100g）', calories: 15,  protein: 1,  carbs: 3,  fat: 0 },
  { name: '番茄',       category: '蔬菜', amount: '1顆（150g）', calories: 30,  protein: 1,  carbs: 7,  fat: 0 },

  // 水果
  { name: '香蕉',       category: '水果', amount: '1根（120g）', calories: 105, protein: 1,  carbs: 27, fat: 0 },
  { name: '蘋果',       category: '水果', amount: '1顆（180g）', calories: 95,  protein: 0,  carbs: 25, fat: 0 },
  { name: '芭樂',       category: '水果', amount: '半顆（150g）', calories: 70, protein: 2,  carbs: 17, fat: 1 },
  { name: '奇異果',     category: '水果', amount: '1顆（80g）',  calories: 50,  protein: 1,  carbs: 12, fat: 0 },

  // 乳製品
  { name: '全脂牛奶',   category: '乳製品', amount: '1杯（240ml）', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: '低脂牛奶',   category: '乳製品', amount: '1杯（240ml）', calories: 100, protein: 8, carbs: 12, fat: 2 },
  { name: '希臘優格（無糖）', category: '乳製品', amount: '1盒（170g）', calories: 100, protein: 17, carbs: 6, fat: 1 },
  { name: '茅屋起司',   category: '乳製品', amount: '100g', calories: 98, protein: 11, carbs: 3, fat: 4 },

  // 速食 / 外食
  { name: '麥當勞大麥克', category: '速食', amount: '1個', calories: 550, protein: 25, carbs: 46, fat: 29 },
  { name: '麥當勞薯條（大）', category: '速食', amount: '1份', calories: 490, protein: 7, carbs: 66, fat: 23 },
  { name: '7-11 茶葉蛋', category: '速食', amount: '1顆', calories: 78, protein: 7, carbs: 1, fat: 5 },
  { name: '統一布丁',   category: '速食', amount: '1個（170g）', calories: 200, protein: 5, carbs: 36, fat: 5 },

  // 堅果 / 油脂
  { name: '花生',       category: '堅果', amount: '1把（30g）', calories: 170, protein: 7,  carbs: 5,  fat: 14 },
  { name: '杏仁',       category: '堅果', amount: '1把（30g）', calories: 175, protein: 6,  carbs: 6,  fat: 15 },
  { name: '花生醬',     category: '堅果', amount: '2匙（32g）', calories: 190, protein: 8,  carbs: 6,  fat: 16 },
  { name: '橄欖油',     category: '堅果', amount: '1匙（15ml）', calories: 120, protein: 0, carbs: 0,  fat: 14 },

  // 營養補充品
  { name: '乳清蛋白（1匙）', category: '補充品', amount: '1匙（30g）', calories: 120, protein: 24, carbs: 3, fat: 2 },
  { name: '香蕉牛奶',   category: '飲品', amount: '1杯（250ml）', calories: 160, protein: 4, carbs: 32, fat: 2 },
  { name: '黑咖啡',     category: '飲品', amount: '1杯（240ml）', calories: 5,   protein: 0, carbs: 1,  fat: 0 },
  { name: '拿鐵',       category: '飲品', amount: '1杯（360ml）', calories: 190, protein: 10, carbs: 19, fat: 7 },
  { name: '無糖綠茶',   category: '飲品', amount: '1瓶（600ml）', calories: 0,   protein: 0, carbs: 0,  fat: 0 },
];

export const CATEGORIES = [...new Set(FOOD_DB.map(f => f.category))];

export function searchFood(query: string): FoodItem[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return FOOD_DB.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)).slice(0, 8);
}

export function getFoodByCategory(cat: string): FoodItem[] {
  return FOOD_DB.filter(f => f.category === cat);
}
