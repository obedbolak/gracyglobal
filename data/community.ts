// data/community.ts

// ─── 7 Systems ───────────────────────────────────────────────────────────────

export const SYSTEMS = [
  {
    id: "human-flourishing",
    label: "Human Flourishing",
    icon: "💛",
    description: "Family, mental health, emotional wellbeing & conflict resolution.",
    color: "var(--scarlet)",
    gradient: "linear-gradient(135deg, #dc143c, #7b2fbe)",
    glow: "rgba(220,20,60,0.3)",
  },
  {
    id: "knowledge-skills",
    label: "Knowledge & Skills",
    icon: "📚",
    description: "Digital skills, AI literacy, entrepreneurship & lifelong learning.",
    color: "var(--blue)",
    gradient: "linear-gradient(135deg, #1a3adb, #7b2fbe)",
    glow: "rgba(26,58,219,0.3)",
  },
  {
    id: "economic-empowerment",
    label: "Economic Empowerment",
    icon: "🌱",
    description: "Women cooperatives, youth startups, agriculture & community economies.",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #1a3adb)",
    glow: "rgba(16,185,129,0.3)",
  },
  {
    id: "civic-leadership",
    label: "Civic Leadership",
    icon: "🏛️",
    description: "Ethical leadership, governance training & policy research.",
    color: "var(--purple)",
    gradient: "linear-gradient(135deg, #7b2fbe, #1a3adb)",
    glow: "rgba(123,47,190,0.3)",
  },
  {
    id: "media-narrative",
    label: "Media & Narrative",
    icon: "🎙️",
    description: "Podcasts, youth media, storytelling & shaping positive culture.",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #dc143c)",
    glow: "rgba(245,158,11,0.3)",
  },
  {
    id: "creativity-culture",
    label: "Creativity & Culture",
    icon: "🎨",
    description: "Music, digital art, storytelling & African cultural innovation.",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899, #7b2fbe)",
    glow: "rgba(236,72,153,0.3)",
  },
  {
    id: "technology-intelligence",
    label: "Technology & Intelligence",
    icon: "🤖",
    description: "AI training, digital entrepreneurship & community tech labs.",
    color: "var(--blue)",
    gradient: "linear-gradient(135deg, #1a3adb, #10b981)",
    glow: "rgba(26,58,219,0.3)",
  },
] as const;

export type SystemId = typeof SYSTEMS[number]["id"];

// ─── Posts ────────────────────────────────────────────────────────────────────

export interface CommunityPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  system: SystemId;
  tags: string[];
  author: { name: string; role: string; avatar: string; country: string };
  createdAt: string;
  likes: number;
  replies: number;
  pinned?: boolean;
}

