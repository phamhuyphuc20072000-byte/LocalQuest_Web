export type Screen =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6_success' | 'A6_fail'
  | 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B7' | 'B8'
  | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD'
  | 'GAMEPLAY';

export type UserRole = 'tourist' | 'guide' | 'admin' | null;
export type QuestTheme = 'Ẩm thực' | 'Lịch sử' | 'Bí ẩn' | 'Đêm' | 'Tất cả';

export interface Waypoint {
  id: number;
  lat: number;
  lng: number;
  name: string;
  script: string;
  question: string;
  answers: string[];
  correct: number;
}

export interface Quest {
  id: number;
  name: string;
  city: string;
  theme: Exclude<QuestTheme, 'Tất cả'>;
  price: number;
  rating: number;
  reviews: number;
  difficulty: string;
  walkTime: string;
  distance: string;
  imageId: string;
  teaser: string;
  story: string;
  guideName: string;
  guideRating: number;
  guideImageId: string;
  lat: number;
  lng: number;
  waypoints: Waypoint[];
}

export const QUESTS: Quest[] = [
  {
    id: 1,
    name: 'Bí Ẩn Phố Cổ Hà Nội',
    city: 'Hà Nội',
    theme: 'Bí ẩn',
    price: 180000,
    rating: 4.8,
    reviews: 124,
    difficulty: 'Trung bình',
    walkTime: '2.5 giờ',
    distance: '3.2 km',
    imageId: '1555041469-a586c61ea9bc',
    teaser: 'Trong lòng phố cổ ngàn năm tuổi ẩn chứa những bí mật chưa ai kể...',
    story: 'Năm 1882, một thương nhân người Pháp đã giấu tài liệu mật trong một ngôi nhà ống tại phố Hàng Bạc. Hơn 140 năm sau, dấu vết của ông vẫn còn đó — nếu bạn đủ tinh ý để tìm. Cuộc hành trình dẫn bạn qua các trạm bí mật, mỗi trạm là một mảnh ghép của câu chuyện lịch sử chưa từng được ghi chép. Bạn có đủ dũng khí để giải mã bí ẩn của Phố Cổ?',
    guideName: 'Nguyễn Văn Minh',
    guideRating: 4.9,
    guideImageId: '1507003211169-0a1dd7228f2d',
    lat: 21.0285,
    lng: 105.8542,
    waypoints: [
      {
        id: 1,
        lat: 21.0285,
        lng: 105.8522,
        name: 'Trạm 1: Tháp Bút & Hồ Gươm',
        script: 'Dạ chào bạn, mời bạn dừng chân bên bờ Hồ Gươm xanh biếc. Trước mắt bạn lúc này, chính là ngọn Tháp Bút uy nghiêm, sừng sững giữa trời mây. Bạn biết không, trên đỉnh tháp có khắc ba chữ Tả Thanh Thiên, nghĩa là viết lên trời xanh. Nơi đây từng là chốn hội ngộ, đàm đạo văn chương của bao bậc hiền tài Thăng Long xưa. Mời bạn hãy bước lại gần hơn, cùng giải mã câu đố đầu tiên nhé.',
        question: 'Ba chữ khắc trên Tháp Bút mang ý nghĩa biểu tượng gì?',
        answers: ['Viết lên trời xanh', 'Hào khí Thăng Long', 'Bảo vệ giang sơn'],
        correct: 0
      },
      {
        id: 2,
        lat: 21.0310,
        lng: 105.8515,
        name: 'Trạm 2: Phố Hàng Bạc',
        script: 'Dạ chào bạn, chúng ta vừa bước vào con phố Hàng Bạc sầm uất. Nơi đây từ thuở xưa, đã vang danh khắp kinh thành với nghề đúc bạc cho triều đình phong kiến. Bạn hãy nhìn vào con ngõ nhỏ số 47, nơi có những vì kèo gỗ lim đen bóng. Một ký hiệu cổ của các phường thợ kim hoàn, vẫn còn được giấu kín trên xà nhà. Mời bạn cùng quan sát thật kỹ để tìm câu trả lời nhé.',
        question: 'Nghề truyền thống nổi tiếng nhất của phố Hàng Bạc là gì?',
        answers: ['Đúc rèn kim hoàn & bạc', 'Khảm xà cừ', 'Dệt lụa tơ tằm'],
        correct: 0
      },
      {
        id: 3,
        lat: 21.0355,
        lng: 105.8548,
        name: 'Trạm 3: Ô Quan Chưởng',
        script: 'Dạ chào bạn, trước mắt bạn là cửa Ô Quan Chưởng rêu phong cổ kính. Đây là cửa ô duy nhất của kinh thành Thăng Long xưa, còn đứng vững nguyên vẹn đến ngày nay. Bạn hãy đưa mắt ngắm nhìn vòm cổng gạch nung đỏ thẫm, lắng nghe tiếng xe cộ xôn xao hòa cùng nhịp sống phố phường. Hãy cùng tôi tìm con số khắc trên vòm cửa để mở khóa kho báu cuối cùng bạn nhé.',
        question: 'Ô Quan Chưởng là cửa ô còn giữ lại kiến trúc dạng gì?',
        answers: ['Cửa ô vọng lâu 2 tầng', 'Cổng tam quan đá', 'Tháp canh gỗ'],
        correct: 0
      }
    ]
  },
  {
    id: 2,
    name: 'Hương Vị Sài Gòn Xưa',
    city: 'TP. Hồ Chí Minh',
    theme: 'Ẩm thực',
    price: 220000,
    rating: 4.7,
    reviews: 89,
    difficulty: 'Dễ',
    walkTime: '3 giờ',
    distance: '4.1 km',
    imageId: '1583417319070-4a69db38a482',
    teaser: 'Từng con hẻm nhỏ dẫn bạn đến câu chuyện ẩm thực truyền qua ba thế hệ...',
    story: 'Sài Gòn không chỉ là thành phố — đó là một cuốn sách dạy nấu ăn khổng lồ, viết bằng khói bếp than và mùi nước dùng thơm lừng. Quest này đưa bạn vào các địa điểm ẩm thực bí mật, từ xe bánh mì 50 năm tuổi đến quán phở nổi tiếng.',
    guideName: 'Trần Thị Lan',
    guideRating: 4.8,
    guideImageId: '1494790108377-be9c29b29330',
    lat: 10.7769,
    lng: 106.7009,
    waypoints: [
      {
        id: 1,
        lat: 10.7725,
        lng: 106.6980,
        name: 'Trạm 1: Chợ Bến Thành',
        script: 'Dạ chào bạn, mời bạn hòa mình vào không khí nhộn nhịp của Chợ Bến Thành. Ngôi chợ hơn trăm năm tuổi này, là trái tim gắn liền với bao thế hệ người Sài Gòn. Ngay tại cổng phía Nam, tháp đồng hồ bốn mặt vẫn cần mẫn điểm từng nhịp thời gian. Bạn hãy hít một hơi thật sâu, cảm nhận mùi thơm ngào ngạt của các món chè và cà phê bốc khói từ khu ẩm thực bên trong nhé.',
        question: 'Biểu tượng nổi bật nhất ở cổng phía Nam chợ Bến Thành là gì?',
        answers: ['Tháp đồng hồ 3 mặt', 'Tháp đồng hồ 4 mặt', 'Cổng vòm hoa văn'],
        correct: 1
      },
      {
        id: 2,
        lat: 10.7770,
        lng: 106.6953,
        name: 'Trạm 2: Dinh Độc Lập & Cà Phê Bệt',
        script: 'Dạ chào bạn, mời bạn ngồi nghỉ dưới tán cây xanh mát của công viên 30 tháng 4. Nơi đây lưu giữ nét văn hóa cà phê bệt mộc mạc, rất đỗi thân thương của người Sài Gòn. Một ly cà phê sữa đá ngọt bùi, vài câu chuyện rôm rả bên bạn bè, sẽ xua tan đi mọi mệt mỏi đường xa. Hãy cùng tôi lắng nghe tiếng chim hót và giải mã câu đố tiếp theo nhé.',
        question: 'Tên gọi quen thuộc của phong cách uống cà phê tại công viên này là gì?',
        answers: ['Cà phê bệt', 'Cà phê vợt', 'Cà phê trứng'],
        correct: 0
      }
    ]
  },
  {
    id: 3,
    name: 'Đêm Hội An Huyền Ảo',
    city: 'Hội An',
    theme: 'Đêm',
    price: 150000,
    rating: 4.9,
    reviews: 203,
    difficulty: 'Dễ',
    walkTime: '2 giờ',
    distance: '2.8 km',
    imageId: '1528360983277-13d401cdc186',
    teaser: 'Khi những chiếc đèn lồng thắp sáng dòng sông Hoài, bạn bắt đầu bước vào giấc mơ...',
    story: 'Người Hội An tin rằng mỗi chiếc đèn lồng đang thả trôi trên sông mang theo một điều ước. Quest đêm này dẫn bạn qua các địa điểm lịch sử dưới ánh đèn lồng lung linh, khám phá tình yêu bí ẩn giữa một thương nhân và cô gái Hội An.',
    guideName: 'Lê Quang Hùng',
    guideRating: 5.0,
    guideImageId: '1500648767791-00dcc994a43e',
    lat: 15.8801,
    lng: 108.3380,
    waypoints: [
      {
        id: 1,
        lat: 15.8771,
        lng: 108.3259,
        name: 'Trạm 1: Chùa Cầu Hội An',
        script: 'Dạ chào bạn, mời bạn bước chậm lại trên cây cầu ngói trăm năm tuổi. Chiếc Chùa Cầu rêu phong này, vắt ngang dòng kênh nhỏ êm đềm chảy ra sông Hoài. Bạn biết không, các thương nhân Nhật Bản xưa đã dựng nên cây cầu, như một thanh bảo kiếm trấn giữ bình yên cho phố Hội. Dưới ánh đèn lồng lấp lánh đêm nay, chúng ta cùng lắng nghe tiếng gió thì thầm và tìm kiếm mảnh ghép bí ẩn nhé.',
        question: 'Chùa Cầu Hội An còn có tên gọi khác là gì?',
        answers: ['Cầu Nhật Bản', 'Cầu An Hội', 'Cầu Khảm'],
        correct: 0
      }
    ]
  },
  {
    id: 4,
    name: 'Ký Ức Huế Cố Đô',
    city: 'Huế',
    theme: 'Lịch sử',
    price: 200000,
    rating: 4.6,
    reviews: 67,
    difficulty: 'Khó',
    walkTime: '3.5 giờ',
    distance: '5.0 km',
    imageId: '1508009603885-50cf7c579365',
    teaser: 'Bước qua cổng thành là bước vào triều Nguyễn với những bí mật hoàng gia còn đó...',
    story: 'Trong Tử Cấm Thành còn lưu giữ nhiều bí mật triều đình. Quest này cung cấp cho bạn những manh mối dựa trên tài liệu lịch sử thật, dẫn qua các trạm từ Ngọ Môn đến Điện Thái Hòa.',
    guideName: 'Phạm Thị Hường',
    guideRating: 4.7,
    guideImageId: '1438761681033-6461ffad8d80',
    lat: 16.4637,
    lng: 107.5909,
    waypoints: [
      {
        id: 1,
        lat: 16.4682,
        lng: 107.5776,
        name: 'Trạm 1: Cổng Ngọ Môn',
        script: 'Dạ chào bạn, hãy cùng tôi lắng nghe tiếng chuông chiều buông xuống dòng sông Hương. Trước mắt bạn lúc này, là Cửa Ngọ Môn sừng sững, nhuốm màu rêu phong qua bao thăng trầm lịch sử. Từng phiến đá lát dưới chân bạn, đã từng in dấu hài của các bậc vua chúa triều Nguyễn. Bạn hãy bước qua chiếc cầu đá này, chúng ta cùng giải mã bí ẩn đầu tiên trong hoàng cung nhé.',
        question: 'Cổng Ngọ Môn gồm có bao nhiêu lối đi chính?',
        answers: ['5 lối đi', '3 lối đi', '7 lối đi'],
        correct: 0
      }
    ]
  }
];

