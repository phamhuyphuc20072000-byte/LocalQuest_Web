import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Award, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  DollarSign
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { registerGuide } from '../../services/guideService';

export function GuideRegisterPage() {
  const { setActivePage } = useQuest();
  const { userProfile, setRole, loginAsDemo } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [city, setCity] = useState('Hà Nội');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [bio, setBio] = useState('Nghệ nhân kể chuyện di sản với hơn 8 năm nghiên cứu văn hoá cổ truyền và ẩm thực bản địa.');
  const [experience, setExperience] = useState('5 năm');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccount, setBankAccount] = useState('001100438999');
  const [bankHolder, setBankHolder] = useState(userProfile?.displayName?.toUpperCase() || 'HOANG DUC THANH');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !agreedTerms) {
      alert('Vui lòng điền đầy đủ thông tin và đồng ý điều khoản.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerGuide({
        uid: userProfile?.uid,
        fullName,
        email: userProfile?.email || `${phone}@localquest.vn`,
        phone,
        city,
        bio,
        bankName,
        bankAccount,
        bankHolder,
        specialties: ['Văn Hoá Phố Cổ', 'Ẩm Thực Di Sản', 'Kiến Trúc']
      });

      setRole('guide');
      loginAsDemo('guide');
      setIsSubmitting(false);
      alert('Chúc mừng! Hồ sơ Nghệ Nhân của bạn đã được gửi thành công lên hệ thống LocalQuest.');
      setActivePage('GUIDE_STUDIO');
    } catch (err) {
      setRole('guide');
      loginAsDemo('guide');
      setIsSubmitting(false);
      setActivePage('GUIDE_STUDIO');
    }
  };

  return (
    <div className="min-h-screen pb-24 space-y-8">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => setActivePage('GUIDE_LANDING')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-[#FDFAF5] transition-colors shadow-xs font-mono"
        >
          <ArrowLeft size={14} />
          <span>QUAY LẠI TRANG CHỦ GUIDE</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="rounded-3xl p-8 sm:p-10 shadow-2xl border space-y-8"
          style={{
            background: '#FDFAF5',
            borderColor: '#D4AF37',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
          }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-700 font-bold uppercase tracking-wider">
              <Award size={16} className="text-amber-600" />
              <span>HỒ SƠ ĐỒNG HÀNH VĂN HOÁ</span>
            </div>
            <h1 className="font-heritage text-3xl font-bold text-[#0F2D1E] mt-1">
              Đăng Ký Trở Thành Local Guide
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-luxury-sans mt-1">
              Điền thông tin giới thiệu của bạn để tham gia mạng lưới sáng tạo nội dung di sản và nhận 85% doanh thu bán vé.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">HỌ TÊN ĐẦY ĐỦ *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-luxury-sans"
                  placeholder="Ví dụ: Lê Hoàng Nam"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">THÀNH PHỐ HOẠT ĐỘNG CHÍNH *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-mono cursor-pointer"
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
                <label className="text-xs font-mono text-stone-700 font-bold block">SỐ ĐIỆN THOẠI LIÊN HỆ *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-mono"
                  placeholder="0988 123 456"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">KINH NGHIỆM AM HIỂU BẢN ĐỊA</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-luxury-sans"
                  placeholder="Ví dụ: 5 năm hướng dẫn viên hoặc nghiên cứu ẩm thực"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono text-stone-700 font-bold block">TIỂU SỬ & CÂU CHUYỆN CỦA BẠN (BIO)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-luxury-sans leading-relaxed"
                  placeholder="Chia sẻ về đam mê văn hóa, những bí mật góc phố bạn muốn mang tới du khách..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">NGÂN HÀNG THỤ HƯỞNG</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                >
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="MBBank">MBBank</option>
                  <option value="BIDV">BIDV</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-700 font-bold block">SỐ TÀI KHOẢN</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                  placeholder="001100438999"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="p-4 rounded-2xl bg-[#F5F0E8] border border-stone-300 flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-stone-700 font-luxury-sans cursor-pointer">
                Tôi cam kết mọi nội dung kịch bản, hình ảnh và câu đố do tôi tải lên đều tuân thủ thuần phong mỹ tục, bảo tồn sự chính xác của di sản lịch sử và đồng ý với mức chia sẻ thù lao 85/15 của LocalQuest.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gold-aura py-4 text-sm font-bold tracking-wider"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="animate-spin" /> Đang Lưu Hồ Sơ Realtime...
                </span>
              ) : (
                <span>HOÀN TẤT ĐĂNG KÝ & VÀO GUIDE STUDIO</span>
              )}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}
