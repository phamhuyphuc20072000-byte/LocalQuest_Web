import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  ArrowLeft,
  Compass,
  Utensils,
  Footprints,
  Users,
  Star,
  MapPin,
  ExternalLink,
  RotateCcw,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Headphones
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { askGeminiAiGuide, findMatchingQuest } from '../../gemini';
import { Quest } from '../../types';
import { vietnameseSpeech } from '../../utils/vietnameseSpeech';

export interface LocationCardData {
  id: string;
  name: string;
  rating: number;
  address: string;
  highlight: string;
  price: string;
  distance: string;
  tip: string;
  searchQuery?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  locations?: LocationCardData[];
  tourRecommendation?: {
    name: string;
    quest?: Quest | null;
  } | null;
  audioNarration?: {
    title: string;
    script: string;
  } | null;
  followUps?: string[];
  isTyping?: boolean;
}

// Preset verified local food & spots database for smart matching & parsing
const KNOWN_PLACES: Record<string, Partial<LocationCardData>> = {
  'phở gia truyền bát đàn': {
    name: 'Phở Gia Truyền Bát Đàn',
    rating: 4.9,
    address: '49 Bát Đàn, Q. Hoàn Kiếm, Hà Nội',
    highlight: 'Phở bò tái nạm nước dùng trong ngọt thanh tự nhiên từ xương bò ninh 12 tiếng',
    price: '50.000đ - 65.000đ',
    distance: 'Cách đây 0.3km',
    tip: 'Nên ghé lúc 6h45 sáng để không phải xếp hàng lâu'
  },
  'bún chả hàng quạt': {
    name: 'Bún Chả Hàng Quạt (Ngõ 74)',
    rating: 4.9,
    address: '74 Hàng Quạt, Q. Hoàn Kiếm, Hà Nội',
    highlight: 'Chả viên bọc lá xương xông nướng than hoa thơm lừng, nước mắm đu đủ chua ngọt giòn rụm',
    price: '40.000đ - 50.000đ',
    distance: 'Cách đây 0.5km',
    tip: 'Quán chỉ mở bán trưa, chả nướng tại chỗ giòn thơm'
  },
  'cà phê trứng giảng': {
    name: 'Cà Phê Trứng Giảng 1946',
    rating: 4.8,
    address: '39 Nguyễn Hữu Huân, Q. Hoàn Kiếm, Hà Nội',
    highlight: 'Cafe trứng đánh bông truyền thống & Cacao trứng sánh mịn ngậy béo',
    price: '35.000đ - 45.000đ',
    distance: 'Cách đây 0.4km',
    tip: 'Uống nóng ngâm trong bát nước ấm để giữ vị béo mịn'
  },
  'lẩu dê nhất ly': {
    name: 'Hệ Thống Dê Tươi Nhất Ly',
    rating: 4.8,
    address: '15A Hàng Cót / 167 Tây Sơn, Hà Nội',
    highlight: 'Lẩu dê hầm thuốc bắc ngọt thanh, thịt dê nhúng mỏng tươi chấm tương bần pha gừng',
    price: '200.000đ - 350.000đ',
    distance: 'Cách đây 1.2km',
    tip: 'Ghé vào khoảng 18:30 - 19:30, nên đặt bàn trước nếu đi nhóm đông'
  },
  'hủ tiếu mỹ tho thanh xuân': {
    name: 'Hủ tiếu Mỹ Tho Thanh Xuân (75 năm)',
    rating: 4.8,
    address: '62 Tôn Thất Thiệp, Q.1, TP. Hồ Chí Minh',
    highlight: 'Hủ tiếu khô rưới sốt gạch cua sệt độc quyền và bánh pate chaud giòn rụm',
    price: '55.000đ - 70.000đ',
    distance: 'Cách đây 0.4km',
    tip: 'Ghé từ 8:30 - 10:00 sáng để vừa thưởng thức vừa check-in con hẻm cổ vintage'
  },
  'cơm tấm ba ghiền': {
    name: 'Cơm Tấm Ba Ghiền (Sài Gòn Xưa)',
    rating: 4.8,
    address: '84 Đặng Văn Ngữ, Phú Nhuận, TP.HCM',
    highlight: 'Miếng sườn nướng than khổng lồ dày dặn, chả trứng béo ngậy và mỡ hành thơm phức',
    price: '75.000đ - 110.000đ',
    distance: 'Cách đây 2.1km',
    tip: 'Nên ghé trước 11h30 trưa để thưởng thức mẻ sườn đầu tiên mới ra lò'
  },
  'cao lầu bà bé': {
    name: 'Cao Lầu Bá Lễ / Bà Bé Hội An',
    rating: 4.9,
    address: '19 Trần Phú, Cẩm Châu, Hội An',
    highlight: 'Sợi cao lầu ngâm tro củi Cù Lao Chàm, thịt xá xíu đậm đà và tóp mỡ giòn rụm',
    price: '35.000đ - 45.000đ',
    distance: 'Cách đây 0.2km',
    tip: 'Ăn kèm rau đắng Trà Quế tươi hái buổi sáng để dậy hương vị độc bản'
  }
};

