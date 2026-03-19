"use client";

import { use, useState } from "react";
import { getServiceById } from "@/data/services";
import { Star, Clock, MapPin, Check, ChevronLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ServiceBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const service = getServiceById(id);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    address: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);

  if (!service) {
    return (
      <div className="min-h-screen pt-24 pb-16" style={{ background: "var(--background)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Service not found
          </h1>
          <Link href="/services" className="text-sm" style={{ color: "var(--blue)" }}>
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return `₦${(amount / 1000).toFixed(0)}k`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Here you would typically send the booking data to your backend
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--success-bg)" }}>
            <Check size={40} style={{ color: "var(--green)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Booking Confirmed!
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Your booking for {service.name} has been received. We'll contact you shortly to confirm the details.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, var(--purple), var(--blue))" }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <ChevronLeft size={16} />
          Back to Services
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Service Details */}
          <div>
            <div className="rounded-2xl overflow-hidden mb-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <img
                src={service.images[0]}
                alt={service.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                {service.badge && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                    style={{ background: "linear-gradient(135deg, var(--scarlet), var(--purple))" }}
                  >
                    {service.badge}
                  </span>
                )}
                <h1 className="text-3xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
                  {service.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} fill="var(--yellow)" style={{ color: "var(--yellow)" }} />
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {service.rating}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    ({service.reviews} reviews)
                  </span>
                </div>
                <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                  {service.description}
                </p>

                {/* Availability */}
                {service.availability && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl" style={{ background: "var(--glass-bg-subtle)" }}>
                    <Clock size={18} style={{ color: "var(--blue)" }} />
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      {service.availability}
                    </span>
                  </div>
                )}

                {/* Includes */}
                {service.includes && service.includes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>
                      What's Included:
                    </h3>
                    <div className="space-y-2">
                      {service.includes.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check size={16} className="mt-0.5" style={{ color: "var(--green)" }} />
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div className="p-4 rounded-xl" style={{ background: "var(--glass-bg-subtle)", border: "1px solid var(--glass-border)" }}>
                  <div className="text-3xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
                    {formatPrice(service.pricing.amount)}
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {service.pricing.type === "monthly" && "per month"}
                    {service.pricing.type === "one-time" && service.pricing.label}
                    {service.pricing.type === "per-session" && service.pricing.label}
                  </div>
                  {service.pricing.yearlyAmount && (
                    <div className="text-xs mt-2" style={{ color: "var(--green)" }}>
                      Save {formatPrice(service.pricing.amount * 12 - service.pricing.yearlyAmount)} with yearly plan
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="rounded-2xl p-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
                Book This Service
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                      Preferred Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                    Service Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Where should we provide the service?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                    style={{
                      background: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      color: "var(--text-primary)",
                    }}
                    placeholder="Any special requests or requirements?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, var(--purple), var(--blue))",
                    boxShadow: "0 4px 14px rgba(123,47,190,0.35)",
                  }}
                >
                  Confirm Booking
                </button>

                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  By booking, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
