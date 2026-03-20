"use client";

import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
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
            <Cookie className="w-4 h-4" style={{ color: "var(--blue)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--blue)" }}>
              Cookie Policy
            </span>
          </div>
          <h1 
            className="text-4xl sm:text-5xl font-extrabold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Cookie Policy
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
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>1. What Are Cookies?</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>2. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>2.1 Essential Cookies</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>2.2 Performance Cookies</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              These cookies collect information about how you use our website, such as which pages you visit most often. This data helps us improve the performance and user experience of our platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>2.3 Functional Cookies</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              These cookies allow our website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>2.4 Targeting/Advertising Cookies</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              These cookies are used to deliver advertisements that are relevant to you and your interests. They also help us measure the effectiveness of advertising campaigns.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>3. Third-Party Cookies</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              We may use third-party services that set cookies on your device, including:
            </p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li><strong>Google Analytics:</strong> To analyze website traffic and usage patterns</li>
              <li><strong>Payment Processors:</strong> To facilitate secure transactions</li>
              <li><strong>Social Media Platforms:</strong> To enable social sharing features</li>
              <li><strong>Advertising Networks:</strong> To deliver targeted advertisements</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>4. How We Use Cookies</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>We use cookies to:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our platform</li>
              <li>Improve our services and user experience</li>
              <li>Provide personalized content and recommendations</li>
              <li>Measure the effectiveness of our marketing campaigns</li>
              <li>Detect and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>5. Managing Cookies</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>5.1 Browser Settings</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. However, blocking or deleting cookies may impact your ability to use certain features of our platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>5.2 Cookie Preferences</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              You can manage your cookie preferences through our cookie consent banner when you first visit our website. You can update your preferences at any time through your account settings.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6" style={{ color: "var(--text-primary)" }}>5.3 Opt-Out Links</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
              To opt-out of third-party cookies, you can visit:
            </p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li>Google Analytics: <a href="https://tools.google.com/dlpage/gaoptout" style={{ color: "var(--blue)" }}>https://tools.google.com/dlpage/gaoptout</a></li>
              <li>Network Advertising Initiative: <a href="http://www.networkadvertising.org/choices/" style={{ color: "var(--blue)" }}>http://www.networkadvertising.org/choices/</a></li>
              <li>Digital Advertising Alliance: <a href="http://www.aboutads.info/choices/" style={{ color: "var(--blue)" }}>http://www.aboutads.info/choices/</a></li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>6. Cookie Duration</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>Cookies may be either:</p>
            <ul style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
              <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period or until you delete them</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>7. Do Not Track Signals</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Some browsers include a "Do Not Track" (DNT) feature. Currently, there is no industry standard for how to respond to DNT signals. We do not currently respond to DNT signals.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>8. Updates to This Policy</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>9. More Information</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              For more information about how we handle your personal data, please see our Privacy Policy. If you have questions about our use of cookies, please contact us.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8" style={{ color: "var(--text-primary)" }}>10. Contact Us</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              If you have questions about this Cookie Policy, contact us at:
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