export const POSTS: CommunityPost[] = [
  {
    id: "p1",
    title: "How I used AI tools to grow my small business by 300% in 6 months",
    excerpt: "I want to share how I integrated simple AI tools into my tailoring business in Yaoundé — and the results shocked even me.",
    content: "Full story here...",
    system: "technology-intelligence",
    tags: ["AI", "Business", "Growth"],
    author: { name: "Amina Bello", role: "Entrepreneur", avatar: "https://randomuser.me/api/portraits/women/32.jpg", country: "🇨🇲 Cameroon" },
    createdAt: "2025-03-01", likes: 148, replies: 34, pinned: true,
  },
  {
    id: "p2",
    title: "My Nation & I Youth Summit 2025 — Key Takeaways",
    excerpt: "Over 300 young leaders gathered in Douala last month. Here are the 5 most powerful ideas that came out of the summit.",
    content: "Full story here...",
    system: "civic-leadership",
    tags: ["Leadership", "Youth", "Summit"],
    author: { name: "Jean-Paul Mvondo", role: "Community Leader", avatar: "https://randomuser.me/api/portraits/men/54.jpg", country: "🇨🇲 Cameroon" },
    createdAt: "2025-02-22", likes: 92, replies: 21,
  },
  {
    id: "p3",
    title: "Breaking cycles: healing generational trauma in African families",
    excerpt: "Trauma doesn't just affect individuals — it travels across generations. Here's what I've learned as a counselor working with 200+ families.",
    content: "Full story here...",
    system: "human-flourishing",
    tags: ["Mental Health", "Family", "Healing"],
    author: { name: "Grace Nfor", role: "Counselor", avatar: "https://randomuser.me/api/portraits/women/44.jpg", country: "🇨🇲 Cameroon" },
    createdAt: "2025-02-15", likes: 211, replies: 67, pinned: true,
  },
  {
    id: "p4",
    title: "The women's cooperative model that's changing rural Cameroon",
    excerpt: "In Bamenda, 45 women pooled resources and built a processing facility. Today they earn 3x the regional average. Here's how.",
    content: "Full story here...",
    system: "economic-empowerment",
    tags: ["Women", "Cooperative", "Agriculture"],
    author: { name: "Madeleine Fon", role: "Development Officer", avatar: "https://randomuser.me/api/portraits/women/68.jpg", country: "🇨🇲 Cameroon" },
    createdAt: "2025-02-10", likes: 176, replies: 43,
  },
  {
    id: "p5",
    title: "Teaching digital storytelling to youth in rural Nigeria",
    excerpt: "We gave 80 teenagers smartphones, a curriculum, and 3 months. The stories they told moved the whole country.",
    content: "Full story here...",
    system: "media-narrative",
    tags: ["Storytelling", "Youth", "Nigeria"],
    author: { name: "Chidi Okafor", role: "Media Educator", avatar: "https://randomuser.me/api/portraits/men/71.jpg", country: "🇳🇬 Nigeria" },
    createdAt: "2025-01-28", likes: 88, replies: 19,
  },
  {
    id: "p6",
    title: "Afrobeats, identity, and the power of cultural reclamation",
    excerpt: "Music is not entertainment. It is memory, resistance, and prophecy. Here's why African artists are the most important voices of our generation.",
    content: "Full story here...",
    system: "creativity-culture",
    tags: ["Music", "Identity", "Culture"],
    author: { name: "Fatou Diallo", role: "Artist & Educator", avatar: "https://randomuser.me/api/portraits/women/58.jpg", country: "🇸🇳 Senegal" },
    createdAt: "2025-01-20", likes: 134, replies: 52,
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  title: string;
  description: string;
  system: SystemId;
  status: "Active" | "Recruiting" | "Completed";
  members: number;
  goal: string;
  country: string;
  lead: { name: string; avatar: string };
  tags: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "proj1",
    title: "1,000 Families Mental Health Initiative",
    description: "Providing free counseling access and mental health literacy to 1,000 families across Cameroon over 12 months.",
    system: "human-flourishing",
    status: "Active",
    members: 34, goal: "1,000 families",
    country: "🇨🇲 Cameroon",
    lead: { name: "Grace Nfor", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
    tags: ["Counseling", "Families", "Mental Health"],
  },
  {
    id: "proj2",
    title: "AI Skills for African Youth",
    description: "Training 5,000 young Africans in practical AI literacy, prompt engineering, and digital entrepreneurship through free online cohorts.",
    system: "technology-intelligence",
    status: "Recruiting",
    members: 12, goal: "5,000 youth",
    country: "🌍 Pan-Africa",
    lead: { name: "Amina Bello", avatar: "https://randomuser.me/api/portraits/women/32.jpg" },
    tags: ["AI", "Youth", "Digital Skills"],
  },
  {
    id: "proj3",
    title: "Women's Agricultural Cooperative Network",
    description: "Connecting 200 women-led cooperatives with markets, training, and microfinance. Building economic sovereignty from the ground up.",
    system: "economic-empowerment",
    status: "Active",
    members: 89, goal: "200 cooperatives",
    country: "🇨🇲 Cameroon 🇳🇬 Nigeria",
    lead: { name: "Madeleine Fon", avatar: "https://randomuser.me/api/portraits/women/68.jpg" },
    tags: ["Women", "Agriculture", "Finance"],
  },
  {
    id: "proj4",
    title: "Next Generation Leaders Academy",
    description: "A 6-month leadership immersion program for 100 young professionals. Covers ethics, governance, public policy, and community impact.",
    system: "civic-leadership",
    status: "Recruiting",
    members: 7, goal: "100 leaders",
    country: "🌍 Pan-Africa",
    lead: { name: "Jean-Paul Mvondo", avatar: "https://randomuser.me/api/portraits/men/54.jpg" },
    tags: ["Leadership", "Governance", "Youth"],
  },
  {
    id: "proj5",
    title: "African Voices Podcast Network",
    description: "Producing 52 episodes of community-led podcasts across 10 African cities, amplifying stories the mainstream media ignores.",
    system: "media-narrative",
    status: "Active",
    members: 28, goal: "52 episodes / 10 cities",
    country: "🌍 Pan-Africa",
    lead: { name: "Chidi Okafor", avatar: "https://randomuser.me/api/portraits/men/71.jpg" },
    tags: ["Podcast", "Media", "Storytelling"],
  },
  {
    id: "proj6",
    title: "Digital Arts Residency Program",
    description: "A 3-month online residency connecting 30 emerging African digital artists with mentors, tools, and a global exhibition.",
    system: "creativity-culture",
    status: "Completed",
    members: 30, goal: "30 artists / 1 exhibition",
    country: "🌍 Pan-Africa",
    lead: { name: "Fatou Diallo", avatar: "https://randomuser.me/api/portraits/women/58.jpg" },
    tags: ["Art", "Digital", "Residency"],
  },
];

// ─── Events ──────────────────────────────────────────────────────────────────

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  system: SystemId;
  date: string;
  time: string;
  type: "Online" | "In-Person" | "Hybrid";
  location: string;
  attendees: number;
  capacity: number;
  speaker: string;
  tags: string[];
}

