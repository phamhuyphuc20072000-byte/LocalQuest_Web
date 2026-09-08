import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Quest, 
  Ticket, 
  ActivePage, 
  QuestTheme, 
  PendingGuideApplication, 
  PendingQuestReview, 
  PendingWithdrawal 
} from '../types';
import { QUESTS as INITIAL_QUESTS } from '../data/quests';
import { 
  getQuestsLive, 
  subscribePendingQuests,
  createQuest as createQuestService, 
  approveQuest as approveQuestService,
  rejectQuest as rejectQuestService 
} from '../services/questService';
import { 
  subscribePendingGuides, 
  approveGuide as approveGuideService, 
  rejectGuide as rejectGuideService 
} from '../services/guideService';
import { 
  subscribePendingWithdrawals, 
  approveWithdrawal as approveWithdrawalService, 
  rejectWithdrawal as rejectWithdrawalService 
} from '../services/walletService';
import { vietnameseSpeech, VietnameseVoiceOption } from '../utils/vietnameseSpeech';
import { auth, onAuthStateChanged } from '../firebase';

export interface AudioTrackState {
  title: string;
  questName: string;
  script: string;
  city?: string;
  waypointIndex?: number;
  questId?: number | string;
  audioUrl?: string;
  isPlaying: boolean;
  playbackRate: number;
  currentTime: number;
  duration: number;
  isMinimized?: boolean;
  voiceId?: string;
}

export interface CheckInCelebration {
  ticketId: string;
  questTitle: string;
  coinsEarned: number;
  expEarned: number;
}

interface QuestContextType {
  quests: Quest[];
  setQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  selectedQuest: Quest | null;
  setSelectedQuest: (quest: Quest | null) => void;
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedTheme: QuestTheme;
  setSelectedTheme: (theme: QuestTheme) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Tickets & Orders
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  addTicket: (newTicket: Ticket) => void;
  activeTicket: Ticket | null;
  setActiveTicket: (ticket: Ticket | null) => void;
  celebration: CheckInCelebration | null;
  clearCelebration: () => void;
  
  // Audio Player State & Controls
  audioTrack: AudioTrackState | null;
  selectedVoiceId: string;
  setSelectedVoiceId: (voiceId: string) => void;
  availableVoices: VietnameseVoiceOption[];
  playAudio: (track: {
    title: string;
    questName: string;
    script: string;
    city?: string;
    waypointIndex?: number;
    questId?: number | string;
    audioUrl?: string;
  }) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  toggleAudioPlay: () => void;
  seekAudio: (seconds: number) => void;
  skipAudio: (deltaSeconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  nextAudioTrack: () => void;
  prevAudioTrack: () => void;
  stopAudio: () => void;
  toggleMinimizeAudio: () => void;

  // Custom Quests Creation (Guide Studio)
  addQuest: (quest: Quest) => void;
  createQuest: (quest: Quest) => Promise<void>;
  removeQuest: (id: number | string) => void;

  // Admin Data Management
  pendingGuides: PendingGuideApplication[];
  pendingQuests: PendingQuestReview[];
  pendingReviews: Quest[];
  pendingWithdrawals: PendingWithdrawal[];
  approveGuide: (id: number | string) => Promise<void>;
  rejectGuide: (id: number | string) => Promise<void>;
  approveQuest: (id: number | string) => Promise<void>;
  rejectQuest: (id: number | string) => Promise<void>;
  approvePendingReview: (id: number | string) => void;
  rejectPendingReview: (id: number | string) => void;
  addPendingReview: (quest: Quest) => void;
  approveWithdrawal: (id: number | string) => Promise<void>;
  rejectWithdrawal: (id: number | string) => Promise<void>;

  // Navigation helpers
  bookingDate: string;
  setBookingDate: (date: string) => void;
  bookingTime: string;
  setBookingTime: (time: string) => void;
  navigateToQuestDetail: (quest: Quest) => void;
  navigateToCheckout: (quest: Quest, initialSchedule?: { date?: string; time?: string }) => void;
  startGameplay: (ticket: Ticket) => void;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-001',
    ticketCode: 'LQ-HN-88392',
    questId: 1,
    questName: 'Bí Ẩn Phố Cổ Hà Nội',
    city: 'Hà Nội',
    theme: 'Bí ẩn',
    price: 180000,
    purchaseDate: '28/08/2026',
    touristsCount: 2,
    buyerName: 'Nhà Thám Hiểm Di Sản',
    buyerEmail: 'explorer@localquest.vn',
    buyerPhone: '0988 123 456',
    status: 'valid',
    currentWaypointIndex: 0,
    score: 0,
    qrPayload: 'LQ-TICKET-tkt-001'
  }
];

