import React, { useState } from 'react';
import { 
  ArrowLeft, 
  PlusCircle, 
  Trash2, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Save, 
  Send, 
  Volume2, 
  HelpCircle,
  Clock,
  Footprints,
  Loader2,
  Wand2
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { Quest, Waypoint, QuestTheme, QuestDifficulty } from '../../types';
import { LeafletStudioMap } from '../../components/maps/LeafletStudioMap';
import { generateWaypointScriptWithGemini } from '../../gemini';
import { DateTimePicker } from '../../components/common/DateTimePicker';

export function QuestCreatorPage() {
  const { setActivePage, addQuest, addPendingReview, playAudio } = useQuest();
  const { userProfile } = useAuth();

  // Basic Info State
  const [name, setName] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [theme, setTheme] = useState<QuestTheme>('Bí ẩn');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('Trung bình');
  const [teaser, setTeaser] = useState('');
  const [story, setStory] = useState('');
  const [price, setPrice] = useState(199000);
  const [walkTime, setWalkTime] = useState('90 phút');
  const [distance, setDistance] = useState('2.5 km');

  // Schedule & Departure State (Datepicker & Departure Times)
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [selectedDepartureTime, setSelectedDepartureTime] = useState('08:30');
  const [departureTimes, setDepartureTimes] = useState<string[]>(['08:30', '14:00', '16:30']);

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'name': {
        const trimmed = typeof value === 'string' ? value.trim() : '';
        if (!trimmed) return 'Thiếu chi tiết: Vui lòng nhập tên Quest di sản.';
        if (trimmed.length < 5) return 'Sai định dạng: Tên Quest tối thiểu 5 ký tự.';
        return '';
      }
      case 'startDate': {
        if (!value) return 'Thiếu chi tiết: Vui lòng chọn ngày mở tour khởi hành.';
        const currentToday = new Date().toISOString().split('T')[0];
        if (value < currentToday) return 'Sai định dạng: Ngày khởi hành không thể ở trong quá khứ.';
        return '';
      }
      case 'departureTime': {
        if (!value) return 'Thiếu chi tiết: Vui lòng chọn hoặc nhập khung giờ khởi hành.';
        return '';
      }
      case 'teaser': {
        const trimmed = typeof value === 'string' ? value.trim() : '';
        if (!trimmed) return 'Thiếu chi tiết: Vui lòng nhập đoạn tóm tắt hấp dẫn.';
        return '';
      }
      case 'story': {
        const trimmed = typeof value === 'string' ? value.trim() : '';
        if (!trimmed) return 'Thiếu chi tiết: Vui lòng nhập bối cảnh câu chuyện.';
        return '';
      }
      default:
        return '';
    }
  };

  const handleBlur = (field: string, val: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  // Waypoints state
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    {
      id: 1,
      name: 'Trạm 1: Khởi Đầu Cửa Ô',
      lat: 21.0345,
      lng: 105.8505,
      script: 'Chào mừng các bạn đến với cổng di sản đầu tiên. Nơi đây từng là bức tường thành kiên cố bảo vệ kinh kỳ.',
      question: 'Hoa văn trên vòm cổng đại diện cho triều đại nào?',
      answers: ['Triều Lý', 'Triều Lê', 'Triều Nguyễn', 'Triều Trần'],
      correct: 1
    }
  ]);

  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);
  const [generatingAiIndex, setGeneratingAiIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'waypoints' | 'preview'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMapStation = (lat: number, lng: number) => {
    const nextId = waypoints.length + 1;
    const newWp: Waypoint = {
      id: nextId,
      name: `Trạm ${nextId}: Điểm Di Sản Mới`,
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      script: `Chào mừng bạn đến với Trạm ${nextId}. Nơi đây lưu giữ những giá trị văn hóa độc bản của ${city}.`,
      question: 'Thử thách mật mã thực địa tại trạm này là gì?',
      answers: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
      correct: 0
    };
    setWaypoints([...waypoints, newWp]);
    setActiveWaypointIndex(waypoints.length);
  };

  const handleUpdateWaypoint = (index: number, field: keyof Waypoint, value: any) => {
    const copy = [...waypoints];
    copy[index] = { ...copy[index], [field]: value };
    setWaypoints(copy);
  };

  const handleUpdateWaypointCoord = (index: number, lat: number, lng: number) => {
    const copy = [...waypoints];
    if (copy[index]) {
      copy[index] = { ...copy[index], lat, lng };
      setWaypoints(copy);
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    if (waypoints.length <= 1) {
      alert('Một Quest phải có ít nhất 1 trạm dừng.');
      return;
    }
    const filtered = waypoints.filter((_, i) => i !== index).map((w, idx) => ({ ...w, id: idx + 1 }));
    setWaypoints(filtered);
    if (activeWaypointIndex >= filtered.length) {
      setActiveWaypointIndex(filtered.length - 1);
    }
  };

  // Generate Audio Script with Gemini AI
  const handleGenerateAiScript = async (index: number) => {
    const wp = waypoints[index];
    if (!wp) return;

    setGeneratingAiIndex(index);
    try {
      const generatedScript = await generateWaypointScriptWithGemini(
        wp.name || `Trạm ${index + 1}`,
        city,
        name || 'Hành Trình Di Sản Bản Địa',
        theme,
        wp.script
      );

      handleUpdateWaypoint(index, 'script', generatedScript);
    } catch (err) {
      console.error('Error generating script:', err);
    } finally {
      setGeneratingAiIndex(null);
    }
  };

  // Preview Audio
  const handlePreviewAudio = (index: number) => {
    const wp = waypoints[index];
    if (!wp) return;
    playAudio({
      title: wp.name,
      questName: name || 'Bản Nháp Quest Mới',
      script: wp.script,
      city: city,
      waypointIndex: index
    });
  };

  const handlePublishQuest = () => {
    const nameErr = validateField('name', name);
    const dateErr = validateField('startDate', startDate);
    const timeErr = validateField('departureTime', selectedDepartureTime);
    const teaserErr = validateField('teaser', teaser);
    const storyErr = validateField('story', story);

    setTouched({
      name: true,
      startDate: true,
      departureTime: true,
      teaser: true,
      story: true
    });

    setErrors({
      name: nameErr,
      startDate: dateErr,
      departureTime: timeErr,
      teaser: teaserErr,
      story: storyErr
    });

    if (nameErr || dateErr || timeErr || teaserErr || storyErr) {
      alert('Vui lòng kiểm tra lại thông tin Quest: ' + (nameErr || dateErr || timeErr || teaserErr || storyErr));
      setActiveTab('info');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const activeTimes = departureTimes.length > 0 ? departureTimes : [selectedDepartureTime || '08:30'];
      const newQuest: Quest = {
        id: 'quest-' + Date.now(),
        name,
        city,
        theme,
        difficulty,
        teaser,
        story,
        price,
        rating: 5.0,
        reviews: 0,
        walkTime,
        distance,
        startDate,
        departureTimes: activeTimes,
        imageId: 'hanoi_old_quarter',
        guideName: userProfile?.displayName || 'Local Guide',
        guideRating: 5.0,
        guideImageId: 'guide_avatar_1',
        status: 'pending',
        waypoints
      };

      addQuest(newQuest);
      addPendingReview(newQuest);
      setIsSubmitting(false);

      alert('Đã gửi Quest lên Ban Quản Trị thẩm định thành công! Lịch khởi hành bắt đầu từ: ' + startDate + ' với các khung giờ: ' + activeTimes.join(', '));
      setActivePage('GUIDE_STUDIO');
    }, 1200);
  };

  return (
    <div className="min-h-screen pb-24 space-y-8">
      
      {/* Top Header Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
        <button
          onClick={() => setActivePage('GUIDE_STUDIO')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-[#FDFAF5] transition-colors shadow-xs font-mono"
        >
          <ArrowLeft size={14} />
          <span>QUAY LẠI GUIDE STUDIO</span>
        </button>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-200/80 border border-stone-300 text-xs font-mono">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'info' ? 'bg-[#0F2D1E] text-amber-300 shadow-xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            1. Thông Tin Chung
          </button>
          <button
            onClick={() => setActiveTab('waypoints')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'waypoints' ? 'bg-[#0F2D1E] text-amber-300 shadow-xs' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            2. Trạm Dừng & Mật Thư ({waypoints.length})
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 'info' && (
          <div 
            className="rounded-3xl p-8 sm:p-10 shadow-2xl border space-y-6 animate-in fade-in duration-200"
            style={{
              background: '#FDFAF5',
              borderColor: '#D4AF37'
            }}
          >
            <div>
              <span className="text-xs font-mono text-amber-700 font-bold uppercase tracking-wider">
                BƯỚC 1: XÂY DỰNG BỐI CẢNH & THÔNG ĐIỆP
              </span>
              <h1 className="font-heritage text-3xl font-bold text-[#0F2D1E] mt-1">
                Khởi Tạo Nhiệm Vụ Di Sản
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-stone-700 font-bold block">TÊN NHIỆM VỤ (QUEST NAME) *</label>
                  {touched.name && !errors.name && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Hợp lệ
                    </span>
                  )}
                </div>
                <input
                  id="input-guide-quest-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (touched.name) handleBlur('name', e.target.value);
                  }}
                  onBlur={() => handleBlur('name', name)}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-base focus:outline-none font-heritage font-bold transition-colors ${
                    touched.name && errors.name
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:border-[#1C4A32]'
                  }`}
                  placeholder="Ví dụ: Bí Mật Mật Mã Cổ Trấn Phố Hội"
                />
                {touched.name && errors.name && (
                  <p className="text-xs font-mono text-rose-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">THÀNH PHỐ THỰC HIỆN *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono cursor-pointer"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Hội An">Hội An</option>
                  <option value="Huế">Huế</option>
                  <option value="Đà Lạt">Đà Lạt</option>
                  <option value="Ninh Bình">Ninh Bình</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">CHỦ ĐỀ KHÁM PHÁ *</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as QuestTheme)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono cursor-pointer"
                >
                  <option value="Bí ẩn">Bí ẩn (Mystery)</option>
                  <option value="Ẩm thực">Ẩm thực (Culinary)</option>
                  <option value="Đêm">Đêm (Night Life & Spirits)</option>
                  <option value="Lịch sử">Lịch sử (Royal & Dynasty)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">ĐỘ KHÓ *</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestDifficulty)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono cursor-pointer"
                >
                  <option value="Dễ">Dễ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Thử thách">Thử thách</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">GIÁ VÉ ĐỀ XUẤT (VND) *</label>
                <input
                  type="number"
                  value={price}
                  step={10000}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono font-bold text-[#C97D1A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">THỜI GIAN ĐI BỘ ƯỚC TÍNH</label>
                <input
                  type="text"
                  value={walkTime}
                  onChange={(e) => setWalkTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono"
                  placeholder="90 phút"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">QUÃNG ĐƯỜNG DI CHUYỂN</label>
                <input
                  type="text"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono"
                  placeholder="2.5 km"
                />
              </div>

              {/* Departure Schedule & Time slots Config for Guide */}
              <div className="space-y-3 sm:col-span-2 pt-3 border-t border-stone-300">
                <DateTimePicker
                  idPrefix="guide-create-dt"
                  label="LỊCH TRÌNH KHỞI HÀNH & GIỜ ĐI (DATEPICKER CHO GUIDE) *"
                  selectedDate={startDate}
                  onDateChange={(val) => {
                    setStartDate(val);
                    if (touched.startDate) {
                      handleBlur('startDate', val);
                    }
                  }}
                  selectedTime={selectedDepartureTime}
                  onTimeChange={(val) => {
                    setSelectedDepartureTime(val);
                    if (!departureTimes.includes(val)) {
                      setDepartureTimes((prev) => [...prev, val].sort());
                    }
                  }}
                  onBlur={() => handleBlur('startDate', startDate)}
                  isTouched={touched.startDate}
                  error={errors.startDate}
                  mode="guide"
                />

                {/* Additional Available Departure Times Chips */}
                <div className="p-4 rounded-2xl bg-[#F5F0E8] border border-amber-300/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-mono font-bold text-stone-800 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-700" />
                      CÁC KHUNG GIỜ MỞ TOUR TRONG NGÀY ({departureTimes.length} khung giờ)
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Du khách có thể chọn một trong các khung giờ này khi đặt vé
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {departureTimes.map((slot) => (
                      <span
                        key={slot}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-400/80 font-mono text-xs font-bold text-[#0F2D1E] shadow-2xs"
                      >
                        <Clock size={12} className="text-amber-700" />
                        {slot}
                        {departureTimes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDepartureTimes((prev) => prev.filter((t) => t !== slot))}
                            className="text-stone-400 hover:text-rose-600 ml-1 transition-colors font-bold"
                            title="Xoá khung giờ này"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}

                    {/* Quick add slot input */}
                    <div className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-stone-300">
                      <input
                        type="time"
                        id="input-add-custom-slot"
                        className="text-xs font-mono bg-transparent outline-none cursor-pointer"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !departureTimes.includes(val)) {
                            setDepartureTimes((prev) => [...prev, val].sort());
                          }
                        }}
                      />
                      <span className="text-[10px] text-stone-500 font-mono">+ Thêm giờ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-stone-700 font-bold block">ĐOẠN TÓM TẮT HẤP DẪN (TEASER) *</label>
                  {touched.teaser && !errors.teaser && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Hợp lệ
                    </span>
                  )}
                </div>
                <input
                  id="input-guide-teaser"
                  type="text"
                  value={teaser}
                  onChange={(e) => {
                    setTeaser(e.target.value);
                    if (touched.teaser) handleBlur('teaser', e.target.value);
                  }}
                  onBlur={() => handleBlur('teaser', teaser)}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm font-luxury-sans transition-colors ${
                    touched.teaser && errors.teaser
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:border-[#1C4A32]'
                  }`}
                  placeholder="1-2 câu lôi cuốn du khách bắt đầu chuyến phiêu lưu..."
                />
                {touched.teaser && errors.teaser && (
                  <p className="text-xs font-mono text-rose-600">{errors.teaser}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-stone-700 font-bold block">CÂU CHUYỆN & BỐI CẢNH VĂN HOÁ (NARRATIVE STORY) *</label>
                  {touched.story && !errors.story && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Hợp lệ
                    </span>
                  )}
                </div>
                <textarea
                  id="input-guide-story"
                  value={story}
                  onChange={(e) => {
                    setStory(e.target.value);
                    if (touched.story) handleBlur('story', e.target.value);
                  }}
                  onBlur={() => handleBlur('story', story)}
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm font-luxury-sans leading-relaxed transition-colors ${
                    touched.story && errors.story
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-stone-300 focus:border-[#1C4A32]'
                  }`}
                  placeholder="Kể lại bối cảnh lịch sử, huyền tích hoặc câu chuyện đời sống chân thật nhất của vùng đất..."
                />
                {touched.story && errors.story && (
                  <p className="text-xs font-mono text-rose-600">{errors.story}</p>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('waypoints')}
                className="btn-gold-aura py-3 px-8 text-xs font-bold"
              >
                <span>TIẾP TỤC: THIẾT KẾ BẢN ĐỒ & CÂU ĐỐ</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WAYPOINTS & MAP */}
        {activeTab === 'waypoints' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Map Click Station Builder */}
            <div 
              className="p-6 rounded-3xl bg-[#FDFAF5] border space-y-4 shadow-xl"
              style={{ borderColor: '#D4AF37' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heritage text-xl font-bold text-[#0F2D1E] m-0">
                    Bản Đồ Kéo Thả Trạm Dừng ({waypoints.length} Trạm)
                  </h3>
                  <p className="text-xs text-stone-500 font-luxury-sans m-0">
                    Click chuột lên bản đồ để thêm trạm mới. Hệ thống sẽ tự động vẽ lộ trình nối các trạm.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddMapStation(21.03 + Math.random() * 0.01, 105.85 + Math.random() * 0.01)}
                  className="btn-emerald-luxury text-xs px-4 py-2"
                >
                  <PlusCircle size={14} />
                  <span>+ Thêm Trạm Mới</span>
                </button>
              </div>

              <LeafletStudioMap
                waypoints={waypoints}
                onAddWaypoint={handleAddMapStation}
                onUpdateWaypointCoord={handleUpdateWaypointCoord}
                onSelectWaypoint={(idx) => setActiveWaypointIndex(idx)}
                activeWaypointIndex={activeWaypointIndex}
                city={city}
                height={420}
              />
            </div>

            {/* List of Waypoint Editor Cards */}
            <div className="space-y-6">
              {waypoints.map((wp, index) => {
                const isGenerating = generatingAiIndex === index;
                const isSelected = activeWaypointIndex === index;

                return (
                  <div
                    key={wp.id}
                    className={`p-6 rounded-3xl bg-white border transition-all duration-200 shadow-md space-y-4 relative ${
                      isSelected ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30' : 'border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-[#0F2D1E] text-amber-300 flex items-center justify-center font-heritage font-bold text-xs border border-[#D4AF37]">
                          {wp.id}
                        </span>
                        <div>
                          <h4 className="font-heritage text-base font-bold text-stone-900 m-0">
                            Biên Soạn Nội Dung Trạm {wp.id}
                          </h4>
                          <span className="text-[10px] text-stone-500 font-mono">
                            GPS: {wp.lat.toFixed(5)}, {wp.lng.toFixed(5)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePreviewAudio(index)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-400/40 text-xs font-mono flex items-center gap-1.5 transition-colors"
                          title="Nghe thử âm thanh trạm này"
                        >
                          <Volume2 size={13} />
                          <span>Nghe Thử</span>
                        </button>

                        <button
                          onClick={() => handleRemoveWaypoint(index)}
                          className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                          title="Xoá trạm này"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-mono text-stone-600 block font-bold">TÊN ĐỊA DANH TRẠM *</label>
                        <input
                          type="text"
                          value={wp.name}
                          onChange={(e) => handleUpdateWaypoint(index, 'name', e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-[#FDFAF5] font-heritage font-bold"
                          placeholder="Ví dụ: Cổng Ngọ Môn - Đại Nội Huế"
                        />
                      </div>

                      {/* AI Audio Script Section */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono text-stone-600 block font-bold">
                            KỊCH BẢN THUYẾT MINH AI (AUDIO SCRIPT) *
                          </label>

                          <button
                            type="button"
                            disabled={isGenerating}
                            onClick={() => handleGenerateAiScript(index)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-[11px] font-mono shadow-sm transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-stone-950" />
                                <span>Đang Gọi Gemini AI...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} className="text-stone-950" />
                                <span>✨ AI Sinh Kịch Bản Thuyết Minh</span>
                              </>
                            )}
                          </button>
                        </div>

                        <textarea
                          value={wp.script}
                          onChange={(e) => handleUpdateWaypoint(index, 'script', e.target.value)}
                          rows={3}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-[#FDFAF5] font-luxury-sans leading-relaxed"
                          placeholder="Nội dung sẽ được AI đọc bằng giọng điệu truyền cảm cho du khách..."
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-mono text-stone-600 block font-bold">CÂU HỎI MẬT THƯ / CÂU ĐỐ THỰC ĐỊA *</label>
                        <input
                          type="text"
                          value={wp.question}
                          onChange={(e) => handleUpdateWaypoint(index, 'question', e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 bg-[#FDFAF5] font-luxury-sans font-semibold"
                        />
                      </div>

                      {/* 4 Answers */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-mono text-stone-600 block font-bold">4 LỰA CHỌN ĐÁP ÁN (CHỌN ĐÁP ÁN ĐÚNG)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {wp.answers.map((ans, aIdx) => (
                            <div key={aIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-ans-${wp.id}`}
                                checked={wp.correct === aIdx}
                                onChange={() => handleUpdateWaypoint(index, 'correct', aIdx)}
                                className="w-4 h-4 text-emerald-700 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={ans}
                                onChange={(e) => {
                                  const ansCopy = [...wp.answers];
                                  ansCopy[aIdx] = e.target.value;
                                  handleUpdateWaypoint(index, 'answers', ansCopy);
                                }}
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                                placeholder={`Đáp án ${aIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="btn-outline-gold text-xs px-6 py-3"
              >
                Quay Lại Bước 1
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePublishQuest}
                className="btn-gold-aura py-3.5 px-8 text-xs font-bold"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-spin" size={15} /> Đang Nộp Hồ Sơ Quest...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={15} /> GỬI DUYỆT & XUẤT BẢN QUEST
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