export const EVENTS: CommunityEvent[] = [
  {
    id: "ev1",
    title: "The Future of AI in African Development",
    description: "A live panel discussion with AI researchers, entrepreneurs, and policymakers on how AI can accelerate Africa's transformation.",
    system: "technology-intelligence",
    date: "2025-04-15", time: "18:00 WAT",
    type: "Online", location: "Zoom Webinar",
    attendees: 312, capacity: 500,
    speaker: "Panel of 4 experts",
    tags: ["AI", "Development", "Panel"],
  },
  {
    id: "ev2",
    title: "Women's Economic Summit — Yaoundé",
    description: "A one-day summit bringing together women entrepreneurs, cooperatives, and investors to build lasting economic partnerships.",
    system: "economic-empowerment",
    date: "2025-04-28", time: "09:00 WAT",
    type: "In-Person", location: "Hilton, Yaoundé",
    attendees: 140, capacity: 200,
    speaker: "Madeleine Fon + 6 guests",
    tags: ["Women", "Business", "Networking"],
  },
  {
    id: "ev3",
    title: "Mental Health First Aid — Free Training",
    description: "Learn to recognise signs of mental health crisis, provide first response, and connect people to professional help. Open to all members.",
    system: "human-flourishing",
    date: "2025-05-03", time: "10:00 WAT",
    type: "Online", location: "GracyGlobal Platform",
    attendees: 89, capacity: 150,
    speaker: "Grace Nfor",
    tags: ["Mental Health", "Training", "Free"],
  },
  {
    id: "ev4",
    title: "Civic Leaders Cohort — Orientation",
    description: "Orientation session for the 2025 cohort of the Next Generation Leaders Academy. Learn about the 6-month journey ahead.",
    system: "civic-leadership",
    date: "2025-05-10", time: "17:00 WAT",
    type: "Hybrid", location: "Douala + Online",
    attendees: 45, capacity: 100,
    speaker: "Jean-Paul Mvondo",
    tags: ["Leadership", "Orientation", "Academy"],
  },
];

// ─── Resources ────────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  title: string;
  description: string;
  system: SystemId;
  type: "PDF" | "Video" | "Template" | "Toolkit" | "Report";
  downloads: number;
  tags: string[];
}

