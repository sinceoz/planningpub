// 포트폴리오 아이템
export interface PortfolioItem {
  id: string;
  category: 'event' | 'design';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  imageUrl: string;
  year: number;
  order: number;
  featured?: boolean;
}

// 크루 멤버
export interface CrewMember {
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  image?: string;
}

// 문의 폼 데이터
export interface ContactFormData {
  name: string;
  organization: string;
  email: string;
  projectName: string;
  date: string;
  details: string;
  budget: string;
}

// 서비스 카테고리
export interface ServiceItem {
  icon: string;
  labelKo: string;
  labelEn: string;
}

// PlanningHUB 기능
export interface PHFeature {
  name: string;
  descKo: string;
  descEn: string;
  icon: string;
  color: string;
}