const INITIAL_PENDING_GUIDES: PendingGuideApplication[] = [
  { id: 1, name: 'Hoàng Đức Thành', city: 'Hà Nội', submitted: '26/08/2026', phone: '0912 345 678', isNew: false, status: 'pending', bio: 'Nghệ nhân gốm sứ Bát Tràng và hướng dẫn viên văn hoá Phố Cổ 10 năm kinh nghiệm.' },
  { id: 2, name: 'Vũ Thị Mai Anh', city: 'Đà Nẵng', submitted: '27/08/2026', phone: '0987 654 321', isNew: true, status: 'pending', bio: 'Thổ địa Sơn Trà, chuyên dẫn tour di sản ẩm thực và khảo cứu lịch sử Champa.' },
  { id: 3, name: 'Đinh Công Sơn', city: 'TP. Hồ Chí Minh', submitted: '28/08/2026', phone: '0901 234 567', isNew: false, status: 'pending', bio: 'Nhiếp ảnh gia và chuyên gia khảo sát kiến trúc biệt thự Pháp cổ Sài Gòn.' }
];

const INITIAL_PENDING_QUESTS: PendingQuestReview[] = [
  { id: 1, name: 'Bóng Ma Chợ Đông Ba', guide: 'Phạm Thị Hường', city: 'Huế', waypoints: 7, submitted: '26/08/2026', theme: 'Bí ẩn', price: 160000, status: 'pending' },
  { id: 2, name: 'Hẻm Cũ Chợ Lớn 1975', guide: 'Trần Thị Lan', city: 'TP. Hồ Chí Minh', waypoints: 9, submitted: '27/08/2026', theme: 'Ẩm thực', price: 210000, status: 'pending' }
];

