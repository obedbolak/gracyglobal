"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }, 1500);
  };

  return (
    <main
      className="min-h-screen py-24"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "var(--badge-blue-bg)",
              border: "1px solid var(--divider-strong)",
            }}
          >
            <MessageCircle
              className="w-4 h-4"
              style={{ color: "var(--blue)" }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--blue)" }}
            >
              Get In Touch
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Contact{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--purple-light), var(--blue-light))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Us
            </span>
          </h1>
          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--badge-blue-bg)" }}
                  >
                    <Mail
                      className="w-5 h-5"
                      style={{ color: "var(--blue)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Email
                    </h3>
                    <a
                      href="mailto:support@gracyglobal.com"
                      className="text-sm hover:underline"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      support@gracyglobal.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--badge-purple-bg)" }}
                  >
                    <Phone
                      className="w-5 h-5"
                      style={{ color: "var(--purple)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Phone
                    </h3>
                    <a
                      href="tel:+237123456789"
                      className="text-sm hover:underline"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      +237 67 68 69 844
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--badge-blue-bg)" }}
                  >
                    <MapPin
                      className="w-5 h-5"
                      style={{ color: "var(--blue)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Address
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      GracyGlobal
                      <br />
                      Yaounde, Cameroon
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h3
                className="font-bold mb-3"
                style={{ color: "var(--text-primary)" }}
              >
                Business Hours
              </h3>
              <div
                className="space-y-2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div
              className="p-8 rounded-2xl"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                Send us a Message
              </h2>

              {submitStatus === "success" && (
                <div
                  className="mb-6 p-4 rounded-xl"
                  style={{
                    background: "var(--success-bg)",
                    border: "1px solid var(--success-border)",
                  }}
                >
                  <p
                    className="font-semibold"
                    style={{ color: "var(--success-text)" }}
                  >
                    Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="counseling">Counseling Services</option>
                    <option value="jobs">Job Opportunities</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="services">Professional Services</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl focus:ring-2 focus:outline-none resize-none"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--purple), var(--blue))",
                    boxShadow: "var(--btn-primary-shadow)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
