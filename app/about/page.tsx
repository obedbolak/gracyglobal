"use client";

import { motion } from "framer-motion";
import { Heart, Users, Globe, Target, Award, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen py-24" style={{ background: "var(--background)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "var(--badge-purple-bg)",
              border: "1px solid var(--divider-strong)",
            }}
          >
            <Heart className="w-4 h-4" style={{ color: "var(--purple)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--purple)" }}>
              About GracyGlobal
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Empowering Lives Across{" "}
            <span
              style={{
                background: "linear-gradient(90deg, var(--purple-light), var(--blue-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Africa & Beyond
            </span>
          </h1>
          <p 
            className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            GracyGlobal is a digital ecosystem connecting counseling, remote work, 
            community development, and commerce to transform lives and build stronger communities.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 rounded-2xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
          >
            <Target className="w-12 h-12 mb-4" style={{ color: "var(--purple)" }} />
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Our Mission
            </h2>
            <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              To create accessible pathways to mental wellness, economic opportunity, and 
              community empowerment through innovative digital solutions that serve Africa 
              and the global community.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 rounded-2xl"
            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
          >
            <Zap className="w-12 h-12 mb-4" style={{ color: "var(--blue)" }} />
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Our Vision
            </h2>
            <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              A world where everyone has access to the support, opportunities, and resources 
              they need to thrive—regardless of location, background, or circumstance.
            </p>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--text-primary)" }}
          >
            Our Core Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Compassion",
                description: "We lead with empathy and understanding in everything we do.",
                color: "var(--scarlet)",
              },
              {
                icon: Users,
                title: "Community",
                description: "We believe in the power of connection and collective growth.",
                color: "var(--purple)",
              },
              {
                icon: Globe,
                title: "Accessibility",
                description: "We make opportunities available to everyone, everywhere.",
                color: "var(--blue)",
              },
              {
                icon: Award,
                title: "Excellence",
                description: "We maintain the highest standards in service and support.",
                color: "var(--purple)",
              },
              {
                icon: Zap,
                title: "Innovation",
                description: "We continuously evolve to meet the changing needs of our community.",
                color: "var(--blue)",
              },
              {
                icon: Target,
                title: "Impact",
                description: "We measure success by the positive change we create.",
                color: "var(--scarlet)",
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl transition-all hover:scale-105"
                  style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
                >
                  <Icon className="w-10 h-10 mb-4" style={{ color: value.color }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    {value.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* What We Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--text-primary)" }}
          >
            What We Offer
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Professional Counseling",
                description: "Connect with certified counselors for mental health support, relationship guidance, and life coaching.",
              },
              {
                title: "Job Opportunities",
                description: "Access vetted remote positions from global companies across various industries.",
              },
              {
                title: "Community Development",
                description: "Join initiatives focused on youth empowerment, women's programs, and community building.",
              },
              {
                title: "Marketplace",
                description: "Shop curated wellness, beauty, and skincare products from African entrepreneurs.",
              },
              {
                title: "E-Learning Platform",
                description: "Access quality courses to develop in-demand skills and advance your career.",
              },
              {
                title: "Professional Services",
                description: "Book trusted professionals for home care, beauty, wellness, and lifestyle services.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
              >
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--text-secondary)" }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl"
          style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
        >
          {[
            { value: "10K+", label: "Active Users" },
            { value: "120+", label: "Counselors" },
            { value: "500+", label: "Job Listings" },
            { value: "50+", label: "Community Projects" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div 
                className="text-4xl font-extrabold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {stat.value}
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
