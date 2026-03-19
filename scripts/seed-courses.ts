import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCourses() {
  console.log("Seeding courses...");

  // Create courses
  const webDevCourse = await prisma.course.create({
    data: {
      title: "Introduction to Web Development",
      description: "Learn HTML, CSS, and JavaScript from scratch. Build real-world projects and master the fundamentals of web development.",
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
      category: "Technology",
      level: "BEGINNER",
      price: 0,
      isFree: true,
      published: true,
      featured: true,
    },
  });

  const marketingCourse = await prisma.course.create({
    data: {
      title: "Digital Marketing Essentials",
      description: "Master social media, SEO, and content marketing. Learn strategies to grow your brand online.",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
      category: "Marketing",
      level: "INTERMEDIATE",
      price: 15000,
      isFree: false,
      published: true,
      featured: false,
    },
  });

  const entrepreneurshipCourse = await prisma.course.create({
    data: {
      title: "Entrepreneurship in Africa",
      description: "Build and scale your business across African markets. Learn from successful entrepreneurs.",
      thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
      category: "Business",
      level: "INTERMEDIATE",
      price: 25000,
      isFree: false,
      published: true,
      featured: true,
    },
  });

  // Create sections and lessons for Web Dev course
  const webDevSection1 = await prisma.courseSection.create({
    data: {
      courseId: webDevCourse.id,
      title: "Getting Started with HTML",
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: webDevSection1.id,
      title: "Introduction to HTML",
      type: "VIDEO",
      videoUrl: "https://example.com/video1.mp4",
      duration: 15,
      order: 1,
      isFree: true,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: webDevSection1.id,
      title: "HTML Elements and Tags",
      type: "TEXT",
      content: "<h1>HTML Elements</h1><p>Learn about the basic building blocks of HTML...</p>",
      duration: 20,
      order: 2,
      isFree: true,
    },
  });

  const webDevSection2 = await prisma.courseSection.create({
    data: {
      courseId: webDevCourse.id,
      title: "Styling with CSS",
      order: 2,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: webDevSection2.id,
      title: "CSS Basics",
      type: "VIDEO",
      videoUrl: "https://example.com/video2.mp4",
      duration: 25,
      order: 1,
      isFree: false,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: webDevSection2.id,
      title: "CSS Flexbox",
      type: "TEXT",
      content: "<h1>Flexbox Layout</h1><p>Master modern CSS layouts with Flexbox...</p>",
      duration: 30,
      order: 2,
      isFree: false,
    },
  });

  // Create sections for Marketing course
  const marketingSection1 = await prisma.courseSection.create({
    data: {
      courseId: marketingCourse.id,
      title: "Social Media Marketing",
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: marketingSection1.id,
      title: "Facebook Marketing Strategy",
      type: "VIDEO",
      videoUrl: "https://example.com/marketing1.mp4",
      duration: 35,
      order: 1,
      isFree: true,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: marketingSection1.id,
      title: "Instagram Growth Tactics",
      type: "VIDEO",
      videoUrl: "https://example.com/marketing2.mp4",
      duration: 40,
      order: 2,
      isFree: false,
    },
  });

  // Create sections for Entrepreneurship course
  const entrepreneurSection1 = await prisma.courseSection.create({
    data: {
      courseId: entrepreneurshipCourse.id,
      title: "Starting Your Business",
      order: 1,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: entrepreneurSection1.id,
      title: "Finding Your Business Idea",
      type: "VIDEO",
      videoUrl: "https://example.com/business1.mp4",
      duration: 45,
      order: 1,
      isFree: true,
    },
  });

  await prisma.lesson.create({
    data: {
      sectionId: entrepreneurSection1.id,
      title: "Market Research in Africa",
      type: "TEXT",
      content: "<h1>Market Research</h1><p>Understanding African markets...</p>",
      duration: 50,
      order: 2,
      isFree: false,
    },
  });

  console.log("✅ Courses seeded successfully!");
  console.log(`Web Dev Course ID: ${webDevCourse.id}`);
  console.log(`Marketing Course ID: ${marketingCourse.id}`);
  console.log(`Entrepreneurship Course ID: ${entrepreneurshipCourse.id}`);
}

seedCourses()
  .catch((e) => {
    console.error("Error seeding courses:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
