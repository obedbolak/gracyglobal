"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function InitPlansPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const initializePlans = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(`✅ Success! Initialized ${data.plans.length} plans in database.`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 max-w-md w-full text-center"
      >
        <h1 
          className="text-2xl font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Initialize Plans
        </h1>
        
        <p 
          className="text-sm mb-6"
          style={{ color: "var(--text-muted)" }}
        >
          This will sync the plans from your data file to the database.
        </p>

        <button
          onClick={initializePlans}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, var(--purple), var(--blue))",
            boxShadow: "0 4px 16px rgba(123,47,190,0.3)",
          }}
        >
          {loading ? "Initializing..." : "Initialize Plans"}
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl text-sm"
            style={{
              background: result.includes("✅") ? "var(--success-bg)" : "var(--error-bg)",
              border: `1px solid ${result.includes("✅") ? "var(--success-border)" : "var(--error-border)"}`,
              color: result.includes("✅") ? "var(--success-text)" : "var(--error-text)",
            }}
          >
            {result}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}