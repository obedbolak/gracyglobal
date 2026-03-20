// data/courses.ts
// Single source of truth for e-learning courses and categories.
// NOTE: All pricing amounts are in XAF (Central African Franc) - the base currency.

// ─── Course Categories ─────────────────────────────────────────────────────────

export const COURSE_CATEGORIES = [
  {
    id: "technology",
    name: "Technology & Programming",
    icon: "💻",
    description: "Web development, mobile apps, software engineering, and IT skills",
    color: "#3B82F6",
  },
  {
    id: "business",
    name: "Business & Entrepreneurship",
    icon: "💼",
    description: "Start and grow your business, management, and leadership skills",
    color: "#8B5CF6",
  },
  {
    id: "marketing",
    name: "Marketing & Sales",
    icon: "📈",
    description: "Digital marketing, social media, SEO, and sales strategies",
    color: "#EC4899",
  },
  {
    id: "design",
    name: "Design & Creative",
    icon: "🎨",
    description: "Graphic design, UI/UX, video editing, and creative skills",
    color: "#F59E0B",
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    icon: "💰",
    description: "Personal finance, investing, accounting, and financial planning",
    color: "#10B981",
  },
  {
    id: "personal-development",
    name: "Personal Development",
    icon: "🌟",
    description: "Productivity, communication, leadership, and soft skills",
    color: "#6366F1",
  },
  {
    id: "health-wellness",
    name: "Health & Wellness",
    icon: "🧘",
    description: "Fitness, nutrition, mental health, and lifestyle improvement",
    color: "#14B8A6",
  },
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number]["id"];

export type CourseCategory = (typeof COURSE_CATEGORIES)[number]["id"];

// ─── Course Interface ─────────────────────────────────────────────────────────

export interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: CourseCategory;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: number; // in minutes
  students: number;
  rating?: number;
  isFree: boolean;
  price?: number;
  instructor?: string;
  featured?: boolean;
  sections: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      type: "VIDEO" | "TEXT" | "QUIZ";
      duration: number;
      isFree: boolean;
    }[];
  }[];
}