type VoiceType = 'north' | 'south';

export function AiChatWidget() {
  const { quests, selectedQuest, selectedCity, navigateToQuestDetail } = useQuest();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('north');
  const [selectedTab, setSelectedTab] = useState<'all' | 'food' | 'nav' | 'audio'>('all');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Dạ chào bạn! Tôi là Hướng Dẫn Viên AI Bản Địa 24/7 của LocalQuest. 🌸\n\nTôi có thể dẫn bạn đến các quán ăn gia truyền nức tiếng trong ngõ nhỏ, chỉ dẫn lộ trình đi bộ tối ưu hoặc kể những câu chuyện lịch sử độc bản.`,
      timestamp: 'Vừa xong',
      tourRecommendation: {
        name: 'Hương Vị Phố Cổ 36 Phố Phường'
      },
      followUps: [
        '🍜 Tìm quán ăn gia truyền gần đây',
        '🧭 Dẫn đường lộ trình đi dạo',
        '☕ Quán cafe trứng chuẩn vị nhất'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Esc key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Stop speech when closing
  useEffect(() => {
    if (!isOpen) {
      vietnameseSpeech.stop();
      setSpeakingMessageId(null);
    }
  }, [isOpen]);

  const currentCityName = selectedCity !== 'Tất cả' ? selectedCity : selectedQuest?.city || 'Hà Nội';

  // Smart parser to transform text into structured cards
  const extractLocationCards = (text: string, query: string): {
    cleanText: string;
    locations: LocationCardData[];
    tourName: string | null;
    audioScript: string | null;
    followUps: string[];
  } => {
    const locations: LocationCardData[] = [];
    const lower = (text + ' ' + query).toLowerCase();

    // 1. Detect known places from database
    Object.keys(KNOWN_PLACES).forEach((key) => {
      if (lower.includes(key)) {
        const place = KNOWN_PLACES[key];
        if (place && !locations.some((l) => l.name.toLowerCase() === place.name?.toLowerCase())) {
          locations.push({
            id: 'loc-' + Math.random().toString(36).substring(2, 9),
            name: place.name || 'Quán ăn bản địa',
            rating: place.rating || 4.8,
            address: place.address || 'Khu phố trung tâm',
            highlight: place.highlight || 'Món ăn gia truyền thơm ngon đậm đà',
            price: place.price || '45.000đ - 70.000đ',
            distance: place.distance || 'Cách đây 0.3km',
            tip: place.tip || 'Nên ghé sớm để tận hưởng trọn vẹn hương vị'
          });
        }
      }
    });

    // 2. Parse Markdown blocks like `### Tên Quán ★ 4.9` or `**Quán ...**`
    const lines = text.split('\n');
    let currentLocation: Partial<LocationCardData> | null = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.includes('★'))) {
        if (currentLocation && currentLocation.name && currentLocation.address) {
          locations.push({
            id: 'loc-' + Math.random().toString(36).substring(2, 9),
            name: currentLocation.name,
            rating: currentLocation.rating || 4.8,
            address: currentLocation.address,
            highlight: currentLocation.highlight || 'Hương vị gia truyền độc bản',
            price: currentLocation.price || '40.000đ - 65.000đ',
            distance: currentLocation.distance || 'Cách đây 0.4km',
            tip: currentLocation.tip || 'Nên thưởng thức khi còn nóng hổi'
          });
        }
        const namePart = trimmed.replace(/^###|\*\*/g, '').split('★')[0].trim();
        const ratingMatch = trimmed.match(/★\s*([\d\.]+)/);
        currentLocation = {
          name: namePart,
          rating: ratingMatch ? parseFloat(ratingMatch[1]) : 4.8
        };
      } else if (currentLocation) {
        if (trimmed.startsWith('📍') || trimmed.toLowerCase().includes('địa chỉ:')) {
          currentLocation.address = trimmed.replace(/^[📍\*\-]|địa chỉ:/gi, '').trim();
        } else if (trimmed.startsWith('✨') || trimmed.toLowerCase().includes('đặc sắc:')) {
          currentLocation.highlight = trimmed.replace(/^[✨\*\-]|đặc sắc:/gi, '').trim();
        } else if (trimmed.startsWith('💰') || trimmed.toLowerCase().includes('giá:')) {
          const parts = trimmed.split('|');
          currentLocation.price = parts[0]?.replace(/^[💰\*\-]|giá:/gi, '').trim() || '50.000đ - 70.000đ';
          if (parts[1]) {
            currentLocation.distance = parts[1].replace(/^[🚶\*\-]|cách đây:/gi, '').trim();
          }
        } else if (trimmed.startsWith('💡') || trimmed.toLowerCase().includes('mẹo:')) {
          currentLocation.tip = trimmed.replace(/^[💡\*\-]|mẹo:/gi, '').trim();
        }
      }
    });

    if (currentLocation && currentLocation.name && currentLocation.address) {
      locations.push({
        id: 'loc-' + Math.random().toString(36).substring(2, 9),
        name: currentLocation.name,
        rating: currentLocation.rating || 4.8,
        address: currentLocation.address,
        highlight: currentLocation.highlight || 'Hương vị thơm ngon nức tiếng',
        price: currentLocation.price || '45.000đ - 65.000đ',
        distance: currentLocation.distance || 'Cách đây 0.5km',
        tip: currentLocation.tip || 'Khung giờ vàng sáng sớm hoặc chiều mát'
      });
    }

    // 3. Fallback sample locations if user explicitly asked for food and none parsed
    if (locations.length === 0 && (lower.includes('ăn') || lower.includes('quán') || lower.includes('lẩu') || lower.includes('phở'))) {
      if (lower.includes('lẩu') || lower.includes('dê')) {
        const place = KNOWN_PLACES['lẩu dê nhất ly'];
        if (place) {
          locations.push({
            id: 'loc-de-1',
            name: place.name!,
            rating: place.rating!,
            address: place.address!,
            highlight: place.highlight!,
            price: place.price!,
            distance: place.distance!,
            tip: place.tip!
          });
        }
      } else if (lower.includes('sài gòn') || lower.includes('quận 1') || lower.includes('hồ chí minh')) {
        const place = KNOWN_PLACES['hủ tiếu mỹ tho thanh xuân'];
        if (place) {
          locations.push({
            id: 'loc-sg-1',
            name: place.name!,
            rating: place.rating!,
            address: place.address!,
            highlight: place.highlight!,
            price: place.price!,
            distance: place.distance!,
            tip: place.tip!
          });
        }
      } else {
        const p1 = KNOWN_PLACES['phở gia truyền bát đàn'];
        const p2 = KNOWN_PLACES['bún chả hàng quạt'];
        const p3 = KNOWN_PLACES['cà phê trứng giảng'];
        if (p1) locations.push({ id: 'loc-hn-1', ...p1 } as LocationCardData);
        if (p2) locations.push({ id: 'loc-hn-2', ...p2 } as LocationCardData);
        if (p3) locations.push({ id: 'loc-hn-3', ...p3 } as LocationCardData);
      }
    }

    // 4. Extract tour recommendations
    let tourName: string | null = null;
    const tourMatch = text.match(/["“'](Bí Ẩn Phố Cổ Hà Nội|Hương Vị Phố Cổ 36 Phố Phường|Hương Vị Sài Gòn Xưa|Ánh Sáng Đèn Lồng Hội An|Huyền Thoại Sông Hương|Dấu Chân Cố Đô Hoa Lư|Sương Mù Đà Lạt 1930)["”']/i);
    if (tourMatch) {
      tourName = tourMatch[1];
    } else if (locations.length > 0) {
      tourName = currentCityName.includes('Hồ Chí Minh') ? 'Hương Vị Sài Gòn Xưa' : 'Hương Vị Phố Cổ 36 Phố Phường';
    }

    // 5. Follow-ups
    const followUps: string[] = [];
    if (locations.length > 0) {
      followUps.push(`🧭 Dẫn đường đến ${locations[0].name}`);
      followUps.push('☕ Quán cafe ngắm phố cổ từ trên cao');
      followUps.push('💰 Combo ăn sập phố cổ dưới 100k');
    } else {
      followUps.push('🍜 Quán phở gia truyền ngon nhất');
      followUps.push('🏮 Sự tích Chùa Cầu & góc check-in bí mật');
      followUps.push('👑 Lịch trình 1 ngày khám phá Cố Đô');
    }

    return {
      cleanText: text,
      locations,
      tourName,
      audioScript: text.replace(/[#*📍✨💰🚶💡]/g, '').slice(0, 300),
      followUps
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    // Stop existing voice
    vietnameseSpeech.stop();
    setSpeakingMessageId(null);

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsLoading(true);

    try {
      const historyTurns = messages
        .filter((m) => m.text && !m.isTyping)
        .slice(-6)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
          role: (m.sender === 'ai' ? 'model' : 'user') as 'model' | 'user'
        }));

      const locationContext = selectedCity !== 'Tất cả' ? selectedCity : selectedQuest?.city || 'Hà Nội';
      const aiResponse = await askGeminiAiGuide(
        textToSend,
        selectedQuest?.name || locationContext,
        historyTurns,
        locationContext
      );

      const parsed = extractLocationCards(aiResponse, textToSend);
      const matchedQuest = findMatchingQuest(parsed.tourName || textToSend, quests);

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: parsed.cleanText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        locations: parsed.locations,
        tourRecommendation: parsed.tourName ? { name: parsed.tourName, quest: matchedQuest } : null,
        audioNarration: {
          title: `Thuyết minh: ${selectedVoice === 'north' ? 'Quỳnh Anh (Bắc)' : 'Mai Phương (Nam)'}`,
          script: parsed.audioScript || parsed.cleanText
        },
        followUps: parsed.followUps
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error sending AI message:', err);
      const fallbackAiMsg: ChatMessage = {
        id: 'ai-fallback-' + Date.now(),
        sender: 'ai',
        text: `Dạ chào bạn! Nép mình ngay trung tâm, các quán ăn gia truyền với tuổi đời hơn 30 năm luôn là điểm dừng chân tuyệt hảo để cảm nhận trọn vẹn tinh hoa ẩm thực bản địa.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        locations: [
          KNOWN_PLACES['phở gia truyền bát đàn'] as LocationCardData,
          KNOWN_PLACES['bún chả hàng quạt'] as LocationCardData
        ],
        tourRecommendation: {
          name: 'Hương Vị Phố Cổ 36 Phố Phường',
          quest: quests[0] || null
        },
        followUps: [
          '🧭 Dẫn đường đến Phở Bát Đàn',
          '☕ Quán cafe ngắm phố cổ từ trên cao',
          '💰 Combo ăn sập phố cổ dưới 100k'
        ]
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice narration handler with regional voice settings
  const handlePlayAudioNarration = (messageId: string, scriptText: string) => {
    if (speakingMessageId === messageId) {
      vietnameseSpeech.stop();
      setSpeakingMessageId(null);
      return;
    }

    vietnameseSpeech.stop();
    setSpeakingMessageId(messageId);

    const pitch = selectedVoice === 'north' ? 1.05 : 0.95;
    const rate = selectedVoice === 'north' ? 0.95 : 0.92;

    vietnameseSpeech.speak(scriptText, {
      pitch,
      rate,
      voiceId: selectedVoice === 'north' ? 'vi_female_natural' : 'vi_female_natural',
      onEnd: () => setSpeakingMessageId(null)
    });
  };

  const handleOpenGoogleMaps = (location: LocationCardData) => {
    const query = encodeURIComponent(`${location.name} ${location.address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleSuggestDishes = (location: LocationCardData) => {
    handleSendMessage(`Gợi ý món ngon nhất và bí quyết ăn chuẩn vị tại ${location.name}`);
  };

  const handleResetChat = () => {
    vietnameseSpeech.stop();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: `Chào bạn! Tôi đã làm mới phiên trò chuyện. Bạn cần tôi tìm quán ăn gia truyền, lên lộ trình di sản hay gợi ý góc chụp ảnh tại ${currentCityName}?`,
        timestamp: 'Vừa xong',
        followUps: [
          '🍜 Tìm quán ăn gia truyền gần đây',
          '🧭 Dẫn đường lộ trình đi dạo',
          '☕ Quán cafe trứng chuẩn vị nhất'
        ]
      }
    ]);
  };

  return (
    <>
      {/* 1. Floating Trigger Button */}
      {!isOpen && (
        <button
          id="btn-open-ai-chat"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%)',
            border: '1.5px solid #D4AF37',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 175, 55, 0.3)'
          }}
          title="Hướng Dẫn Viên AI Bản Địa 24/7"
        >
          <div className="relative">
            <Compass className="w-5 h-5 text-amber-300 animate-spin [animation-duration:15s]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="text-left">
            <span className="block font-heritage text-xs font-bold text-amber-200 leading-tight">
              HDV AI Bản Địa
            </span>
            <span className="block font-mono text-[9px] text-emerald-300 uppercase tracking-widest leading-none mt-0.5">
              Gemini 24/7
            </span>
          </div>
        </button>
      )}

      {/* 2. Chatbot Dialog - Compact, Optimized Space */}
      {isOpen && (
        <div
          id="ai-chat-widget-modal"
          className={`fixed z-50 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200 bg-white transition-all duration-300 animate-in zoom-in-95 ${
            isMinimized
              ? 'bottom-4 sm:bottom-6 right-4 sm:right-6 w-[94vw] sm:w-[380px] h-14'
              : isExpanded
                ? 'inset-3 sm:inset-6 max-w-4xl mx-auto h-[92vh]'
                : 'bottom-4 sm:bottom-6 right-3 sm:right-6 w-[95vw] sm:w-[450px] max-h-[720px] h-[86vh]'
          }`}
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), 0 0 30px rgba(212, 175, 55, 0.15)'
          }}
        >
          {/* Header - Compact Single Header Bar with Integrated Voice Switch */}
          <div className="px-3.5 py-2.5 bg-white border-b border-stone-200 flex items-center justify-between flex-shrink-0 select-none">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                onClick={() => {
                  vietnameseSpeech.stop();
                  setSpeakingMessageId(null);
                  setIsOpen(false);
                }}
                className="p-1 -ml-1 text-stone-600 hover:text-black hover:bg-stone-100 rounded-full transition-colors"
                title="Quay lại / Đóng"
              >
                <ArrowLeft size={17} />
              </button>

              {/* Compact Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs flex-shrink-0">
                <Compass size={17} />
              </div>

              {/* Title & Location */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-stone-900 text-sm leading-tight truncate">
                    HDV AI Bản Địa
                  </h3>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    24/7
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-500 truncate leading-tight">
                  {currentCityName} • Miễn phí
                </p>
              </div>
            </div>

            {/* Voice Toggle Button & Actions Integrated right into Header */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Sleek Voice Switch (North / South) */}
              <button
                onClick={() => setSelectedVoice((prev) => (prev === 'north' ? 'south' : 'north'))}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                title="Nhấn để đổi giọng đọc Bắc / Nam"
              >
                <span>{selectedVoice === 'north' ? '🌸 Bắc' : '🌴 Nam'}</span>
                <span className="text-[9px] text-amber-700 font-mono">⇄</span>
              </button>

              {!isMinimized && (
                <>
                  <button
                    onClick={handleResetChat}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                    title="Làm mới trò chuyện"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors hidden sm:block"
                    title={isExpanded ? 'Thu nhỏ' : 'Toàn màn hình'}
                  >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                {isMinimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              <button
                onClick={() => {
                  vietnameseSpeech.stop();
                  setSpeakingMessageId(null);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Đóng"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Category Filter Pills - Compact Slim Bar */}
              <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    selectedTab === 'all'
                      ? 'bg-[#C06A1B] text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                  <span>Tất cả</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTab('food');
                    handleSendMessage('Gợi ý cho tôi các quán ăn gia truyền nức tiếng gần đây');
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    selectedTab === 'food'
                      ? 'bg-[#C06A1B] text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Utensils size={12} />
                  <span>Tìm quán ăn</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTab('nav');
                    handleSendMessage('Dẫn đường cho tôi lộ trình đi dạo khám phá phố cổ thuận tiện nhất');
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    selectedTab === 'nav'
                      ? 'bg-[#C06A1B] text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Footprints size={12} />
                  <span>Dẫn đường</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTab('audio');
                    handleSendMessage('Kể cho tôi câu chuyện sự tích và thuyết minh về di sản nơi này');
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    selectedTab === 'audio'
                      ? 'bg-[#C06A1B] text-white font-semibold shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <Users size={12} />
                  <span>Thuyết minh</span>
                </button>
              </div>

              {/* Messages Content Thread - Maximum Vertical Space */}
              <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-3 bg-[#FAF9F5]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Message Bubble */}
                    <div className={`flex gap-2 max-w-[96%] sm:max-w-[92%] ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.sender === 'ai' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center flex-shrink-0 text-xs mt-0.5 shadow-xs">
                          <Compass size={14} />
                        </div>
                      )}

                      <div className="space-y-2.5 flex-1 min-w-0">
                        {/* Text Message Content */}
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                            m.sender === 'user'
                              ? 'bg-[#1C4A32] text-white rounded-tr-none ml-auto'
                              : 'bg-white text-stone-800 rounded-tl-none border border-stone-200'
                          }`}
                        >
                          <p className="m-0 whitespace-pre-line font-normal">
                            {m.text}
                          </p>
                          <div className={`text-[9.5px] mt-1 font-mono ${m.sender === 'user' ? 'text-emerald-200 text-right' : 'text-stone-400'}`}>
                            {m.timestamp}
                          </div>
                        </div>

                        {/* Streamlined Compact Audio Player Bar */}
                        {m.audioNarration && m.sender === 'ai' && (
                          <div className="rounded-xl px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-2xs flex items-center gap-2.5 animate-in fade-in">
                            <button
                              onClick={() => handlePlayAudioNarration(m.id, m.audioNarration!.script)}
                              className="w-8 h-8 rounded-full bg-[#C06A1B] hover:bg-[#A35914] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer flex-shrink-0"
                              title={speakingMessageId === m.id ? 'Tạm dừng' : 'Nghe giọng đọc HDV'}
                            >
                              {speakingMessageId === m.id ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-bold text-amber-950 truncate flex items-center gap-1">
                                  <Volume2 size={12} className="text-amber-700 flex-shrink-0" />
                                  <span>{speakingMessageId === m.id ? 'Đang thuyết minh...' : 'Nghe thuyết minh HDV'}</span>
                                </span>
                                <span className="text-[10px] text-amber-800 font-medium whitespace-nowrap bg-amber-100/80 px-1.5 py-0.5 rounded">
                                  {selectedVoice === 'north' ? '🌸 Giọng Bắc' : '🌴 Giọng Nam'}
                                </span>
                              </div>

                              {/* Mini Waveform */}
                              <div className="flex items-center gap-0.5 mt-1">
                                {[3, 7, 10, 5, 12, 8, 14, 7, 10, 4, 8, 5, 9, 6].map((h, i) => (
                                  <span
                                    key={i}
                                    className={`w-1 rounded-full transition-all ${
                                      speakingMessageId === m.id
                                        ? 'bg-amber-600 animate-pulse'
                                        : 'bg-amber-300'
                                    }`}
                                    style={{
                                      height: speakingMessageId === m.id ? `${h}px` : '4px',
                                      animationDelay: `${i * 0.08}s`
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Interactive Location Cards (Quán ăn & Địa điểm bản địa) */}
                        {m.locations && m.locations.length > 0 && (
                          <div className="space-y-2 pt-0.5">
                            <div className="text-[11.5px] font-bold text-amber-900 flex items-center gap-1.5 px-0.5">
                              <span>📍</span>
                              <span>Địa điểm & Quán ăn bản địa chọn lọc:</span>
                            </div>

                            {m.locations.map((loc) => (
                              <div
                                key={loc.id}
                                className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs space-y-2 transition-all hover:border-amber-300"
                              >
                                {/* Name and Rating */}
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-[13px] text-stone-900 m-0 leading-tight">
                                    {loc.name}
                                  </h4>
                                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold flex-shrink-0">
                                    <Star size={10} className="fill-amber-400 text-amber-500" />
                                    <span>{loc.rating.toFixed(1)}</span>
                                  </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-1.5 text-[11px] text-stone-600 leading-tight">
                                  <MapPin size={12} className="text-rose-500 flex-shrink-0 mt-0.5" />
                                  <span className="truncate">{loc.address}</span>
                                </div>

                                {/* Highlight */}
                                <div className="text-[11px] text-emerald-800 font-medium bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100 flex items-start gap-1">
                                  <span className="text-amber-500 flex-shrink-0">✨</span>
                                  <span>{loc.highlight}</span>
                                </div>

                                {/* Price and Distance */}
                                <div className="flex items-center gap-2 text-[11px] text-stone-600">
                                  <span className="font-semibold text-amber-900">💰 {loc.price}</span>
                                  <span className="text-stone-300">•</span>
                                  <span className="text-stone-500">🚶 {loc.distance}</span>
                                </div>

                                {/* Tip */}
                                {loc.tip && (
                                  <div className="text-[10.5px] text-sky-800 bg-sky-50/70 p-1.5 rounded-lg border border-sky-100 flex items-start gap-1">
                                    <span className="flex-shrink-0">💡</span>
                                    <span>{loc.tip}</span>
                                  </div>
                                )}

                                {/* Compact 2 Action Buttons */}
                                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                                  <button
                                    onClick={() => handleOpenGoogleMaps(loc)}
                                    className="py-1.5 px-2 rounded-lg border border-amber-600 text-amber-800 hover:bg-amber-50 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Footprints size={12} />
                                    <span>Chỉ đường</span>
                                  </button>
                                  <button
                                    onClick={() => handleSuggestDishes(loc)}
                                    className="py-1.5 px-2 rounded-lg bg-[#C06A1B] hover:bg-[#A35914] text-white font-semibold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <Utensils size={12} />
                                    <span>Gợi ý món</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tour Recommendation Card */}
                        {m.tourRecommendation && (
                          <div
                            onClick={() => {
                              if (m.tourRecommendation?.quest) {
                                navigateToQuestDetail(m.tourRecommendation.quest);
                                setIsOpen(false);
                              } else {
                                const matched = quests.find((q) =>
                                  q.name.toLowerCase().includes(m.tourRecommendation!.name.toLowerCase())
                                );
                                if (matched) {
                                  navigateToQuestDetail(matched);
                                  setIsOpen(false);
                                }
                              }
                            }}
                            className="p-2.5 rounded-xl bg-[#FFF9E6] border border-[#FDE68A] flex items-center gap-2 text-xs text-amber-950 font-bold hover:bg-[#FFF3CD] cursor-pointer transition-colors shadow-2xs"
                          >
                            <Compass size={15} className="text-[#C06A1B] flex-shrink-0" />
                            <span className="flex-1 truncate">
                              Xem tour: {m.tourRecommendation.name}
                            </span>
                            <ExternalLink size={12} className="text-stone-500 flex-shrink-0" />
                          </div>
                        )}

                        {/* In-chat Follow-up Question Chips (Only inside chat, not blocking search) */}
                        {m.followUps && m.followUps.length > 0 && (
                          <div className="space-y-1 pt-0.5">
                            {m.followUps.map((chip, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendMessage(chip.replace(/^[⊕🧭☕💰🍜\s]+/, ''))}
                                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/60 text-[11px] text-stone-700 hover:text-amber-950 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <span className="text-amber-600 font-bold">⊕</span>
                                <span className="truncate">{chip}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-2 items-center text-xs text-stone-500">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Sparkles size={14} className="animate-spin" />
                    </div>
                    <div className="px-3 py-2 bg-white rounded-xl rounded-tl-none border border-stone-200 flex items-center gap-2 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.3s]" />
                      <span className="ml-1 text-[11px] text-stone-600 font-medium">
                        HDV AI đang tìm kiếm dữ liệu bản địa...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Clean Single Bottom Input Bar (Removed the bulky sticky proposal bar above) */}
              <div className="p-2.5 bg-white border-t border-stone-200 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    id="input-ai-guide-question"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Hỏi HDV AI về quán ăn, chỉ đường..."
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-stone-50 rounded-full border border-stone-300 focus:bg-white focus:outline-none focus:border-[#C06A1B] text-stone-900 placeholder:text-stone-400 shadow-2xs transition-colors"
                  />
                  <button
                    id="btn-ai-guide-send"
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-9 h-9 rounded-full bg-[#C06A1B] text-white hover:bg-[#A35914] disabled:opacity-40 transition-all shadow-xs flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-95"
                    title="Gửi câu hỏi"
                  >
                    <Send size={15} className="-ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
