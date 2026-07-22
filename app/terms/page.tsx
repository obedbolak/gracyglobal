"use client";

import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen py-24" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: "var(--badge-purple-bg)",
              border: "1px solid var(--divider-strong)",
            }}
          >
            <FileText className="w-4 h-4" style={{ color: "var(--purple)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--purple)" }}>
              Terms & Conditions
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-extrabold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Terms and Conditions
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
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>1. Acceptance of Terms</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              By accessing and using GracyGlobal's platform and services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>2. Description of Services</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>GracyGlobal provides:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Professional counseling and mental health services</li>
              <li>Job listings and opportunities</li>
              <li>Community development programs</li>
              <li>E-commerce marketplace for wellness and beauty products</li>
              <li>E-learning courses and educational content</li>
              <li>Professional home and lifestyle services</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>3. User Accounts</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>3.1 Registration</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              You must create an account to access certain features. You agree to provide accurate, current, and complete information and to update it as necessary.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>3.2 Account Security</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>4. User Conduct</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>You agree not to:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit harmful or malicious code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with the platform's operation</li>
              <li>Use automated systems to access the platform</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>5. Counseling Services</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>5.1 Professional Relationship</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Counseling services are provided by licensed professionals. The counselor-client relationship is confidential and subject to professional ethics and applicable laws.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>5.2 Emergency Situations</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Our platform is not designed for emergency situations. If you are experiencing a mental health emergency, please contact local emergency services immediately.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>6. Payments and Fees</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>6.1 Pricing</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Prices for services and products are displayed in XAF (Central African Franc) and may be converted to your preferred currency. All prices are subject to change without notice.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>6.2 Payment Processing</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Payments are processed through secure third-party payment processors. You agree to pay all fees and charges incurred through your account.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>6.3 Refunds</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Refund policies vary by service type. Please refer to the specific service terms or contact support for refund requests.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>7. Intellectual Property</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              All content on the platform, including text, graphics, logos, and software, is the property of GracyGlobal or its licensors and is protected by intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>8. Third-Party Links and Services</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Our platform may contain links to third-party websites or services. We are not responsible for the content, privacy policies, or practices of third-party sites.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>9. Disclaimer of Warranties</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              THE PLATFORM AND SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>10. Limitation of Liability</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, GRACYGLOBAL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>11. Indemnification</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              You agree to indemnify and hold harmless GracyGlobal from any claims, damages, or expenses arising from your use of the platform or violation of these terms.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>12. Termination</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our discretion.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>13. Governing Law</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              These terms shall be governed by and construed in accordance with the laws of Cameroon, without regard to conflict of law principles.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>14. Changes to Terms</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>15. Contact Information</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              For questions about these Terms and Conditions, contact us at:
            </p>
            <ul style={{ color: "var(--text-secondary)", listStyle: "none", paddingLeft: "0" }}>
              <li>Email: legal@gracyglobal.com</li>
              <li>Address: GracyGlobal, Cameroon</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
