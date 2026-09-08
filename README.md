# 🧭 LocalQuest — Du Lịch & Khám Phá Thành Phố (Tourist & Guide Booking Platform)

Ứng dụng Web nền tảng kết nối **Khách Du Lịch (Tourist)** và **Hướng Dẫn Viên (Guide)** khám phá phố phường thông qua trải nghiệm thực tế và sáng tạo.

---

## 🚀 Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** React 18, TypeScript, Vite, Vanilla CSS (Glassmorphic UI)
- **Backend & Database:** Cloud Firestore (Firebase Database)
- **Authentication:** Firebase Auth (Google Sign-In Popup & Email/Password)
- **Deployment:** Firebase Hosting (`https://localquest2-tourist-web.web.app/`)

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

```bash
# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Chạy Dev Server
npm run dev

# 3. Build bản Production
npm run build
```

---

## 📌 Tính Năng Chính (Core Features)

- 🧭 **Khách du lịch (Tourist):**
  - Tìm kiếm chuyến đi (Quest) theo Thành phố (Hà Nội, Huế, Đà Nẵng, Hội An, TP.HCM) và Chủ đề (Ẩm thực, Lịch sử, Bí ẩn, Đêm).
  - Đặt vé chuyến đi & Thanh toán mượt mà.
  - Đăng nhập/Đăng ký tài khoản bằng Google Sign-In hoặc Email.
  - Quên mật khẩu & Khôi phục với mã OTP 6 chữ số.

- 🗺️ **Hướng dẫn viên (Guide):**
  - Đăng ký hồ sơ Hướng dẫn viên.
  - Tạo Quest chuyến đi mới & Lập lộ trình trạm dừng.
  - Quản lý lịch dẫn khách & Danh sách du khách tham gia.
  - Quản lý Ví tiền & Yêu cầu Rút tiền.

- ⚙️ **Admin Portal:**
  - Cổng quản trị bảo mật (/system-admin-portal).
  - Phê duyệt hồ sơ Guide mới & Phê duyệt Quest chuyến đi.
  - Xác nhận yêu cầu rút tiền của Guide.

---

© 2026 LocalQuest Inc. All rights reserved.