export const PENDING_GUIDES = [
  { id: 1, name: 'Hoàng Đức Thành', city: 'Hà Nội', submitted: '06/08/2026', phone: '0912 345 678', isNew: false },
  { id: 2, name: 'Vũ Thị Mai Anh', city: 'Đà Nẵng', submitted: '05/08/2026', phone: '0987 654 321', isNew: false },
  { id: 3, name: 'Đinh Công Sơn', city: 'TP. Hồ Chí Minh', submitted: '04/08/2026', phone: '0901 234 567', isNew: false },
];

export const PENDING_QUESTS = [
  { id: 1, name: 'Bóng Ma Chợ Đông Ba', guide: 'Phạm Thị Hường', city: 'Huế', waypoints: 7, submitted: '06/08/2026' },
  { id: 2, name: 'Ngõ Hẻm Sài Gòn 1975', guide: 'Trần Thị Lan', city: 'TP. Hồ Chí Minh', waypoints: 9, submitted: '07/08/2026' },
];

export const PENDING_WITHDRAWALS = [
  { id: 1, guide: 'Lê Quang Hùng', amount: 2450000, bank: 'Vietcombank', account: '****5678', requested: '07/08/2026' },
  { id: 2, guide: 'Nguyễn Văn Minh', amount: 1800000, bank: 'Techcombank', account: '****9012', requested: '06/08/2026' },
];

export function formatPrice(p: number) {
  return p.toLocaleString('vi-VN') + '₫';
}

export function img(id: string, w: number, h: number) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}
