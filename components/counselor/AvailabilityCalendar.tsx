"use client";

import { useState } from "react";
import { Clock, Save, Check } from "lucide-react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

interface AvailabilitySlot {
  day: string;
  times: string[];
}

export default function AvailabilityCalendar({
  initialAvailability,
  onSave,
  saving,
}: {
  initialAvailability?: AvailabilitySlot[];
  onSave: (slots: AvailabilitySlot[]) => void;
  saving: boolean;
}) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    initialAvailability ||
      DAYS.map((day) => ({
        day,
        times: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      })),
  );

  const toggleSlot = (dayIndex: number, time: string) => {
    setAvailability((prev) =>
      prev.map((slot, i) => {
        if (i !== dayIndex) return slot;
        const times = slot.times.includes(time)
          ? slot.times.filter((t) => t !== time)
          : [...slot.times, time].sort();
        return { ...slot, times };
      }),
    );
  };

  const toggleDay = (dayIndex: number) => {
    setAvailability((prev) =>
      prev.map((slot, i) => {
        if (i !== dayIndex) return slot;
        const allSelected = TIME_SLOTS.every((t) => slot.times.includes(t));
        return { ...slot, times: allSelected ? [] : [...TIME_SLOTS] };
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3
            className="text-lg font-extrabold"
            style={{ color: "var(--text-primary)" }}
          >
            Set Your Availability
          </h3>
          <p
            className="text-sm font-light"
            style={{ color: "var(--text-muted)" }}
          >
            Click time slots to toggle availability
          </p>
        </div>
        <button
          onClick={() => onSave(availability)}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-70"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            boxShadow: "0 4px 16px rgba(123,47,190,0.4)",
          }}
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Schedule
            </>
          )}
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
        }}
      >
        {/* Header */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateColumns: "140px repeat(11, 1fr)",
            background: "var(--divider)",
          }}
        >
          <div
            className="p-3 flex items-center gap-2"
            style={{ background: "var(--glass-bg-strong)" }}
          >
            <Clock className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <span
              className="text-xs font-bold"
              style={{ color: "var(--text-muted)" }}
            >
              Day / Time
            </span>
          </div>
          {TIME_SLOTS.map((time) => (
            <div
              key={time}
              className="p-3 text-center"
              style={{ background: "var(--glass-bg-strong)" }}
            >
              <span
                className="text-[10px] font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                {time}
              </span>
            </div>
          ))}
        </div>

        {/* Rows */}
        {availability.map((slot, dayIndex) => (
          <div
            key={slot.day}
            className="grid gap-px"
            style={{
              gridTemplateColumns: "140px repeat(11, 1fr)",
              background: "var(--divider)",
            }}
          >
            <button
              onClick={() => toggleDay(dayIndex)}
              className="p-3 text-left transition-colors hover:opacity-80"
              style={{ background: "var(--glass-bg)" }}
            >
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {slot.day}
              </span>
              <span
                className="block text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                {slot.times.length} slots
              </span>
            </button>
            {TIME_SLOTS.map((time) => {
              const active = slot.times.includes(time);
              return (
                <button
                  key={time}
                  onClick={() => toggleSlot(dayIndex, time)}
                  className="p-3 flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, var(--purple), var(--blue))"
                      : "var(--glass-bg)",
                  }}
                >
                  {active && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
