export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // Header & navigation
    chooseOtherRace: 'Chọn giải khác',
    backToRaces: 'Quay lại danh sách giải đấu',
    refreshData: 'Làm mới dữ liệu',
    raceHeaderSubtitle: 'Bảng xếp hạng Top 50 & Tra cứu thành tích',
    
    // Athlete Lookup
    lookupTitle: 'TRA CỨU THÀNH TÍCH VẬN ĐỘNG VIÊN',
    lookupSubtitle: 'Nhập số BIB hoặc Họ tên vận động viên để xem chi tiết kết quả thi đấu',
    searchPlaceholder: 'Nhập số BIB hoặc Họ tên VĐV...',
    searchingRemote: 'Đang tra cứu dữ liệu giải đấu...',
    searchResults: 'Kết quả tìm kiếm',
    keyboardHint: 'Dùng phím ↑ ↓ Enter',
    clearSearch: 'Xóa tìm kiếm',
    noResults: 'Không tìm thấy vận động viên phù hợp.',
    searchSuggestionHint: 'Nhập số BIB (ví dụ: 90001, 80002) hoặc Họ tên để tra cứu',
    
    // Top 50 Ranking
    rankingTitle: 'BẢNG XẾP HẠNG TOP 50',
    rankingSubtitle: 'Cập nhật thành tích thi đấu theo Chip Time',
    allAgeGroups: 'Tất cả lứa tuổi',
    ageGroupLabel: 'Lứa tuổi:',
    filterQuickSearch: 'Lọc nhanh trong bảng Top 50...',
    distanceLabel: 'Cự ly',
    
    // Genders
    male: 'NAM',
    female: 'NỮ',
    athletesCount: 'VĐV',
    chipTime: 'Chip time',
    gunTime: 'Gun time',
    pace: 'Pace',
    avgPace: 'Pace TB',
    officialTimeNotice: 'Thời gian tính giải',
    startTimeNotice: 'Thời gian xuất phát',
    
    // Podium & rows
    rank1: 'QUÁN QUÂN',
    rank2: 'Á QUÂN 1',
    rank3: 'Á QUÂN 2',
    rankNum: 'HẠNG',
    podiumHint: 'Nhấn vào vận động viên trên bục để tra cứu chi tiết & chứng nhận',
    rowTooltip: 'Xem chi tiết & chứng nhận',
    loadingRunners: 'Đang tải danh sách...',
    noRunnersFound: 'Không tìm thấy vận động viên phù hợp.',
    
    // Modal & Athlete details
    resultsInfo: 'Thông tin thành tích',
    closeEsc: 'Đóng (ESC)',
    finisherBadge: 'Finisher',
    overallRank: 'Hạng chung',
    overallLabel: 'Toàn đoàn',
    genderRank: 'Hạng giới tính',
    genderRankMale: 'Hạng nam',
    genderRankFemale: 'Hạng nữ',
    genderLabelMale: 'Nam giới',
    genderLabelFemale: 'Nữ giới',
    ageGroupRank: 'Lứa tuổi',
    ageGroupDesc: 'Nhóm tuổi',
    season: 'Mùa giải',
    season2026: 'Mùa giải 2026',
    
    // Language Switcher & Embedded
    langVietnamese: 'Tiếng Việt',
    langEnglish: 'English',
    language: 'Ngôn ngữ',
    switchLangTooltip: 'Chuyển đổi ngôn ngữ hiển thị',
    embeddedNotice: 'Trang kết quả chính thức',
  },
  en: {
    // Header & navigation
    chooseOtherRace: 'Select Race',
    backToRaces: 'Back to race list',
    refreshData: 'Refresh data',
    raceHeaderSubtitle: 'Top 50 Leaderboard & Result Lookup',
    
    // Athlete Lookup
    lookupTitle: 'ATHLETE RESULTS LOOKUP',
    lookupSubtitle: 'Enter BIB number or Athlete Name to view race results & certificate',
    searchPlaceholder: 'Enter BIB number or Athlete Name...',
    searchingRemote: 'Searching race database...',
    searchResults: 'Search Results',
    keyboardHint: 'Use ↑ ↓ Enter keys',
    clearSearch: 'Clear search',
    noResults: 'No athlete found matching your query.',
    searchSuggestionHint: 'Enter BIB (e.g. 90001, 80002) or Name to search',
    
    // Top 50 Ranking
    rankingTitle: 'TOP 50 LEADERBOARD',
    rankingSubtitle: 'Official race results updated by Chip Time',
    allAgeGroups: 'All Age Groups',
    ageGroupLabel: 'Age Group:',
    filterQuickSearch: 'Quick filter in Top 50 table...',
    distanceLabel: 'Distance',
    
    // Genders
    male: 'MEN',
    female: 'WOMEN',
    athletesCount: 'Athletes',
    chipTime: 'Chip time',
    gunTime: 'Gun time',
    pace: 'Pace',
    avgPace: 'Avg Pace',
    officialTimeNotice: 'Official Net Time',
    startTimeNotice: 'Gun / Start Time',
    
    // Podium & rows
    rank1: '1ST PLACE',
    rank2: '2ND PLACE',
    rank3: '3RD PLACE',
    rankNum: 'RANK',
    podiumHint: 'Click any runner on the podium to view certificate & splits',
    rowTooltip: 'Click to view certificate & details',
    loadingRunners: 'Loading athlete list...',
    noRunnersFound: 'No athlete found in this category.',
    
    // Modal & Athlete details
    resultsInfo: 'Race Results',
    closeEsc: 'Close (ESC)',
    finisherBadge: 'Finisher',
    overallRank: 'Overall Rank',
    overallLabel: 'All runners',
    genderRank: 'Gender Rank',
    genderRankMale: 'Men Rank',
    genderRankFemale: 'Women Rank',
    genderLabelMale: 'Men',
    genderLabelFemale: 'Women',
    ageGroupRank: 'Age Group',
    ageGroupDesc: 'Category',
    season: 'Season',
    season2026: 'Season 2026',
    
    // Language Switcher & Embedded
    langVietnamese: 'Tiếng Việt',
    langEnglish: 'English',
    language: 'Language',
    switchLangTooltip: 'Change display language',
    embeddedNotice: 'Official Results Page',
  }
} as const;

export type TranslationKeys = keyof typeof translations.vi;
