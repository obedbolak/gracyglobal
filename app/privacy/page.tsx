"use client";

import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-24" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "var(--badge-blue-bg)",
              border: "1px solid var(--divider-strong)",
            }}
          >
            <Shield className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--blue)" }}>
              Privacy Policy
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-extrabold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Privacy Policy
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div 
          className="prose prose-lg max-w-none p-8 rounded-2xl"
          style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}
        >
          <div style={{ color: "var(--text-primary)" }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>1. Introduction</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              GracyGlobal ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>2.1 Personal Information</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>We may collect personal information that you provide directly to us, including:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Name, email address, and contact information</li>
              <li>Account credentials and profile information</li>
              <li>Payment and billing information</li>
              <li>Communication preferences</li>
              <li>Information provided during counseling sessions (stored securely and confidentially)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>2.2 Automatically Collected Information</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>When you access our platform, we automatically collect:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Device information and IP address</li>
              <li>Browser type and operating system</li>
              <li>Usage data and analytics</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>3. How We Use Your Information</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>We use your information to:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Provide and maintain our services</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative information and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Improve and personalize your experience</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>4. Information Sharing and Disclosure</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>We may share your information with:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf</li>
              <li><strong>Counselors:</strong> When you book counseling sessions (with your consent)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              We do not sell your personal information to third parties.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>5. Data Security</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>6. Your Rights and Choices</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>You have the right to:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Access and receive a copy of your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Withdraw consent at any time</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>7. Cookies and Tracking Technologies</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              We use cookies and similar technologies to enhance your experience. You can control cookies through your browser settings. For more information, see our Cookie Policy.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>8. Children's Privacy</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>9. International Data Transfers</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>10. Changes to This Privacy Policy</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>11. Contact Us</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <ul style={{ color: "var(--text-secondary)", listStyle: "none", paddingLeft: "0" }}>
              <li>Email: privacy@gracyglobal.com</li>
              <li>Address: GracyGlobal, Cameroon</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