export const RESOURCES: Resource[] = [
  {
    id: "r1",
    title: "The African Entrepreneur's Starter Kit",
    description: "A 45-page PDF guide covering business registration, financing, pricing, and scaling in the African market context.",
    system: "economic-empowerment",
    type: "PDF", downloads: 2341,
    tags: ["Business", "Startup", "Africa"],
  },
  {
    id: "r2",
    title: "AI Tools for Non-Tech Professionals",
    description: "A practical video series (8 episodes) showing how to use ChatGPT, Canva AI, and other tools to run a better business.",
    system: "technology-intelligence",
    type: "Video", downloads: 1876,
    tags: ["AI", "Tools", "Productivity"],
  },
  {
    id: "r3",
    title: "Community Mental Health Toolkit",
    description: "A ready-to-use toolkit for community leaders to run mental health awareness sessions. Includes slides, scripts, and facilitator notes.",
    system: "human-flourishing",
    type: "Toolkit", downloads: 934,
    tags: ["Mental Health", "Community", "Facilitation"],
  },
  {
    id: "r4",
    title: "Youth Media Production Template Pack",
    description: "30+ Canva templates for social media posts, podcast artwork, and community newsletters — all Africa-themed.",
    system: "media-narrative",
    type: "Template", downloads: 1542,
    tags: ["Media", "Design", "Youth"],
  },
  {
    id: "r5",
    title: "2025 State of African Youth Report",
    description: "A 60-page research report on employment, education, mental health, and digital adoption among African youth aged 18–35.",
    system: "civic-leadership",
    type: "Report", downloads: 788,
    tags: ["Research", "Youth", "Data"],
  },
  {
    id: "r6",
    title: "Creative Business Playbook for Artists",
    description: "How to monetise your art, music, or storytelling through digital platforms, licensing, and community economies.",
    system: "creativity-culture",
    type: "PDF", downloads: 671,
    tags: ["Art", "Business", "Monetisation"],
  },
];

// ─── Members ─────────────────────────────────────────────────────────────────

export interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  country: string;
  systems: SystemId[];
  joined: string;
  contributions: number;
  badge: "Pioneer" | "Contributor" | "Leader" | "Mentor";
}

export const MEMBERS: Member[] = [
  {
    id: "m1", name: "Grace Nfor", role: "Mental Health Counselor",
    bio: "8 years helping families heal. Building a trauma-free Africa one session at a time.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    country: "🇨🇲 Cameroon", systems: ["human-flourishing", "knowledge-skills"],
    joined: "2023-01", contributions: 47, badge: "Mentor",
  },
  {
    id: "m2", name: "Jean-Paul Mvondo", role: "Civic Leader",
    bio: "Training the next generation of ethical African leaders. Governance is a calling.",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    country: "🇨🇲 Cameroon", systems: ["civic-leadership", "knowledge-skills"],
    joined: "2023-03", contributions: 38, badge: "Leader",
  },
  {
    id: "m3", name: "Amina Bello", role: "AI Entrepreneur",
    bio: "Using AI to solve African problems. Founder of 2 tech startups. 5,000+ students trained.",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    country: "🇳🇬 Nigeria", systems: ["technology-intelligence", "economic-empowerment"],
    joined: "2023-06", contributions: 62, badge: "Pioneer",
  },
  {
    id: "m4", name: "Fatou Diallo", role: "Digital Artist & Educator",
    bio: "Blending Senegalese heritage with digital art. Cultural identity is our superpower.",
    avatar: "https://randomuser.me/api/portraits/women/58.jpg",
    country: "🇸🇳 Senegal", systems: ["creativity-culture", "media-narrative"],
    joined: "2023-08", contributions: 29, badge: "Contributor",
  },
  {
    id: "m5", name: "Chidi Okafor", role: "Media Educator",
    bio: "Giving youth a microphone and a mission. Storytelling changes nations.",
    avatar: "https://randomuser.me/api/portraits/men/71.jpg",
    country: "🇳🇬 Nigeria", systems: ["media-narrative", "knowledge-skills"],
    joined: "2024-01", contributions: 22, badge: "Contributor",
  },
  {
    id: "m6", name: "Madeleine Fon", role: "Development Officer",
    bio: "Building cooperative economies for women across the continent.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    country: "🇨🇲 Cameroon", systems: ["economic-empowerment", "civic-leadership"],
    joined: "2023-11", contributions: 41, badge: "Leader",
  },
];
