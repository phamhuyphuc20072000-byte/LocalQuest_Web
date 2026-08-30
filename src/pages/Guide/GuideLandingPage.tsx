import React from 'react';
import { 
  Award, 
  Sparkles, 
  DollarSign, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  MapPin, 
  BookOpen, 
  CheckCircle2 
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';

export function GuideLandingPage() {
  const { setActivePage } = useQuest();
  const { role, loginAsDemo } = useAuth();

  const handleStartGuide = () => {
    if (role === 'guide') {
      setActivePage('GUIDE_STUDIO');
    } else {
      setActivePage('GUIDE_REGISTER');
    }
  };

  return (
    <div className="min-h-screen space-y-16 pb-24">
      
      {/* 1. Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 text-white overflow-hidden text-center" style={{
        background: 'linear-gradient(180deg, #0F2D1E 0%, #153826 60%, #121412 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-[#D4AF37]/50 text-amber-300 text-xs font-mono">
            <Award size={14} className="text-amber-400" />
            <span className="font-semibold uppercase tracking-wider">CHƯƠNG TRÌNH ĐỒNG HÀNH VỚI NGHỆ NHÂN BẢN ĐỊA</span>
          </div>

          <h1 className="font-heritage text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight gold-gradient-text">
            Biến Câu Chuyện Quê Hương <br />
            Thành Thu Nhập Thượng Lưu
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-300 font-luxury-sans leading-relaxed">
            Bạn am hiểu từng ngõ ngách, ẩm thực bí mật hay huyền tích lịch sử của vùng đất mình sinh sống? Hãy gia nhập mạng lưới Local Guide và chia sẻ tới hàng triệu du khách.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartGuide}
              className="btn-gold-aura py-4 px-8 text-sm"
            >
              <span>{role === 'guide' ? 'TRUY CẬP GUIDE STUDIO' : 'ĐĂNG KÝ TRỞ THÀNH LOCAL GUIDE'}</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                loginAsDemo('guide');
                setActivePage('GUIDE_STUDIO');
              }}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 text-xs font-mono font-semibold transition-colors"
            >
              Xem Thử Giao Diện Studio (Demo)
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Benefits (80% Revenue split) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono text-amber-700 font-bold uppercase tracking-wider">ĐẶC QUYỀN NGHỆ NHÂN</span>
          <h2 className="font-heritage text-3xl font-bold text-stone-900 mt-1">Tại Sao Nên Đồng Hành Cùng LocalQuest?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-[#FDFAF5] border border-[#D4AF37]/40 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700">
              <DollarSign size={28} />
            </div>
            <h3 className="font-heritage text-xl font-bold text-[#0F2D1E]">
              Chia Sẻ 80% Doanh Thu
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-luxury-sans leading-relaxed">
              Mức chia sẻ doanh thu cao nhất thị trường. Nhận tiền bán vé thụ động 24/7 mỗi khi có du khách mở khoá Quest của bạn.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-[#FDFAF5] border border-[#D4AF37]/40 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700">
              <Sparkles size={28} />
            </div>
            <h3 className="font-heritage text-xl font-bold text-[#0F2D1E]">
              Hệ Thống AI Studio Hỗ Trợ
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-luxury-sans leading-relaxed">
              Công cụ tạo bản đồ kho báu kéo thả thông minh, tự động chuyển kịch bản của bạn thành giọng đọc AI Voice chuyên nghiệp.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-[#FDFAF5] border border-[#D4AF37]/40 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-heritage text-xl font-bold text-[#0F2D1E]">
              Bảo Hộ Bản Quyền Di Sản
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-luxury-sans leading-relaxed">
              Mọi nội dung, mật thư và câu chuyện của bạn đều được cấp chứng nhận bản quyền số và tôn vinh danh tiếng cá nhân.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Steps to publish */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#121412] border border-[#D4AF37]/40 text-white space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-heritage text-2xl sm:text-3xl font-bold gold-gradient-text">
              Quy Trình 3 Bước Đơn Giản
            </h2>
            <p className="text-xs text-stone-400 font-luxury-sans mt-1">Từ ý tưởng đến lúc đón những du khách đầu tiên</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-luxury-sans text-xs">
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <span className="font-heritage text-3xl font-bold text-amber-400">01</span>
              <h4 className="text-base font-bold text-stone-100 font-heritage">Đăng Ký Hồ Sơ Nghệ Nhân</h4>
              <p className="text-stone-400">Điền thông tin giới thiệu và vùng đất di sản bạn am hiểu nhất.</p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <span className="font-heritage text-3xl font-bold text-amber-400">02</span>
              <h4 className="text-base font-bold text-stone-100 font-heritage">Tạo Nhiệm Vụ Trên Bản Đồ</h4>
              <p className="text-stone-400">Chấm các trạm dừng, soạn kịch bản thuyết minh và câu đố trắc nghiệm.</p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <span className="font-heritage text-3xl font-bold text-amber-400">03</span>
              <h4 className="text-base font-bold text-stone-100 font-heritage">Nhận Doanh Thu Thụ Động</h4>
              <p className="text-stone-400">Quest được duyệt và mở bán cho du khách khắp nơi trên thế giới.</p>
            </div>
          </div>

          <div className="text-center pt-4">
            <button
              onClick={handleStartGuide}
              className="btn-gold-aura py-3.5 px-8 text-xs font-bold"
            >
              <span>BẮT ĐẦU NGAY HÔM NAY</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
