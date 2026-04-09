/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Menu as MenuIcon, 
  X, 
  MessageCircle, 
  Camera, 
  Send, 
  ChevronRight,
  Info,
  Utensils,
  Heart,
  Activity,
  Baby,
  User,
  Smile,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { MenuItem, ChatMessage, MenuCategory } from './types';
import { MENU_ITEMS } from './constants';

const CATEGORIES: { id: MenuCategory; icon: any; label: string }[] = [
  { id: 'Featured', icon: Heart, label: '精選推薦' },
  { id: 'Muscle & Fat Loss', icon: Activity, label: '增肌減脂' },
  { id: 'Gut Health', icon: Utensils, label: '腸胃調整' },
  { id: 'Sports Nutrition', icon: Activity, label: '運動補給' },
  { id: 'Pregnancy', icon: Baby, label: '孕期營養' },
  { id: 'Elderly Care', icon: User, label: '銀髮保養' },
  { id: 'Kids Growth', icon: Smile, label: '兒童成長' },
  { id: 'Add-ons', icon: Plus, label: '單點加購' },
  { id: 'Trial', icon: Info, label: '體驗商品' },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('Featured');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', text: '您好！我是阿爸的家園 AI 營養顧問。有什麼我可以幫您的嗎？您可以詢問飲食建議，或上傳食物照片讓我幫您分析營養。' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.item.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userInput }];
    setChatHistory(newHistory);
    setUserInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: newHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        config: {
          systemInstruction: "你是一位專業的營養師與體態管理專家，代表『阿爸的家園』。你的目標是根據用戶的需求（如減脂、增肌、腸胃調理）提供專業的飲食建議，並推薦我們菜單中的合適餐點。語氣要親切、專業且具備鼓勵性。如果用戶提到身體不適，請提醒他們諮詢醫療專業人員。",
        }
      });

      setChatHistory(prev => [...prev, { role: 'model', text: response.text || '抱歉，我現在無法回答。' }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: '發生了一些錯誤，請稍後再試。' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingImage(true);
    setIsAnalyzerOpen(true);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: file.type } },
              { text: "請分析這張照片中的食物。估計其熱量、蛋白質、脂肪和碳水化合物含量。並根據『阿爸的家園』的健康理念，給出一些改善建議。請用繁體中文回答。" }
            ]
          }
        });

        setAnalysisResult(response.text || '無法分析此圖片。');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image analysis error:", error);
      setAnalysisResult('圖片分析失敗，請重試。');
    } finally {
      setAnalyzingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
              <Heart size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">阿爸的家園</h1>
              <p className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-semibold">Healthy Nutrition Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-[#F5F5F0] rounded-full transition-colors"
            >
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#FF6321] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-[#5A5A40] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-4 backdrop-blur-sm">
                專業體態管理方案
              </span>
              <h2 className="text-4xl md:text-6xl font-serif font-light leading-tight mb-6">
                用正確的營養，<br />
                <span className="italic">找回最好的自己</span>
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg">
                我們不只提供便當，更提供客製化的營養顧問服務。透過 AI 科技與專業知識，助您達成理想體態。
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setActiveCategory('Trial')}
                  className="bg-[#FF6321] hover:bg-[#E5591D] text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105"
                >
                  立即體驗 49 元套餐
                </button>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-medium transition-all"
                >
                  諮詢 AI 營養師
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <img 
                src="https://picsum.photos/seed/healthy/800/800" 
                alt="Healthy Food" 
                className="object-cover w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-4 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-lg' 
                    : 'bg-white text-[#5A5A40] border-[#E5E5E5] hover:border-[#5A5A40]'
                }`}
              >
                <cat.icon size={18} />
                <span className="font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Menu Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif font-medium">
              {CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h3>
            <div className="text-sm text-[#5A5A40]/60">
              顯示 {MENU_ITEMS.filter(item => item.category === activeCategory || (activeCategory === 'Featured' && item.isFeatured)).length} 個項目
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MENU_ITEMS.filter(item => item.category === activeCategory || (activeCategory === 'Featured' && item.isFeatured)).map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className="bg-white rounded-[24px] overflow-hidden border border-[#E5E5E5] hover:shadow-xl transition-all group"
              >
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#5A5A40]">
                      {item.calories} KCAL
                    </span>
                    <span className="bg-[#5A5A40]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white">
                      {item.protein}G PROTEIN
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-bold">{item.name}</h4>
                    <span className="text-lg font-serif font-medium text-[#FF6321]">NT$ {item.price}</span>
                  </div>
                  <p className="text-[#5A5A40]/70 text-sm mb-6 line-clamp-2">
                    {item.description}
                  </p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#5A5A40] py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    加入購物車
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-14 h-14 bg-white text-[#5A5A40] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border border-[#E5E5E5]"
          title="分析食物照片"
        >
          <Camera size={24} />
        </button>
        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 bg-[#5A5A40] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          title="諮詢 AI 營養師"
        >
          <MessageCircle size={24} />
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleImageUpload}
      />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                <h3 className="text-xl font-bold">您的購物車</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-[#F5F5F0] rounded-full">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#5A5A40]/40">
                    <ShoppingCart size={64} className="mb-4" />
                    <p>購物車是空的</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.item.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.item.image} alt={item.item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-bold">{item.item.name}</h4>
                            <button onClick={() => removeFromCart(item.item.id)} className="text-[#5A5A40]/40 hover:text-red-500">
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-[#5A5A40]/60 mb-3">NT$ {item.item.price}</p>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.item.id, -1)}
                              className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center hover:bg-[#F5F5F0]"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.item.id, 1)}
                              className="w-8 h-8 rounded-full border border-[#E5E5E5] flex items-center justify-center hover:bg-[#F5F5F0]"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-[#E5E5E5] bg-[#FDFCFB]">
                <div className="flex justify-between mb-6">
                  <span className="text-[#5A5A40]/60">總計</span>
                  <span className="text-2xl font-serif font-bold">NT$ {totalPrice}</span>
                </div>
                <button 
                  disabled={cart.length === 0}
                  className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4A4A35] transition-colors"
                >
                  前往結帳
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:bottom-24 md:right-8 md:w-[450px] md:h-[600px] bg-white z-[90] shadow-2xl rounded-[32px] flex flex-col overflow-hidden"
            >
              <div className="p-6 bg-[#5A5A40] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">AI 營養顧問</h3>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest">阿爸的家園</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-[#5A5A40] text-white rounded-tr-none' 
                        : 'bg-[#F5F5F0] text-[#1A1A1A] rounded-tl-none'
                    }`}>
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#F5F5F0] p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#5A5A40]/40 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#5A5A40]/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-[#5A5A40]/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-[#E5E5E5] bg-white">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="詢問營養建議..."
                    className="flex-1 bg-[#F5F5F0] border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5A5A40] transition-all"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isTyping}
                    className="bg-[#5A5A40] text-white p-3 rounded-xl hover:bg-[#4A4A35] transition-colors disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Image Analyzer Modal */}
      <AnimatePresence>
        {isAnalyzerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAnalyzerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:max-h-[80vh] bg-white z-[110] shadow-2xl rounded-[32px] flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Camera size={24} className="text-[#5A5A40]" />
                  AI 食物分析
                </h3>
                <button onClick={() => setIsAnalyzerOpen(false)} className="p-2 hover:bg-[#F5F5F0] rounded-full">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {analyzingImage ? (
                  <div className="h-64 flex flex-col items-center justify-center text-[#5A5A40]">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <p className="font-medium">正在辨識食物並分析營養成分...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {analysisResult && (
                      <div className="bg-[#F5F5F0] p-6 rounded-2xl">
                        <div className="prose prose-sm max-w-none">
                          <Markdown>{analysisResult}</Markdown>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-center">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-[#5A5A40] text-white px-8 py-3 rounded-full font-medium hover:bg-[#4A4A35] transition-all"
                      >
                        重新上傳照片
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#1A1A1A]">
                <Heart size={20} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">阿爸的家園</h1>
            </div>
            <p className="text-white/60 max-w-md mb-8">
              我們致力於提供最科學、最健康的飲食方案。結合 AI 營養分析與專業顧問，讓您的健康管理變得簡單而有效。
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <ChevronRight size={18} />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-wider text-sm text-white/40">快速連結</h4>
            <ul className="space-y-4 text-white/70">
              <li className="hover:text-white cursor-pointer transition-colors">關於我們</li>
              <li className="hover:text-white cursor-pointer transition-colors">菜單介紹</li>
              <li className="hover:text-white cursor-pointer transition-colors">營養顧問</li>
              <li className="hover:text-white cursor-pointer transition-colors">常見問題</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-wider text-sm text-white/40">聯絡資訊</h4>
            <ul className="space-y-4 text-white/70">
              <li>台北市信義區健康路 123 號</li>
              <li>02-2345-6789</li>
              <li>service@abba-home.com</li>
              <li className="pt-4">
                <span className="inline-block px-3 py-1 bg-[#FF6321] text-white text-[10px] font-bold rounded-full">
                  LINE @abba_home
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/10 text-center text-white/30 text-sm">
          © 2026 阿爸的家園 Healthy Nutrition Center. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
