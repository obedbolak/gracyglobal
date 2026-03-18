export interface Spirit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: SpiritField[];
}

export interface SpiritField {
  id: string;
  name: string;
  description: string;
  type: "text" | "number" | "select" | "textarea";
  options?: string[];
  required: boolean;
  placeholder?: string;
}

export const sevenSpirits: Spirit[] = [
  {
    id: "wisdom",
    name: "Spirit of Wisdom",
    description: "Divine wisdom and understanding for life's decisions",
    icon: "🧠",
    color: "#7B2FBE",
    fields: [
      {
        id: "wisdom-level",
        name: "Current Wisdom Level",
        description: "Rate your current level of wisdom",
        type: "select",
        options: ["Beginner", "Intermediate", "Advanced", "Expert"],
        required: true
      },
      {
        id: "wisdom-areas",
        name: "Areas Seeking Wisdom",
        description: "What areas of life do you need wisdom in?",
        type: "textarea",
        required: true,
        placeholder: "Career, relationships, finances, etc."
      }
    ]
  },
  {
    id: "understanding",
    name: "Spirit of Understanding",
    description: "Deep comprehension and insight into spiritual matters",
    icon: "💡",
    color: "#3B82F6",
    fields: [
      {
        id: "understanding-focus",
        name: "Focus Area",
        description: "What do you seek to understand better?",
        type: "select",
        options: ["Scripture", "Purpose", "Relationships", "Spiritual Gifts"],
        required: true
      },
      {
        id: "understanding-challenges",
        name: "Current Challenges",
        description: "What challenges are you facing in understanding?",
        type: "textarea",
        required: false,
        placeholder: "Describe your current challenges..."
      }
    ]
  },
  {
    id: "counsel",
    name: "Spirit of Counsel",
    description: "Guidance and direction for making right choices",
    icon: "🗣️",
    color: "#10B981",
    fields: [
      {
        id: "counsel-need",
        name: "Type of Counsel Needed",
        description: "What kind of guidance are you seeking?",
        type: "select",
        options: ["Life Direction", "Career Guidance", "Relationship Advice", "Spiritual Growth"],
        required: true
      },
      {
        id: "counsel-urgency",
        name: "Urgency Level",
        description: "How urgent is your need for counsel?",
        type: "select",
        options: ["Low", "Medium", "High", "Critical"],
        required: true
      }
    ]
  },
  {
    id: "might",
    name: "Spirit of Might",
    description: "Strength and power to overcome challenges",
    icon: "💪",
    color: "#DC2626",
    fields: [
      {
        id: "might-challenges",
        name: "Current Challenges",
        description: "What challenges do you need strength to overcome?",
        type: "textarea",
        required: true,
        placeholder: "Describe the challenges you're facing..."
      },
      {
        id: "might-type",
        name: "Type of Strength Needed",
        description: "What kind of strength do you need?",
        type: "select",
        options: ["Physical", "Emotional", "Spiritual", "Mental"],
        required: true
      }
    ]
  },
  {
    id: "knowledge",
    name: "Spirit of Knowledge",
    description: "Divine knowledge and revelation of truth",
    icon: "📚",
    color: "#F59E0B",
    fields: [
      {
        id: "knowledge-area",
        name: "Knowledge Area",
        description: "What area of knowledge are you seeking?",
        type: "select",
        options: ["Biblical Knowledge", "Spiritual Gifts", "Ministry", "Personal Growth"],
        required: true
      },
      {
        id: "knowledge-application",
        name: "How Will You Apply This Knowledge?",
        description: "Describe how you plan to use this knowledge",
        type: "textarea",
        required: false,
        placeholder: "Share your plans for applying this knowledge..."
      }
    ]
  },
  {
    id: "fear-of-lord",
    name: "Spirit of Fear of the Lord",
    description: "Reverent awe and respect for God's holiness",
    icon: "🙏",
    color: "#8B5CF6",
    fields: [
      {
        id: "reverence-level",
        name: "Current Reverence Level",
        description: "How would you rate your reverence for God?",
        type: "select",
        options: ["Growing", "Moderate", "Strong", "Deep"],
        required: true
      },
      {
        id: "reverence-areas",
        name: "Areas for Growth",
        description: "In what areas do you want to grow in reverence?",
        type: "textarea",
        required: false,
        placeholder: "Prayer, worship, obedience, etc."
      }
    ]
  },
  {
    id: "discernment",
    name: "Spirit of Discernment",
    description: "Ability to distinguish between good and evil, truth and deception",
    icon: "👁️",
    color: "#EC4899",
    fields: [
      {
        id: "discernment-need",
        name: "Discernment Need",
        description: "What do you need discernment for?",
        type: "select",
        options: ["Relationships", "Opportunities", "Spiritual Matters", "Decision Making"],
        required: true
      },
      {
        id: "discernment-situation",
        name: "Current Situation",
        description: "Describe the situation requiring discernment",
        type: "textarea",
        required: false,
        placeholder: "Share details about your situation..."
      }
    ]
  }
];