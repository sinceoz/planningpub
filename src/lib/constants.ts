// 회사 정보
export const COMPANY = {
  name: '주식회사 플래닝펍',
  nameEn: 'PlanningPub Inc.',
  slogan: 'MICE Platformer',
  address: '서울특별시 성동구 성수이로 51, 한라시그마밸리 609호',
  addressEn: '609, Hanla Sigma Valley, 51, Seongsui-ro, Seongdong-gu, Seoul, Korea',
  phone: '02-6953-7969',
  fax: '02-6953-7970',
  email: 'info@planningpub.com',
  website: 'https://planningpub.com',
  planninghub: 'https://planninghub.co.kr',
  ceo: '최성준',
  ceoEn: 'Choi Sungjun',
  bizNo: '229-87-01234',
} as const;

// SNS 링크
export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/planningpub',
  youtube: 'https://www.youtube.com/@planningpub',
  blog: 'https://blog.naver.com/planningpub',
  linkedin: 'https://www.linkedin.com/company/planningpub',
} as const;

// 서비스 카테고리 (10개)
export const SERVICES = [
  { icon: 'Calendar', labelKo: '국제회의 (Meeting)', labelEn: 'International Meetings' },
  { icon: 'Award', labelKo: '포상관광 (Incentive)', labelEn: 'Incentive Travel' },
  { icon: 'Users', labelKo: '컨벤션 (Convention)', labelEn: 'Conventions' },
  { icon: 'Globe', labelKo: '전시회 (Exhibition)', labelEn: 'Exhibitions' },
  { icon: 'Mic', labelKo: '기업행사', labelEn: 'Corporate Events' },
  { icon: 'Palette', labelKo: '디자인', labelEn: 'Design' },
  { icon: 'Monitor', labelKo: '온라인 행사', labelEn: 'Online Events' },
  { icon: 'BarChart3', labelKo: '데이터 분석', labelEn: 'Data Analytics' },
  { icon: 'Megaphone', labelKo: '마케팅/PR', labelEn: 'Marketing / PR' },
  { icon: 'Lightbulb', labelKo: '컨설팅', labelEn: 'Consulting' },
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

// 크루 멤버 (플레이스홀더)
export const CREW_MEMBERS = [
  { name: '최성준', nameEn: 'Sungjun Choi', role: '대표이사 / CEO', roleEn: 'CEO' },
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
