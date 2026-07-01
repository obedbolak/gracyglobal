"use client";

import { use, useState } from "react";
import { useService } from "@/hooks/useServices";
import { Star, Clock, Check, ChevronLeft, CheckCircle2, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/hooks/useCurrency";
import { useCategories } from "@/hooks/useCategories";

export default function ServiceBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { categories } = useCategories("service");

  const { service, loading, error } = useService(id);
  const { convert } = useCurrency();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
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

  if (loading) {
    return (
      <div
        className="min-h-screen pt-24 pb-16 flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "var(--glass-border)",
              borderTopColor: "var(--blue)",
            }}
          />
          <p style={{ color: "var(--text-secondary)" }}>Loading service...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div
        className="min-h-screen pt-14 pb-16"
        style={{ background: "var(--background)" }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Service not found
          </h1>
          <Link
            href="/services"
            className="text-sm"
            style={{ color: "var(--blue)" }}
          >
            ← Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const serviceImages = service.images?.length ? service.images : [];
  const selectedPlan = service.options?.find(
    (option) => option.id === selectedOption,
  );
  const businessStore = service.seller?.store;
  const hasBusinessInfo = Boolean(
    businessStore &&
      (businessStore.businessName ||
        businessStore.location ||
        businessStore.quarter ||
        businessStore.description ||
        businessStore.phone ||
        businessStore.whatsapp),
  );

  if (submitted) {
    return (
      <div
        className="min-h-screen pt-14 pb-16 flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center max-w-md px-4">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "var(--success-bg)" }}
          >
            <Check size={40} style={{ color: "var(--green)" }} />
          </div>
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Booking Confirmed!
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
            Your booking for {service.name} has been received. We'll contact you
            shortly to confirm the details.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, var(--purple), var(--blue))",
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-24 pb-16"
      style={{ background: "var(--background)" }}
    >
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

        {/* Top row: Image (left) + Info / Form (right) */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Image Gallery */}
          <div className="flex flex-col gap-3">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              {serviceImages.length > 0 ? (
                <img
                  src={serviceImages[activeImg]}
                  alt={service.name}
                  className="w-full h-72 sm:h-96 object-cover"
                />
              ) : (
                <div
                  className="w-full h-72 sm:h-96 flex items-center justify-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  No image available
                </div>
              )}
            </div>

            {serviceImages.length > 1 && (
              <div className="flex gap-3">
                {serviceImages.map((img, index) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImg(index)}
                    className="flex-1 overflow-hidden rounded-xl transition-all duration-200"
                    style={{
                      border:
                        activeImg === index
                          ? "2px solid var(--purple-light)"
                          : "2px solid transparent",
                    }}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info card (title, rating, description, availability, includes) OR booking form */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            {!selectedPlan ? (
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: "var(--badge-purple-bg)",
                      color: "var(--badge-purple-text)",
                    }}
                  >
                    {categories.find((c) => c.id === service.categoryId)
                      ?.name || "Service"}
                  </span>
                  {service.badge && (
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--scarlet), var(--purple))",
                      }}
                    >
                      {service.badge}
                    </span>
                  )}
                </div>

                <h1
                  className="text-3xl font-black mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {service.name}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Star
                      size={16}
                      fill="var(--yellow)"
                      style={{ color: "var(--yellow)" }}
                    />
                    <span
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {service.rating}
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ({service.reviews} reviews)
                  </span>
                </div>
                <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
                  {service.description}
                </p>

                {hasBusinessInfo && (
                  <div
                    className="rounded-xl p-4 mb-4"
                    style={{
                      background: "var(--glass-bg-subtle)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: "var(--glass-bg)" }}
                      >
                        <Store size={16} style={{ color: "var(--blue)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[10px] uppercase tracking-wider mb-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Service provider
                        </p>
                        <p
                          className="font-bold text-sm truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {businessStore?.businessName ||
                            service.seller?.name ||
                            "Business"}
                        </p>
                        {[
                          businessStore?.quarter,
                          businessStore?.location,
                        ].filter(Boolean).length > 0 && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {[
                              businessStore?.quarter,
                              businessStore?.location,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    {businessStore?.slug && (
                      <Link
                        href={`/stores/${businessStore.slug}`}
                        className="inline-flex items-center gap-1 mt-3 text-sm font-semibold"
                        style={{ color: "var(--blue)" }}
                      >
                        Visit services
                        <span aria-hidden="true">→</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* Availability */}
                {service.availability && (
                  <div
                    className="flex items-center gap-2 mb-4 p-3 rounded-xl"
                    style={{ background: "var(--glass-bg-subtle)" }}
                  >
                    <Clock size={18} style={{ color: "var(--blue)" }} />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {service.availability}
                    </span>
                  </div>
                )}

                {/* Includes */}
                {service.includes && service.includes.length > 0 && (
                  <div>
                    <h3
                      className="text-sm font-bold mb-3"
                      style={{ color: "var(--text-primary)" }}
                    >
                      What's Included:
                    </h3>
                    <div className="space-y-2">
                      {service.includes.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check
                            size={16}
                            className="mt-0.5"
                            style={{ color: "var(--green)" }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p
                      className="text-xs uppercase tracking-wider mb-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Selected plan
                    </p>
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {selectedPlan.name}
                    </h2>
                    <p
                      className="text-sm mt-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {convert(selectedPlan.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOption(null)}
                    className="text-sm font-semibold flex-shrink-0"
                    style={{ color: "var(--blue)" }}
                  >
                    Change plan
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
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
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
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
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
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
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
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
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
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

                  {hasBusinessInfo && (
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "var(--glass-bg-subtle)",
                        border: "1px solid var(--glass-border)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ background: "var(--glass-bg)" }}
                        >
                          <Store size={16} style={{ color: "var(--blue)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[10px] uppercase tracking-wider mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Service provider
                          </p>
                          <p
                            className="font-bold text-sm truncate"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {businessStore?.businessName ||
                              service.seller?.name ||
                              "Business"}
                          </p>
                          {[
                            businessStore?.quarter,
                            businessStore?.location,
                          ].filter(Boolean).length > 0 && (
                            <p
                              className="text-xs mt-1"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {[
                                businessStore?.quarter,
                                businessStore?.location,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      {businessStore?.slug && (
                        <Link
                          href={`/stores/${businessStore.slug}`}
                          className="inline-flex items-center gap-1 mt-3 text-sm font-semibold"
                          style={{ color: "var(--blue)" }}
                        >
                          Visit services
                          <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
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
                    <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
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
                      background:
                        "linear-gradient(135deg, var(--purple), var(--blue))",
                      boxShadow: "0 4px 14px rgba(123,47,190,0.35)",
                    }}
                  >
                    Confirm Booking
                  </button>

                  <p
                    className="text-xs text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    By booking, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Plans row: full width, below the image/info row */}
        {!selectedPlan && service.options && service.options.length > 0 && (
          <div
            className="rounded-2xl p-6 mt-8"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Choose Your Plan
            </h3>
            <div className="flex flex-wrap gap-4">
              {service.options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  className="flex-1 min-w-[240px] p-4 rounded-xl text-left cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    background: "var(--glass-bg-subtle)",
                    border: "2px solid var(--glass-border)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4
                        className="font-bold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {option.name}
                      </h4>
                      {option.popular && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                          style={{
                            background: "var(--info-bg)",
                            color: "var(--blue)",
                          }}
                        >
                          Popular
                        </span>
                      )}
                    </div>
                    <CheckCircle2
                      size={18}
                      className="opacity-50 flex-shrink-0"
                      style={{ color: "var(--blue)" }}
                    />
                  </div>
                  <p
                    className="text-xs mb-3 line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {option.description}
                  </p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className="text-lg font-black"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {convert(option.amount)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {option.pricingType === "MONTHLY" && "per month"}
                      {option.pricingType === "ONE_TIME" && option.label}
                      {option.pricingType === "PER_SESSION" && option.label}
                    </span>
                  </div>
                  {option.yearlyAmount && (
                    <p className="text-xs" style={{ color: "var(--green)" }}>
                      Save {convert(option.amount * 12 - option.yearlyAmount)}{" "}
                      yearly
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!selectedPlan &&
          (!service.options || service.options.length === 0) && (
            <div
              className="rounded-2xl p-6 mt-8"
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <h3
                className="text-xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Choose Your Plan
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No plans are available for this service yet.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
