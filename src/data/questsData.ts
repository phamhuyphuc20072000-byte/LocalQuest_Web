import { LegacyQuest } from '../types';

export const INITIAL_QUESTS: LegacyQuest[] = [
  {
    id: 'quest-hn-01',
    title: 'Hà Nội 36 Phố Phường & Bí Mật Cà Phê Trứng',
    destination: 'Hà Nội',
    region: 'Miền Bắc',
    category: 'Ẩm thực',
    summary: 'Len lỏi qua từng con ngõ cổ kính, khám phá hương vị cà phê trứng 70 năm tuổi và tìm hiểu văn hoá trà đá vỉa hè cùng người bản địa.',
    detailedStory: 'Hành trình đưa bạn vượt qua các điểm du lịch thông thường để bước vào đời sống chân thực của người Tràng An. Bạn sẽ được người bản địa dẫn lối vào một quán cà phê nằm sâu trong con ngõ số 39 Nguyễn Hữu Huân, tự tay đánh bông lớp kem trứng béo ngậy theo bí kíp gia truyền.',
    heroImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80'
    ],
    durationHours: 3.5,
    distanceKm: 3.2,
    difficulty: 'Dễ dàng',
    rating: 4.9,
    reviewCount: 148,
    priceVnd: 280000,
    hostName: 'Nguyễn Thành Nam',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hostBadge: 'Người Kể Chuyện Phố Cổ (SuperHost)',
    rewardPoints: 200,
    badgeRewardId: 'pho_master',
    featured: true,
    tags: ['Ẩm thực gia truyền', 'Đi bộ ngõ nhỏ', 'Cà phê trứng', 'Check-in phố cổ'],
    checkpoints: [
      {
        id: 'cp-hn-1',
        title: 'Trạm 1: Ngõ Cà Phê Trứng Giảng 1946',
        description: 'Thưởng thức ly cà phê trứng nguyên bản trong không gian hoài cổ giữa lòng phố Nguyễn Hữu Huân.',
        locationName: '39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội',
        coordinates: { lat: 21.0335, lng: 105.8542 },
        taskDescription: 'Tìm người pha chế kỳ cựu và hỏi về bí quyết ủ bột cà phê Robusta truyền thống.',
        localTip: 'Nên uống khi còn nóng và khuấy nhẹ lớp kem vàng bồng bềnh phía trên.',
        estimatedMinutes: 45,
        order: 1,
        photoSpotPrompt: 'Chụp góc nghiêng ly cà phê trứng bên khung cửa sổ gỗ rêu phong.'
      },
      {
        id: 'cp-hn-2',
        title: 'Trạm 2: Phố Hàng Bạc & Tiệm Kim Hoàn 100 Tuổi',
        description: 'Khám phá nghề chạm bạc truyền thống từ thời phong kiến còn sót lại giữa phố thị sầm uất.',
        locationName: 'Hàng Bạc, Hoàn Kiếm, Hà Nội',
        coordinates: { lat: 21.0347, lng: 105.8521 },
        taskDescription: 'Ghi lại âm thanh đục chạm bạc nhịp nhàng của nghệ nhân lớn tuổi.',
        localTip: 'Hãy xin phép trước khi chụp cận cảnh quá trình chạm khắc tỉ mỉ.',
        estimatedMinutes: 40,
        order: 2,
        photoSpotPrompt: 'Bàn tay nghệ nhân tỉ mỉ khắc từng đường nét trên vòng bạc.'
      },
      {
        id: 'cp-hn-3',
        title: 'Trạm 3: Ô Quan Chưởng & Bánh Rán Mật Lúc Xế Chiều',
        description: 'Cửa ô duy nhất còn nguyên vẹn của kinh thành Thăng Long xưa và món quà vặt đường phố nổi tiếng.',
        locationName: 'Ô Quan Chưởng, Hàng Chiếu, Hà Nội',
        coordinates: { lat: 21.0371, lng: 105.8539 },
        taskDescription: 'Thử thách đếm số cổng vòm và thưởng thức chiếc bánh rán mật giòn rụm.',
        localTip: 'Quán bánh rán ngon nhất nằm chếch bên tay trái cổng vòm gạch cổ.',
        estimatedMinutes: 35,
        order: 3,
        photoSpotPrompt: 'Góc chụp toàn cảnh cổng thành gạch rêu phong dưới ánh nắng chiều.'
      }
    ]
  },
  {
    id: 'quest-da-nang-01',
    title: 'Hội An Về Đêm: Đạp Xe Phố Cổ & Thả Đèn Hoa Đăng Sông Hoài',
    destination: 'Hội An / Đà Nẵng',
    region: 'Miền Trung',
    category: 'Di sản & Văn hoá',
    summary: 'Đắm mình trong ánh đèn lồng rực rỡ, đi thuyền gỗ mộc trên sông Hoài và học làm đèn lồng thủ công cùng nghệ nhân phố cổ.',
    detailedStory: 'Hội An khi hoàng hôn buông xuống biến thành một bức tranh huyền ảo lung linh. Bạn sẽ đạp xe qua những ngõ hẻm quét vôi vàng đặc trưng, tự tay gấp giấy làm chiếc đèn hoa đăng ước nguyện và lắng nghe điệu hát Bài Chòi truyền thống bên bờ sông.',
    heroImage: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=80'
    ],
    durationHours: 4.0,
    distanceKm: 4.5,
    difficulty: 'Dễ dàng',
    rating: 4.95,
    reviewCount: 230,
    priceVnd: 350000,
    hostName: 'Trần Mỹ Linh',
    hostAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    hostBadge: 'Nghệ Nhân Lồng Đèn Hội An',
    rewardPoints: 250,
    badgeRewardId: 'lantern_wanderer',
    featured: true,
    tags: ['Đèn hoa đăng', 'Sông Hoài', 'Phố cổ Hội An', 'Bài Chòi', 'Hoàng hôn'],
    checkpoints: [
      {
        id: 'cp-ha-1',
        title: 'Trạm 1: Xưởng Lồng Đèn Phố Nguyễn Thái Học',
        description: 'Tự tay dán lụa Hà Đông lên khung tre uốn lượn để hoàn thành chiếc đèn lồng của riêng bạn.',
        locationName: 'Nguyễn Thái Học, Phường Minh An, Hội An',
        coordinates: { lat: 15.8775, lng: 108.3283 },
        taskDescription: 'Chọn màu lụa phong thuỷ và hoàn thành khung lồng đèn hình quả trám.',
        localTip: 'Dùng keo miết nhẹ từ trên xuống dưới để lụa căng bóng không bị nhăn.',
        estimatedMinutes: 60,
        order: 1,
        photoSpotPrompt: 'Tạo dáng cùng tác phẩm lồng đèn rực rỡ sắc màu do bạn tự tay làm.'
      },
      {
        id: 'cp-ha-2',
        title: 'Trạm 2: Chùa Cầu & Bức Tường Vàng Rực Rỡ',
        description: 'Chiêm ngưỡng kiến trúc giao thoa Nhật - Việt và chụp ảnh bên những bức tường vàng nhuốm màu thời gian.',
        locationName: 'Chùa Cầu, Trần Phú, Hội An',
        coordinates: { lat: 15.8771, lng: 108.3259 },
        taskDescription: 'Tìm chi tiết đôi tượng linh vật Chó và Khỉ trấn giữ hai đầu cầu cổ.',
        localTip: 'Thời điểm chụp ảnh tường vàng vắng khách nhất là từ 16h00 đến 17h00.',
        estimatedMinutes: 40,
        order: 2,
        photoSpotPrompt: 'Bức tường vàng cổ điển với giàn hoa giấy rực sắc hồng.'
      },
      {
        id: 'cp-ha-3',
        title: 'Trạm 3: Đi Thuyền Gỗ & Thả Hoa Đăng Sông Hoài',
        description: 'Lênh đênh trên dòng nước lấp lánh và thả chiếc đèn hoa đăng gửi gắm ước nguyện bình an.',
        locationName: 'Bến thuyền sông Hoài, Đường Bạch Đằng, Hội An',
        coordinates: { lat: 15.8763, lng: 108.3275 },
        taskDescription: 'Thắp nến và thả nhẹ đèn hoa đăng xuống mặt nước lúc chạng vạng.',
        localTip: 'Hãy đi thuyền của các cô chú chèo đò truyền thống để nghe kể chuyện sông nước.',
        estimatedMinutes: 45,
        order: 3,
        photoSpotPrompt: 'Ánh nến hoa đăng lung linh soi bóng trên dòng sông Hoài về đêm.'
      }
    ]
  },
  {
    id: 'quest-hcm-01',
    title: 'Sài Gòn Xưa & Nay: Cà Phê Vợt Ba Lù & Chợ Lớn Kỳ Bí',
    destination: 'TP. Hồ Chí Minh',
    region: 'Miền Nam',
    category: 'Đời sống Bản địa',
    summary: 'Khám phá nét đẹp hoài niệm của Chợ Lớn, uống cà phê vợt than củi 70 năm và tìm hiểu kiến trúc Hội quán người Hoa.',
    detailedStory: 'Sài Gòn không chỉ có những toà nhà chọc trời mà còn cất giấu cả một kho tàng văn hoá sống động tại Quận 5. Bạn sẽ cùng thổ địa rẽ vào khu chợ Phùng Hưng, ngồi ghế đẩu thưởng thức ly bạc xỉu vợt thơm lừng và ngắm nhìn nhịp sống tấp nập buổi sớm mai.',
    heroImage: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80'
    ],
    durationHours: 3.5,
    distanceKm: 5.0,
    difficulty: 'Trung bình',
    rating: 4.88,
    reviewCount: 175,
    priceVnd: 290000,
    hostName: 'Vương Vĩnh Phát',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hostBadge: 'Thổ Địa Chợ Lớn (Local Expert)',
    rewardPoints: 220,
    badgeRewardId: 'cholon_explorer',
    featured: true,
    tags: ['Cà phê vợt', 'Chợ Lớn', 'Hội Quán Nghĩa An', 'Bạc xỉu', 'Kiến trúc cổ'],
    checkpoints: [
      {
        id: 'cp-sg-1',
        title: 'Trạm 1: Quán Cà Phê Vợt Ba Lù - Chợ Phùng Hưng',
        description: 'Chứng kiến cách rang và pha cà phê bằng bếp than củi, bơ Pháp và chiếc vợt vải cổ truyền.',
        locationName: 'Chợ Phùng Hưng, Phường 14, Quận 5, TP.HCM',
        coordinates: { lat: 10.7554, lng: 106.6578 },
        taskDescription: 'Gọi một ly Bạc Xỉu nóng hoặc Cà phê sữa đá vợt và trò chuyện cùng chủ quán.',
        localTip: 'Quán mở từ 3h sáng đến trưa, đi tầm 7h-8h sáng là thời điểm sôi động nhất.',
        estimatedMinutes: 50,
        order: 1,
        photoSpotPrompt: 'Khói bốc lên từ chiếc ấm nhôm sôi sùng sục trên bếp than hồng.'
      },
      {
        id: 'cp-sg-2',
        title: 'Trạm 2: Hội Quán Nghĩa An (Chùa Ông) & Vòng Nhang Trầm',
        description: 'Chiêm ngưỡng những bức phù điêu chạm khắc gỗ tinh xảo bậc nhất Sài Gòn và những vòng nhang treo cao.',
        locationName: '678 Nguyễn Trãi, Phường 11, Quận 5, TP.HCM',
        coordinates: { lat: 10.7541, lng: 106.6612 },
        taskDescription: 'Tìm bức tượng Xích Thố bằng đồng uy nghiêm và viết thẻ cầu an treo lên vòng nhang.',
        localTip: 'Trang phục lịch sự kín đáo khi vào bên trong điện thờ.',
        estimatedMinutes: 45,
        order: 2,
        photoSpotPrompt: 'Các vòng nhang xoắn ốc lơ lửng trong làn khói mờ ảo dưới giếng trời.'
      }
    ]
  },
  {
    id: 'quest-dalat-01',
    title: 'Đà Lạt Mộng Mơ: Săn Mây Cầu Đất & Workshop Hái Dâu Rừng',
    destination: 'Đà Lạt',
    region: 'Miền Trung',
    category: 'Thiên nhiên & Sinh thái',
    summary: 'Đón bình minh trên biển mây bồng bềnh tại đồi chè Cầu Đất, nhâm nhi cà phê Arabica thượng hạng và hái dâu tây hữu cơ.',
    detailedStory: 'Trải nghiệm không khí se lạnh 15°C lúc 5h sáng tại cao nguyên Lâm Viên. Bạn sẽ được chiêm ngưỡng khoảnh khắc mặt trời đỏ rực nhô lên xé toang màn sương mù, trải dài trên những đồi chè xanh mướt ngút ngàn.',
    heroImage: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=800&auto=format&fit=crop&q=80'
    ],
    durationHours: 5.0,
    distanceKm: 22.0,
    difficulty: 'Thử thách',
    rating: 4.92,
    reviewCount: 310,
    priceVnd: 420000,
    hostName: 'Lê Hoàng Yến',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hostBadge: 'Nhiếp Ảnh Gia Bản Địa Đà Lạt',
    rewardPoints: 300,
    badgeRewardId: 'cloud_hunter',
    featured: false,
    tags: ['Săn mây', 'Cầu Đất', 'Cà phê Arabica', 'Dâu tây', 'Bình minh cao nguyên'],
    checkpoints: [
      {
        id: 'cp-dl-1',
        title: 'Trạm 1: Thảm Gỗ Săn Mây Cầu Đất Panorama',
        description: 'Đón những tia nắng đầu ngày chiếu rọi xuyên qua thung lũng mây cuồn cuộn.',
        locationName: 'Đồi chè Cầu Đất, Xuân Trường, Đà Lạt',
        coordinates: { lat: 11.9056, lng: 108.5521 },
        taskDescription: 'Có mặt trước 5:45 sáng để bắt trọn khoảnh khắc "Golden Hour" đẹp nhất.',
        localTip: 'Mang theo áo khoác ấm giữ nhiệt vì gió sáng sớm rất buốt.',
        estimatedMinutes: 75,
        order: 1,
        photoSpotPrompt: 'Bức ảnh silhouette ngược sáng trên cầu gỗ giữa biển mây trắng xoá.'
      }
    ]
  },
  {
    id: 'quest-ninhbinh-01',
    title: 'Ninh Bình Non Nước: Chèo Thuyền Tràng An & Leo Đỉnh Hang Múa',
    destination: 'Ninh Bình',
    region: 'Miền Bắc',
    category: 'Thiên nhiên & Sinh thái',
    summary: 'Len lỏi qua hang động thạch nhũ kỳ vĩ trên thuyền nan truyền thống và chinh phục 486 bậc thang đá ngắm trọn Tam Cốc.',
    detailedStory: 'Được mệnh danh là "Hạ Long trên cạn", Ninh Bình sở hữu cảnh quan núi đá vôi hùng vĩ ôm trọn những dòng sông trong vắt như ngọc bích. Quest này sẽ đưa bạn khám phá những góc quay điện ảnh Hollywood và thưởng thức đặc sản cơm cháy dê núi trứ danh.',
    heroImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop&q=80'
    ],
    durationHours: 6.0,
    distanceKm: 12.0,
    difficulty: 'Thử thách',
    rating: 4.96,
    reviewCount: 420,
    priceVnd: 490000,
    hostName: 'Đinh Quốc Tuấn',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    hostBadge: 'Người Dẫn Đường Di Sản Tràng An',
    rewardPoints: 350,
    badgeRewardId: 'heritage_trekker',
    featured: true,
    tags: ['Tràng An', 'Hang Múa', 'Chèo thuyền', 'Di sản UNESCO', 'Núi đá vôi'],
    checkpoints: [
      {
        id: 'cp-nb-1',
        title: 'Trạm 1: Bến Thuyền Tràng An Tuyến 3',
        description: 'Đi thuyền qua Hang Mây dài hơn 1000m với hệ thống thạch nhũ hàng triệu năm tuổi.',
        locationName: 'Khu du lịch sinh thái Tràng An, Hoa Lư, Ninh Bình',
        coordinates: { lat: 20.2589, lng: 105.9125 },
        taskDescription: 'Cùng người chèo đò đếm các khối thạch nhũ hình rồng bay phượng múa.',
        localTip: 'Chuẩn bị nón lá hoặc ô nhỏ để che nắng và nước nhỏ từ trần hang.',
        estimatedMinutes: 120,
        order: 1,
        photoSpotPrompt: 'Thuyền nan trôi nhẹ giữa hai vách đá dựng đứng in bóng xuống mặt nước xanh ngọc.'
      }
    ]
  }
];

export const DESTINATIONS_LIST = [
  'Tất cả địa điểm',
  'Hà Nội',
  'Hội An / Đà Nẵng',
  'TP. Hồ Chí Minh',
  'Đà Lạt',
  'Ninh Bình',
  'Huế',
  'Phú Quốc'
];

export const CATEGORIES_LIST = [
  'Tất cả danh mục',
  'Ẩm thực',
  'Di sản & Văn hoá',
  'Thiên nhiên & Sinh thái',
  'Đời sống Bản địa'
];
