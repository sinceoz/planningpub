// 회사 정보
export const COMPANY = {
  name: '(주)플래닝펍',
  nameEn: 'PlanningPub',
  slogan: 'MICE Platformer',
  address: '서울시 서초구 서초대로 131 로고스빌딩 6층',
  addressEn: '6F, Logos Building, 131 Seocho-daero, Seocho-gu, Seoul, Korea',
  phone: '02-2066-8528',
  fax: '02-6455-4554',
  email: 'info@planningpub.com',
  website: 'https://planningpub.com',
  planninghub: 'https://planninghub.co.kr',
  ceo: '박재홍',
  ceoEn: 'Park Jaehong',
  bizNo: '587-86-01626',
  hours: '월-금 9:00 AM ~ 6:00 PM',
  hoursEn: 'Mon-Fri 9:00 AM ~ 6:00 PM',
} as const;

// SNS 링크
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/planningpub',
  youtube: 'https://www.youtube.com/@planningpub',
  blog: 'https://blog.naver.com/planningpub',
  linkedin: 'https://www.linkedin.com/company/planningpub',
} as const;

// 서비스 카테고리 (9개)
export const SERVICES = [
  { icon: 'Mic', labelKo: 'Corporation Meeting', labelEn: 'Corporation Meeting', descKo: '네트워킹 행사, 기업 세미나', descEn: 'Networking events, corporate seminars' },
  { icon: 'Globe', labelKo: 'Exhibition', labelEn: 'Exhibition', descKo: '정부 및 기업 주최 제품 전시', descEn: 'Government & corporate product exhibitions' },
  { icon: 'Glasses', labelKo: 'Metaverse Event', labelEn: 'Metaverse Event', descKo: '제페토, 이프랜드, 게더타운 행사', descEn: 'Zepeto, ifland, Gather Town events' },
  { icon: 'Users', labelKo: 'Convention', labelEn: 'Convention', descKo: '강연 및 전시 복합 행사 및 박람회', descEn: 'Combined lectures, exhibitions & expos' },
  { icon: 'Music', labelKo: 'Festival', labelEn: 'Festival', descKo: '콘서트 및 전시 복합 페스티벌', descEn: 'Concert & exhibition festivals' },
  { icon: 'Palette', labelKo: 'Video / Design', labelEn: 'Video / Design', descKo: '영상 및 2D 디자인, 아이데이션', descEn: 'Video & 2D design, ideation' },
  { icon: 'BookOpen', labelKo: 'Conference / Forum', labelEn: 'Conference / Forum', descKo: '정부 및 학·협회 주최 학술행사', descEn: 'Government & academic conferences' },
  { icon: 'Monitor', labelKo: 'Online Event', labelEn: 'Online Event', descKo: '웨비나, 라이브 스트리밍 행사', descEn: 'Webinars, live streaming events' },
  { icon: 'Rocket', labelKo: 'Event Platform', labelEn: 'Event Platform', descKo: 'Coming soon...!', descEn: 'Coming soon...!' },
] as const;

// PlanningHUB 기능 (8개)
export const PH_FEATURES = [
  { name: 'OneShotPlan', descKo: 'AI 기반 원스톱 행사 기획', descEn: 'AI-powered one-stop event planning', icon: 'Wand2', color: 'mint' },
  { name: '입찰정보', descKo: '실시간 MICE 입찰 정보 모니터링', descEn: 'Real-time MICE bidding information', icon: 'Search', color: 'purple' },
  { name: 'Venue', descKo: '전국 행사장 검색 및 비교', descEn: 'Nationwide venue search & comparison', icon: 'MapPin', color: 'mint' },
  { name: 'Vendor', descKo: '검증된 협력업체 네트워크', descEn: 'Verified vendor network', icon: 'Handshake', color: 'purple' },
  { name: 'COCONUT', descKo: '참가자 커뮤니케이션 허브', descEn: 'Attendee communication hub', icon: 'MessageCircle', color: 'mint' },
  { name: 'AttenDB', descKo: '참가자 데이터베이스 관리', descEn: 'Attendee database management', icon: 'Database', color: 'purple' },
  { name: 'EstiMATE', descKo: 'AI 견적 자동 산출', descEn: 'AI-powered cost estimation', icon: 'Calculator', color: 'mint' },
  { name: 'PLAN B', descKo: '위기관리 시나리오 플래너', descEn: 'Crisis management scenario planner', icon: 'ShieldCheck', color: 'purple' },
] as const;

// 크루 멤버
export const CREW_MEMBERS = [
  { name: '박재홍', nameEn: 'Jaehong Park', role: '대표이사 / CEO', roleEn: 'CEO' },
  { name: '팀원 A', nameEn: 'Member A', role: '기획팀장', roleEn: 'Planning Director' },
  { name: '팀원 B', nameEn: 'Member B', role: '디자인팀장', roleEn: 'Design Director' },
  { name: '팀원 C', nameEn: 'Member C', role: '개발팀장', roleEn: 'Development Director' },
] as const;

// 예산 범위 옵션
export const BUDGET_OPTIONS = [
  { value: 'under-10m', labelKo: '1,000만원 미만', labelEn: 'Under ₩10M' },
  { value: '10m-50m', labelKo: '1,000만원 ~ 5,000만원', labelEn: '₩10M ~ ₩50M' },
  { value: '50m-100m', labelKo: '5,000만원 ~ 1억원', labelEn: '₩50M ~ ₩100M' },
  { value: '100m-500m', labelKo: '1억원 ~ 5억원', labelEn: '₩100M ~ ₩500M' },
  { value: 'over-500m', labelKo: '5억원 이상', labelEn: 'Over ₩500M' },
  { value: 'undecided', labelKo: '미정', labelEn: 'Undecided' },
] as const;