const INITIAL_PENDING_WITHDRAWALS: PendingWithdrawal[] = [
  { id: 'w-001', guideId: 'guide-001', guide: 'Hoàng Đức Thành', amount: 3200000, bank: 'Vietcombank', account: '***8999', requested: '28/08/2026', status: 'pending' },
  { id: 'w-002', guideId: 'guide-003', guide: 'Trần Thị Lan', amount: 5000000, bank: 'Techcombank', account: '***2190', requested: '27/08/2026', status: 'pending' }
];

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(INITIAL_QUESTS[0] || null);
  const [activePage, setActivePage] = useState<ActivePage>('EXPLORE');
  const [selectedCity, setSelectedCity] = useState<string>('Tất cả');
  const [selectedTheme, setSelectedTheme] = useState<QuestTheme>('Tất cả');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tickets & Celebration
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [celebration, setCelebration] = useState<CheckInCelebration | null>(null);

  // Tour Booking Schedule (Date & Time)
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState<string>(todayStr);
  const [bookingTime, setBookingTime] = useState<string>('08:30');

  // Admin and Reviews
  const [pendingGuides, setPendingGuides] = useState<PendingGuideApplication[]>(INITIAL_PENDING_GUIDES);
  const [pendingQuests, setPendingQuests] = useState<PendingQuestReview[]>(INITIAL_PENDING_QUESTS);
  const [pendingReviews, setPendingReviews] = useState<Quest[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>(INITIAL_PENDING_WITHDRAWALS);

  // 1. Live Firestore Quests Synchronization
  useEffect(() => {
    const unsubQuests = getQuestsLive((liveQuests) => {
      if (liveQuests && liveQuests.length > 0) {
        setQuests(liveQuests);
      }
    });

    // 2. Live Admin Pending Guides Listener
    const unsubGuides = subscribePendingGuides((guides) => {
      if (guides && guides.length > 0) {
        setPendingGuides(
          guides.map((g, idx) => ({
            id: idx + 1,
            name: g.fullName,
            city: g.city,
            submitted: g.submittedDate || 'Gần đây',
            phone: g.phone,
            email: g.email,
            bio: g.bio,
            isNew: true,
            status: g.status as any
          }))
        );
      }
    });

    // 3. Live Admin Pending Withdrawals Listener (Only attach listener if auth is ready and user is authenticated)
    let unsubWithdrawals = () => {};
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsubWithdrawals();
      if (user) {
        unsubWithdrawals = subscribePendingWithdrawals((wList) => {
          if (wList && wList.length > 0) {
            setPendingWithdrawals(wList);
          }
        });
      } else {
        setPendingWithdrawals(INITIAL_PENDING_WITHDRAWALS);
      }
    });

    // 4. Live Admin Pending Quests Reviews Listener
    const unsubPendingQuests = subscribePendingQuests((pList) => {
      if (pList && pList.length > 0) {
        setPendingReviews(pList);
        setPendingQuests(
          pList.map((pq, idx) => ({
            id: pq.id || idx + 1,
            questTitle: pq.name,
            guideName: pq.guideName,
            city: pq.city,
            waypointsCount: pq.waypoints ? pq.waypoints.length : 0,
            submitted: 'Gần đây',
            status: pq.status === 'active' ? 'approved' : pq.status === 'rejected' ? 'rejected' : 'pending'
          }))
        );
      }
    });

    return () => {
      unsubQuests();
      unsubGuides();
      unsubWithdrawals();
      unsubAuth();
      unsubPendingQuests();
    };
  }, []);

  const addTicket = (newTicket: Ticket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const clearCelebration = () => {
    setCelebration(null);
  };

  // Audio State & Engine
  const [audioTrack, setAudioTrack] = useState<AudioTrackState | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('cloud_google_vi_female');
  const [availableVoices, setAvailableVoices] = useState<VietnameseVoiceOption[]>([]);
  const audioIntervalRef = React.useRef<any>(null);

  // Initialize available Vietnamese voices
  useEffect(() => {
    const loadVoices = () => {
      const list = vietnameseSpeech.getAvailableVoices();
      setAvailableVoices(list);
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Helper to clear timer
  const clearAudioTimer = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
  };

  // Auto advance to next waypoint when current track ends
  const handleTrackEnded = (currentTrack: AudioTrackState) => {
    clearAudioTimer();
    const currentQuest = quests.find(
      (q) => q.id === currentTrack.questId || q.name.toLowerCase() === currentTrack.questName.toLowerCase()
    );

    if (
      currentQuest &&
      currentQuest.waypoints &&
      currentTrack.waypointIndex !== undefined &&
      currentTrack.waypointIndex + 1 < currentQuest.waypoints.length
    ) {
      const nextIndex = currentTrack.waypointIndex + 1;
      const nextWp = currentQuest.waypoints[nextIndex];
      playAudio({
        title: nextWp.name,
        questName: currentQuest.name,
        script: nextWp.script,
        city: currentQuest.city,
        waypointIndex: nextIndex,
        questId: currentQuest.id
      });
    } else {
      setAudioTrack((prev) => (prev ? { ...prev, isPlaying: false, currentTime: prev.duration } : null));
    }
  };

  // Audio ticker to sync progression
  useEffect(() => {
    if (audioTrack && audioTrack.isPlaying) {
      clearAudioTimer();
      audioIntervalRef.current = setInterval(() => {
        setAudioTrack((prev) => {
          if (!prev || !prev.isPlaying) return prev;
          const nextTime = prev.currentTime + 0.5 * (prev.playbackRate || 1.0);
          if (nextTime >= prev.duration) {
            setTimeout(() => handleTrackEnded(prev), 50);
            return { ...prev, currentTime: prev.duration, isPlaying: false };
          }
          return { ...prev, currentTime: nextTime };
        });
      }, 500);
    } else {
      clearAudioTimer();
    }
    return () => clearAudioTimer();
  }, [audioTrack?.isPlaying, audioTrack?.playbackRate, audioTrack?.duration]);

  const changeVoice = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    vietnameseSpeech.setPreferredVoice(voiceId);
    if (audioTrack && audioTrack.isPlaying) {
      // Re-trigger with new voice seamlessly
      vietnameseSpeech.speak(audioTrack.script, {
        rate: audioTrack.playbackRate || 1.0,
        voiceId,
        onEnd: () => {
          setAudioTrack((prev) => {
            if (prev && prev.isPlaying) {
              handleTrackEnded(prev);
            }
            return prev ? { ...prev, isPlaying: false } : null;
          });
        }
      });
    }
  };

  const playAudio = (track: {
    title: string;
    questName: string;
    script: string;
    city?: string;
    waypointIndex?: number;
    questId?: number | string;
    audioUrl?: string;
  }) => {
    clearAudioTimer();
    const wordsCount = track.script.split(/\s+/).filter(Boolean).length;
    const rate = audioTrack?.playbackRate || 1.0;
    const estimatedSecs = Math.max(12, Math.round(wordsCount / (2.0 * rate)));

    // Use native Vietnamese speech engine
    vietnameseSpeech.speak(track.script, {
      rate,
      voiceId: selectedVoiceId,
      onProgress: (prog) => {
        setAudioTrack((prev) => {
          if (!prev || !prev.isPlaying) return prev;
          return {
            ...prev,
            currentTime: prog.currentTime,
            duration: Math.max(prev.duration, prog.duration)
          };
        });
      },
      onEnd: () => {
        setAudioTrack((prev) => {
          if (prev && prev.isPlaying) {
            handleTrackEnded(prev);
          }
          return prev ? { ...prev, isPlaying: false, currentTime: prev.duration } : null;
        });
      },
      onError: () => {
        console.warn('Speech playback notice');
      }
    });

    setAudioTrack({
      ...track,
      isPlaying: true,
      playbackRate: rate,
      currentTime: 0,
      duration: estimatedSecs,
      isMinimized: false,
      voiceId: selectedVoiceId
    });
  };

  const pauseAudio = () => {
    vietnameseSpeech.pause();
    setAudioTrack((prev) => (prev ? { ...prev, isPlaying: false } : null));
  };

  const resumeAudio = () => {
    if (!audioTrack) return;
    
    // Nếu đã phát hết (currentTime gần bằng hoặc bằng duration), phát lại từ đầu
    if (audioTrack.currentTime >= audioTrack.duration - 1 || audioTrack.currentTime === 0) {
      playAudio({
        title: audioTrack.title,
        questName: audioTrack.questName,
        script: audioTrack.script,
        city: audioTrack.city,
        waypointIndex: audioTrack.waypointIndex,
        questId: audioTrack.questId,
        audioUrl: audioTrack.audioUrl
      });
      return;
    }

    vietnameseSpeech.resume();
    setAudioTrack((prev) => (prev ? { ...prev, isPlaying: true } : null));
  };

  const toggleAudioPlay = () => {
    if (!audioTrack) return;
    if (audioTrack.isPlaying) {
      pauseAudio();
    } else {
      resumeAudio();
    }
  };

  const seekAudio = (seconds: number) => {
    if (!audioTrack) return;
    const clamped = Math.max(0, Math.min(audioTrack.duration, seconds));
    setAudioTrack({ ...audioTrack, currentTime: clamped });
    
    // Nếu tua về 0 hoặc tua khi đang dừng, kích hoạt phát lại mượt mà
    if (clamped === 0 && audioTrack.isPlaying) {
      playAudio({
        title: audioTrack.title,
        questName: audioTrack.questName,
        script: audioTrack.script,
        city: audioTrack.city,
        waypointIndex: audioTrack.waypointIndex,
        questId: audioTrack.questId,
        audioUrl: audioTrack.audioUrl
      });
    }
  };

  const skipAudio = (deltaSeconds: number) => {
    if (!audioTrack) return;
    const nextTime = Math.max(0, Math.min(audioTrack.duration, audioTrack.currentTime + deltaSeconds));
    setAudioTrack({ ...audioTrack, currentTime: nextTime });
  };

  const setPlaybackRate = (rate: number) => {
    if (!audioTrack) return;
    setAudioTrack({ ...audioTrack, playbackRate: rate });
    if (audioTrack.isPlaying) {
      vietnameseSpeech.speak(audioTrack.script, {
        rate,
        voiceId: selectedVoiceId,
        onEnd: () => {
          setAudioTrack((prev) => {
            if (prev && prev.isPlaying) {
              handleTrackEnded(prev);
            }
            return prev ? { ...prev, isPlaying: false } : null;
          });
        }
      });
    }
  };

  const nextAudioTrack = () => {
    if (!audioTrack) return;
    handleTrackEnded(audioTrack);
  };

  const prevAudioTrack = () => {
    if (!audioTrack) return;
    const currentQuest = quests.find(
      (q) => q.id === audioTrack.questId || q.name.toLowerCase() === audioTrack.questName.toLowerCase()
    );
    if (
      currentQuest &&
      currentQuest.waypoints &&
      audioTrack.waypointIndex !== undefined &&
      audioTrack.waypointIndex > 0
    ) {
      const prevIndex = audioTrack.waypointIndex - 1;
      const prevWp = currentQuest.waypoints[prevIndex];
      playAudio({
        title: prevWp.name,
        questName: currentQuest.name,
        script: prevWp.script,
        city: currentQuest.city,
        waypointIndex: prevIndex,
        questId: currentQuest.id
      });
    } else {
      // Restart current
      seekAudio(0);
    }
  };

  const stopAudio = () => {
    clearAudioTimer();
    vietnameseSpeech.stop();
    setAudioTrack(null);
  };

  const toggleMinimizeAudio = () => {
    setAudioTrack((prev) => (prev ? { ...prev, isMinimized: !prev.isMinimized } : null));
  };

  const addQuest = (newQuest: Quest) => {
    setQuests((prev) => [newQuest, ...prev]);
  };

  const createQuest = async (newQuest: Quest) => {
    addQuest(newQuest);
    addPendingReview(newQuest);
    try {
      await createQuestService(newQuest);
    } catch (e) {
      console.warn('createQuest Firestore sync notice:', e);
    }
  };

  const removeQuest = (id: number | string) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  };

  const addPendingReview = (quest: Quest) => {
    setPendingReviews((prev) => [quest, ...prev]);
  };

  const approvePendingReview = (id: number | string) => {
    setPendingReviews((prev) => prev.filter((q) => q.id !== id));
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, status: 'active' } : q)));
    approveQuestService(id).catch(console.warn);
  };

  const rejectPendingReview = (id: number | string) => {
    setPendingReviews((prev) => prev.filter((q) => q.id !== id));
    rejectQuestService(id).catch(console.warn);
  };

  const approveGuide = async (id: number | string) => {
    setPendingGuides((prev) => prev.map((g) => g.id === id ? { ...g, status: 'approved' } : g));
    try {
      await approveGuideService(String(id));
    } catch (e) {
      console.warn('approveGuide notice:', e);
    }
  };

  const rejectGuide = async (id: number | string) => {
    setPendingGuides((prev) => prev.map((g) => g.id === id ? { ...g, status: 'rejected' } : g));
    try {
      await rejectGuideService(String(id));
    } catch (e) {
      console.warn('rejectGuide notice:', e);
    }
  };

  const approveQuest = async (id: number | string) => {
    setPendingQuests((prev) => prev.map((q) => q.id === id ? { ...q, status: 'approved' } : q));
    try {
      await approveQuestService(id);
    } catch (e) {
      console.warn('approveQuest notice:', e);
    }
  };

  const rejectQuest = async (id: number | string) => {
    setPendingQuests((prev) => prev.map((q) => q.id === id ? { ...q, status: 'rejected' } : q));
    try {
      await rejectQuestService(id);
    } catch (e) {
      console.warn('rejectQuest notice:', e);
    }
  };

  const approveWithdrawal = async (id: number | string) => {
    const item = pendingWithdrawals.find((w) => w.id === id);
    setPendingWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: 'approved' } : w));
    if (item) {
      try {
        await approveWithdrawalService(String(id), item.guideId || 'guide-001', item.amount);
      } catch (e) {
        console.warn('approveWithdrawal notice:', e);
      }
    }
  };

  const rejectWithdrawal = async (id: number | string) => {
    setPendingWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: 'rejected' } : w));
    try {
      await rejectWithdrawalService(String(id));
    } catch (e) {
      console.warn('rejectWithdrawal notice:', e);
    }
  };

  const navigateToQuestDetail = (quest: Quest) => {
    setSelectedQuest(quest);
    setActivePage('QUEST_DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCheckout = (quest: Quest, initialSchedule?: { date?: string; time?: string }) => {
    setSelectedQuest(quest);
    if (initialSchedule?.date) setBookingDate(initialSchedule.date);
    if (initialSchedule?.time) setBookingTime(initialSchedule.time);
    setActivePage('CHECKOUT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startGameplay = (ticket: Ticket) => {
    setActiveTicket(ticket);
    const quest = quests.find((q) => q.id === ticket.questId) || quests[0];
    setSelectedQuest(quest);
    setActivePage('GAMEPLAY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <QuestContext.Provider
      value={{
        quests,
        setQuests,
        selectedQuest,
        setSelectedQuest,
        activePage,
        setActivePage,
        selectedCity,
        setSelectedCity,
        selectedTheme,
        setSelectedTheme,
        searchQuery,
        setSearchQuery,
        tickets,
        setTickets,
        addTicket,
        activeTicket,
        setActiveTicket,
        celebration,
        clearCelebration,
        audioTrack,
        selectedVoiceId,
        setSelectedVoiceId: changeVoice,
        availableVoices,
        playAudio,
        pauseAudio,
        resumeAudio,
        toggleAudioPlay,
        seekAudio,
        skipAudio,
        setPlaybackRate,
        nextAudioTrack,
        prevAudioTrack,
        stopAudio,
        toggleMinimizeAudio,
        addQuest,
        createQuest,
        removeQuest,
        pendingGuides,
        pendingQuests,
        pendingReviews,
        pendingWithdrawals,
        approveGuide,
        rejectGuide,
        approveQuest,
        rejectQuest,
        approvePendingReview,
        rejectPendingReview,
        addPendingReview,
        approveWithdrawal,
        rejectWithdrawal,
        bookingDate,
        setBookingDate,
        bookingTime,
        setBookingTime,
        navigateToQuestDetail,
        navigateToCheckout,
        startGameplay
      }}
    >
      {children}
    </QuestContext.Provider>
  );
}

export function useQuest() {
  const context = useContext(QuestContext);
  if (!context) throw new Error('useQuest must be used within a QuestProvider');
  return context;
}
