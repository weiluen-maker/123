export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  category: string;
  image: string;
  isFeatured?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type MenuCategory = 
  | 'Featured' 
  | 'Muscle & Fat Loss' 
  | 'Gut Health' 
  | 'Sports Nutrition' 
  | 'Pregnancy' 
  | 'Elderly Care' 
  | 'Kids Growth' 
  | 'Add-ons' 
  | 'Trial';
