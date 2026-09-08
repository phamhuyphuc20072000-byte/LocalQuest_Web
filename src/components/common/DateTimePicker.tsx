import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export interface DateTimePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (dateStr: string) => void;
  selectedTime: string; // HH:mm
  onTimeChange: (timeStr: string) => void;
  onBlur?: () => void;
  error?: string;
  isTouched?: boolean;
  minDate?: string;
  availableTimeSlots?: string[];
  label?: string;
  idPrefix?: string;
  mode?: 'tourist' | 'guide';
}

const DEFAULT_TIME_SLOTS = [
  { time: '08:00', label: '08:00 - Sáng sớm di sản' },
  { time: '09:30', label: '09:30 - Tour buổi sáng' },
  { time: '14:00', label: '14:00 - Đầu giờ chiều' },
  { time: '16:30', label: '16:30 - Hoàng hôn rực rỡ' },
  { time: '18:30', label: '18:30 - Phố cổ về đêm' },
];

export function DateTimePicker({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  onBlur,
  error,
  isTouched,
  minDate,
  availableTimeSlots,
  label = 'CHỌN NGÀY & GIỜ KHỞI HÀNH *',
  idPrefix = 'dt-picker',
  mode = 'tourist'
}: DateTimePickerProps) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const effectiveMinDate = minDate || todayStr;

  // Track month in the interactive calendar
  const initialDateObj = selectedDate ? new Date(selectedDate) : today;
  const [viewYear, setViewYear] = useState(
    isNaN(initialDateObj.getTime()) ? today.getFullYear() : initialDateObj.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    isNaN(initialDateObj.getTime()) ? today.getMonth() : initialDateObj.getMonth()
  );

  const [isCustomTime, setIsCustomTime] = useState(false);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar Calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // In JS, 0 is Sunday, 1 is Monday... Let Monday be column 0
  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday becomes index 6

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Quick shortcuts calculation
  const getNextDayOfWeek = (dayOfWeek: number) => {
    const d = new Date();
    const currentDay = d.getDay();
    const distance = (dayOfWeek + 7 - currentDay) % 7;
    d.setDate(d.getDate() + (distance === 0 ? 7 : distance));
    return d.toISOString().split('T')[0];
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const thisSaturdayStr = getNextDayOfWeek(6);
  const thisSundayStr = getNextDayOfWeek(0);

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return 'Chưa chọn ngày';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
        return `${dayNames[d.getDay()]}, ${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {
      // fallback
    }
    return dStr;
  };

  const slots = availableTimeSlots 
    ? availableTimeSlots.map(s => ({ time: s, label: s }))
    : DEFAULT_TIME_SLOTS;

  return (
    <div className="space-y-4 rounded-2xl p-4 sm:p-5 bg-white border border-stone-200 shadow-sm font-luxury-sans">
      
      {/* Header with Title and Validation Badge */}
      <div className="flex items-center justify-between">
        <label 
          htmlFor={`${idPrefix}-date-input`}
          className="text-xs font-mono font-bold text-stone-800 uppercase flex items-center gap-1.5"
        >
          <CalendarIcon size={14} className="text-amber-600" />
          <span>{label}</span>
        </label>

        {isTouched && !error && selectedDate && selectedTime ? (
          <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 size={12} /> Hợp lệ
          </span>
        ) : null}
      </div>

      {/* Interactive Departure Date Picker Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-stone-600">
          <span>1. Chọn Ngày Đi:</span>
          <span className="text-[11px] text-amber-800 font-bold">
            {formatDisplayDate(selectedDate)}
          </span>
        </div>

        {/* Quick Date Chips */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            id={`${idPrefix}-quick-today`}
            onClick={() => {
              onDateChange(todayStr);
              onBlur?.();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              selectedDate === todayStr
                ? 'bg-[#0F2D1E] text-amber-300 font-bold border border-amber-400 shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            Hôm nay
          </button>

          <button
            type="button"
            id={`${idPrefix}-quick-tomorrow`}
            onClick={() => {
              onDateChange(tomorrowStr);
              onBlur?.();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              selectedDate === tomorrowStr
                ? 'bg-[#0F2D1E] text-amber-300 font-bold border border-amber-400 shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            Ngày mai
          </button>

          <button
            type="button"
            id={`${idPrefix}-quick-sat`}
            onClick={() => {
              onDateChange(thisSaturdayStr);
              onBlur?.();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              selectedDate === thisSaturdayStr
                ? 'bg-[#0F2D1E] text-amber-300 font-bold border border-amber-400 shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            Thứ Bảy
          </button>

          <button
            type="button"
            id={`${idPrefix}-quick-sun`}
            onClick={() => {
              onDateChange(thisSundayStr);
              onBlur?.();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              selectedDate === thisSundayStr
                ? 'bg-[#0F2D1E] text-amber-300 font-bold border border-amber-400 shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            Chủ Nhật
          </button>
        </div>

        {/* Calendar Box */}
        <div className="p-3 rounded-xl bg-[#FDFAF5] border border-amber-200/70">
          {/* Calendar Month Controls */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-mono text-xs font-bold text-[#0F2D1E]">
              Tháng {viewMonth + 1}, {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-stone-200 text-stone-700 transition-colors"
              title="Tháng sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-stone-400 font-bold mb-1">
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span className="text-amber-700">T7</span>
            <span className="text-rose-600">CN</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((dayNum, idx) => {
              if (!dayNum) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }

              const formattedMonth = String(viewMonth + 1).padStart(2, '0');
              const formattedDay = String(dayNum).padStart(2, '0');
              const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

              const isPast = dateStr < effectiveMinDate;
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    onDateChange(dateStr);
                    onBlur?.();
                  }}
                  className={`h-8 rounded-lg text-xs font-mono transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#0F2D1E] text-amber-300 font-bold border border-amber-400 shadow-sm scale-105'
                      : isPast
                      ? 'text-stone-300 cursor-not-allowed'
                      : isToday
                      ? 'bg-amber-100 text-amber-900 font-bold hover:bg-amber-200'
                      : 'text-stone-800 hover:bg-stone-200'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Native Date Input Option for Accessibility & Direct Input */}
          <div className="pt-2 mt-2 border-t border-stone-200 flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Hoặc chọn nhanh từ lịch hệ thống:</span>
            <input
              id={`${idPrefix}-date-input`}
              type="date"
              min={effectiveMinDate}
              value={selectedDate}
              onChange={(e) => {
                onDateChange(e.target.value);
                if (e.target.value) {
                  const p = e.target.value.split('-');
                  if (p.length === 3) {
                    setViewYear(Number(p[0]));
                    setViewMonth(Number(p[1]) - 1);
                  }
                }
              }}
              onBlur={onBlur}
              className="px-2 py-1 rounded border border-stone-300 bg-white text-xs font-mono text-stone-800 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Interactive Time Slot Picker Section */}
      <div className="space-y-2.5 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs font-mono text-stone-600">
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-amber-600" />
            <span>2. Chọn Khung Giờ Khởi Hành:</span>
          </span>
          <span className="text-stone-900 font-bold">
            {selectedTime ? `${selectedTime} Giờ` : 'Chưa chọn giờ'}
          </span>
        </div>

        {/* Preset Slot Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {slots.map((s, idx) => {
            const isSelected = selectedTime === s.time;
            return (
              <button
                key={idx}
                type="button"
                id={`${idPrefix}-slot-${idx}`}
                onClick={() => {
                  onTimeChange(s.time);
                  setIsCustomTime(false);
                  onBlur?.();
                }}
                className={`p-2 rounded-xl text-left font-mono text-xs transition-all border ${
                  isSelected
                    ? 'bg-[#0F2D1E] text-amber-300 font-bold border-amber-400 shadow-sm'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="font-bold">{s.time}</div>
                <div className="text-[10px] opacity-80 truncate">{s.label.split(' - ')[1] || 'Khởi hành'}</div>
              </button>
            );
          })}

          {/* Custom Time Selection Button */}
          <button
            type="button"
            id={`${idPrefix}-custom-time-toggle`}
            onClick={() => setIsCustomTime(!isCustomTime)}
            className={`p-2 rounded-xl text-left font-mono text-xs transition-all border ${
              isCustomTime || (!slots.some(s => s.time === selectedTime) && selectedTime)
                ? 'bg-[#0F2D1E] text-amber-300 font-bold border-amber-400 shadow-sm'
                : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="font-bold flex items-center gap-1">
              <Sparkles size={11} /> Giờ tùy chọn
            </div>
            <div className="text-[10px] opacity-80">Nhập giờ theo ý muốn</div>
          </button>
        </div>

        {/* Custom Time Input Field if toggled */}
        {(isCustomTime || (!slots.some(s => s.time === selectedTime) && selectedTime)) && (
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-300 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <span className="text-xs font-mono text-stone-700">
              Nhập giờ khởi hành chính xác:
            </span>
            <input
              id={`${idPrefix}-custom-time-input`}
              type="time"
              value={selectedTime}
              onChange={(e) => {
                onTimeChange(e.target.value);
              }}
              onBlur={onBlur}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white font-mono text-sm font-bold text-stone-900 focus:outline-none focus:border-[#1C4A32]"
            />
          </div>
        )}
      </div>

      {/* Selected Result Summary Banner */}
      <div className="p-3 rounded-xl bg-[#0F2D1E] text-white flex items-center justify-between gap-3 text-xs font-mono border border-amber-400/40">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>
            {selectedDate && selectedTime ? (
              <>
                Lịch hẹn: <strong className="text-amber-300">{selectedTime}</strong> • <strong>{formatDisplayDate(selectedDate)}</strong>
              </>
            ) : (
              <span className="text-stone-300">Vui lòng bấm chọn ngày và giờ đi ở trên</span>
            )}
          </span>
        </div>
        {mode === 'tourist' && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 hidden sm:inline">
            Khởi hành chuẩn xác
          </span>
        )}
      </div>

      {/* Error Display */}
      {isTouched && error && (
        <div id={`${idPrefix}-error-msg`} className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-1 animate-in fade-in duration-200">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
