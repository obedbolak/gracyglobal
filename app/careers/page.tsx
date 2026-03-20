"use client";

import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";

const positions = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build and scale our platform to serve millions of users worldwide.",
  },
  {
    id: 2,
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Create beautiful, intuitive experiences for our global community.",
  },
  {
    id: 3,
    title: "Community Manager",
    department: "Community",
    location: "Remote",
    type: "Full-time",
    description: "Foster engagement and growth within our diverse community.",
  },
  {
    id: 4,
    title: "Content Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Tell our story and connect with audiences across multiple channels.",
  },
  {
    id: 5,
    title: "Licensed Counselor",
    department: "Counseling",
    location: "Remote",
    type: "Contract",
    description: "Provide professional counseling services to our community members.",
  },
  {
    id: 6,
    title: "Customer Success Manager",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description: "Ensure our users have exceptional experiences on the platform.",
  },
];

const benefits = [
  { title: "Remote First", description: "Work from anywhere in the world" },
  { title: "Flexible Hours", description: "Choose your own schedule" },
  { title: "Health Coverage", description: "Comprehensive health benefits" },
  { title: "Learning Budget", description: "Annual budget for courses & books" },
  { title: "Paid Time Off", description: "Generous vacation and sick leave" },
  { title: "Growth Opportunities", description: "Career development support" },
];

const values = [
  { title: "Impact", description: "We're changing lives every day" },
  { title: "Diversity", description: "We celebrate different perspectives" },
  { title: "Innovation", description: "We embrace new ideas and approaches" },
  { title: "Collaboration", description: "We succeed together as a team" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-5xl md:text-6xl font-black mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Join Our{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--purple), var(--blue))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Mission
              </span>
            </h1>
            <p
              className="text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: "var(--text-muted)" }}
            >
              Help us empower lives and create opportunities for people around the world
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--text-primary)" }}
          >
            Our Values
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl text-center"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--divider)",
                }}
              >
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {value.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--text-primary)" }}
          >
            Benefits & Perks
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--divider)",
                }}
              >
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {benefit.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: "var(--text-primary)" }}
          >
            Open Positions
          </h2>
          <div className="space-y-4">
            {positions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl group cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--divider)",
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, var(--purple), var(--blue))",
                        }}
                      >
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3
                          className="text-xl font-bold mb-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {position.title}
                        </h3>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--purple)" }}
                        >
                          {position.department}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {position.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <div
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                        style={{
                          background: "var(--badge-purple-bg)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {position.location}
                      </div>
                      <div
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                        style={{
                          background: "var(--badge-purple-bg)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {position.type}
                      </div>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all group-hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, var(--purple), var(--blue))",
                      color: "white",
                    }}
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Don't See Your Role?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              We're always looking for talented people. Send us your resume and tell us how you can contribute.
            </p>
            <button
              className="px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                background: "white",
                color: "var(--purple)",
              }}
            >
              Send General Application
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