export const COURSES: CourseData[] = [
  // Technology & Programming
  {
    id: "1",
    title: "Introduction to Web Development",
    description: "Learn HTML, CSS, and JavaScript from scratch. Build real-world projects and master the fundamentals of web development.",
    category: "technology",
    level: "Beginner",
    duration: 240,
    students: 1250,
    rating: 4.8,
    isFree: true,
    instructor: "John Kamau",
    featured: true,
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
    sections: [
      {
        id: "s1",
        title: "Getting Started with HTML",
        lessons: [
          {
            id: "l1",
            title: "Introduction to HTML",
            type: "VIDEO",
            duration: 15,
            isFree: true,
          },
          {
            id: "l2",
            title: "HTML Elements and Tags",
            type: "TEXT",
            duration: 20,
            isFree: true,
          },
          {
            id: "l3",
            title: "HTML Forms",
            type: "VIDEO",
            duration: 25,
            isFree: false,
          },
        ],
      },
      {
        id: "s2",
        title: "Styling with CSS",
        lessons: [
          {
            id: "l4",
            title: "CSS Basics",
            type: "VIDEO",
            duration: 25,
            isFree: false,
          },
          {
            id: "l5",
            title: "CSS Flexbox",
            type: "TEXT",
            duration: 30,
            isFree: false,
          },
          {
            id: "l6",
            title: "CSS Grid Layout",
            type: "VIDEO",
            duration: 35,
            isFree: false,
          },
        ],
      },
      {
        id: "s3",
        title: "JavaScript Fundamentals",
        lessons: [
          {
            id: "l7",
            title: "Variables and Data Types",
            type: "VIDEO",
            duration: 30,
            isFree: false,
          },
          {
            id: "l8",
            title: "Functions and Scope",
            type: "TEXT",
            duration: 25,
            isFree: false,
          },
          {
            id: "l9",
            title: "JavaScript Quiz",
            type: "QUIZ",
            duration: 15,
            isFree: false,
          },
        ],
      },
    ],
  },
  // Marketing & Sales
  {
    id: "2",
    title: "Digital Marketing Essentials",
    description: "Master social media, SEO, and content marketing. Learn strategies to grow your brand online and reach your target audience effectively.",
    category: "marketing",
    level: "Intermediate",
    duration: 180,
    students: 890,
    rating: 4.6,
    isFree: false,
    price: 15000,
    instructor: "Amina Hassan",
    featured: true,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    sections: [
      {
        id: "s4",
        title: "Social Media Marketing",
        lessons: [
          {
            id: "l10",
            title: "Facebook Marketing Strategy",
            type: "VIDEO",
            duration: 35,
            isFree: true,
          },
          {
            id: "l11",
            title: "Instagram Growth Tactics",
            type: "VIDEO",
            duration: 40,
            isFree: false,
          },
          {
            id: "l12",
            title: "Twitter Engagement",
            type: "TEXT",
            duration: 20,
            isFree: false,
          },
        ],
      },
      {
        id: "s5",
        title: "SEO Fundamentals",
        lessons: [
          {
            id: "l13",
            title: "Keyword Research",
            type: "VIDEO",
            duration: 30,
            isFree: false,
          },
          {
            id: "l14",
            title: "On-Page SEO",
            type: "TEXT",
            duration: 25,
            isFree: false,
          },
          {
            id: "l15",
            title: "SEO Quiz",
            type: "QUIZ",
            duration: 10,
            isFree: false,
          },
        ],
      },
    ],
  },
  // Business & Entrepreneurship
  {
    id: "3",
    title: "Entrepreneurship in Africa",
    description: "Build and scale your business across African markets. Learn from successful entrepreneurs and understand the unique opportunities in Africa.",
    category: "business",
    level: "Intermediate",
    duration: 320,
    students: 2100,
    rating: 4.9,
    isFree: false,
    price: 25000,
    instructor: "Kwame Mensah",
    featured: true,
    thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    sections: [
      {
        id: "s6",
        title: "Starting Your Business",
        lessons: [
          {
            id: "l16",
            title: "Finding Your Business Idea",
            type: "VIDEO",
            duration: 45,
            isFree: true,
          },
          {
            id: "l17",
            title: "Market Research in Africa",
            type: "TEXT",
            duration: 50,
            isFree: false,
          },
          {
            id: "l18",
            title: "Business Plan Essentials",
            type: "VIDEO",
            duration: 40,
            isFree: false,
          },
        ],
      },
      {
        id: "s7",
        title: "Funding and Finance",
        lessons: [
          {
            id: "l19",
            title: "Bootstrapping Your Startup",
            type: "VIDEO",
            duration: 35,
            isFree: false,
          },
          {
            id: "l20",
            title: "Finding Investors",
            type: "TEXT",
            duration: 30,
            isFree: false,
          },
          {
            id: "l21",
            title: "Financial Management",
            type: "VIDEO",
            duration: 40,
            isFree: false,
          },
        ],
      },
      {
        id: "s8",
        title: "Scaling Your Business",
        lessons: [
          {
            id: "l22",
            title: "Building a Team",
            type: "VIDEO",
            duration: 35,
            isFree: false,
          },
          {
            id: "l23",
            title: "Expanding to New Markets",
            type: "TEXT",
            duration: 30,
            isFree: false,
          },
          {
            id: "l24",
            title: "Entrepreneurship Quiz",
            type: "QUIZ",
            duration: 15,
            isFree: false,
          },
        ],
      },
    ],
  },
  // Design & Creative
  {
    id: "4",
    title: "Graphic Design Fundamentals",
    description: "Master the principles of design, color theory, and typography. Create stunning visuals using industry-standard tools.",
    category: "design",
    level: "Beginner",
    duration: 200,
    students: 650,
    rating: 4.7,
    isFree: false,
    price: 18000,
    instructor: "Sarah Okonkwo",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop",
    sections: [
      {
        id: "s9",
        title: "Design Principles",
        lessons: [
          {
            id: "l25",
            title: "Introduction to Design",
            type: "VIDEO",
            duration: 30,
            isFree: true,
          },
          {
            id: "l26",
            title: "Color Theory",
            type: "TEXT",
            duration: 25,
            isFree: false,
          },
          {
            id: "l27",
            title: "Typography Basics",
            type: "VIDEO",
            duration: 35,
            isFree: false,
          },
        ],
      },
      {
        id: "s10",
        title: "Design Tools",
        lessons: [
          {
            id: "l28",
            title: "Adobe Photoshop Basics",
            type: "VIDEO",
            duration: 45,
            isFree: false,
          },
          {
            id: "l29",
            title: "Figma for Beginners",
            type: "VIDEO",
            duration: 40,
            isFree: false,
          },
          {
            id: "l30",
            title: "Design Quiz",
            type: "QUIZ",
            duration: 10,
            isFree: false,
          },
        ],
      },
    ],
  },
  // Finance & Accounting
  {
    id: "5",
    title: "Personal Finance Management",
    description: "Learn how to budget, save, invest, and build wealth. Take control of your financial future with practical strategies.",
    category: "finance",
    level: "Beginner",
    duration: 150,
    students: 1800,
    rating: 4.5,
    isFree: true,
    instructor: "David Mwangi",
    thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop",
    sections: [
      {
        id: "s11",
        title: "Budgeting Basics",
        lessons: [
          {
            id: "l31",
            title: "Creating Your First Budget",
            type: "VIDEO",
            duration: 25,
            isFree: true,
          },
          {
            id: "l32",
            title: "Tracking Expenses",
            type: "TEXT",
            duration: 20,
            isFree: true,
          },
          {
            id: "l33",
            title: "Saving Strategies",
            type: "VIDEO",
            duration: 30,
            isFree: false,
          },
        ],
      },
      {
        id: "s12",
        title: "Investing 101",
        lessons: [
          {
            id: "l34",
            title: "Introduction to Investing",
            type: "VIDEO",
            duration: 35,
            isFree: false,
          },
          {
            id: "l35",
            title: "Understanding Risk",
            type: "TEXT",
            duration: 20,
            isFree: false,
          },
          {
            id: "l36",
            title: "Finance Quiz",
            type: "QUIZ",
            duration: 10,
            isFree: false,
          },
        ],
      },
    ],
  },
  // Personal Development
  {
    id: "6",
    title: "Effective Communication Skills",
    description: "Master the art of communication in personal and professional settings. Learn public speaking, active listening, and persuasion techniques.",
    category: "personal-development",
    level: "Beginner",
    duration: 120,
    students: 980,
    rating: 4.6,
    isFree: false,
    price: 12000,
    instructor: "Grace Akinyi",
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
    sections: [
      {
        id: "s13",
        title: "Communication Fundamentals",
        lessons: [
          {
            id: "l37",
            title: "The Power of Communication",
            type: "VIDEO",
            duration: 20,
            isFree: true,
          },
          {
            id: "l38",
            title: "Active Listening Techniques",
            type: "TEXT",
            duration: 15,
            isFree: false,
          },
          {
            id: "l39",
            title: "Body Language Basics",
            type: "VIDEO",
            duration: 25,
            isFree: false,
          },
        ],
      },
      {
        id: "s14",
        title: "Public Speaking",
        lessons: [
          {
            id: "l40",
            title: "Overcoming Stage Fright",
            type: "VIDEO",
            duration: 30,
            isFree: false,
          },
          {
            id: "l41",
            title: "Structuring Your Speech",
            type: "TEXT",
            duration: 20,
            isFree: false,
          },
          {
            id: "l42",
            title: "Communication Quiz",
            type: "QUIZ",
            duration: 10,
            isFree: false,
          },
        ],
      },
    ],
  },
  // Health & Wellness
  {
    id: "7",
    title: "Fitness & Nutrition Basics",
    description: "Transform your health with proper nutrition and exercise. Learn sustainable habits for a healthier lifestyle.",
    category: "health-wellness",
    level: "Beginner",
    duration: 140,
    students: 1450,
    rating: 4.7,
    isFree: true,
    instructor: "Dr. Fatima Diop",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
    sections: [
      {
        id: "s15",
        title: "Nutrition Essentials",
        lessons: [
          {
            id: "l43",
            title: "Understanding Macronutrients",
            type: "VIDEO",
            duration: 25,
            isFree: true,
          },
          {
            id: "l44",
            title: "Meal Planning Basics",
            type: "TEXT",
            duration: 20,
            isFree: true,
          },
          {
            id: "l45",
            title: "Healthy Eating Habits",
            type: "VIDEO",
            duration: 30,
            isFree: false,
          },
        ],
      },
      {
        id: "s16",
        title: "Fitness Fundamentals",
        lessons: [
          {
            id: "l46",
            title: "Creating a Workout Routine",
            type: "VIDEO",
            duration: 35,
            isFree: false,
          },
          {
            id: "l47",
            title: "Exercise Safety",
            type: "TEXT",
            duration: 15,
            isFree: false,
          },
          {
            id: "l48",
            title: "Health & Wellness Quiz",
            type: "QUIZ",
            duration: 10,
            isFree: false,
          },
        ],
      },
    ],
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getCourseById(id: string): CourseData | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getFeaturedCourses(): CourseData[] {
  return COURSES.filter((c) => c.featured);
}

export function getCoursesByCategory(category: CourseCategory): CourseData[] {
  return COURSES.filter((c) => c.category === category);
}

export function getFreeCourses(): CourseData[] {
  return COURSES.filter((c) => c.isFree);
}

export function getCategoryById(id: string) {
  return COURSE_CATEGORIES.find((cat) => cat.id === id);
}
