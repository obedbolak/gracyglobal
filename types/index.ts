// types/index.ts

export type NavItem = {
  label: string;
  href: string;
};

export type StatItem = {
  value: string;
  label: string;
  icon: string;
};

export type HeroCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  gradient: string;
  badge?: string;
};

export type Counselor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  image: string;
  available: boolean;
};

export type Job = {
  id: string;
  company: string;
  companyLogo: string;
  title: string;
  salaryRange: string;
  applicants: number;
  type: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
};
