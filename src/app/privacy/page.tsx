import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - iHeadshot",
  description: "iHeadshot Privacy Policy. Learn how we protect your data and photos.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              iHeadshot ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process your information, including personal data, in connection with our website at iheadshot.co (the "Website") and our AI-powered professional headshot generation service (the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed">
              Please read this Privacy Policy carefully. By accessing or using iHeadshot, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.1 Information You Provide to Us</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Upload Photos:</strong> When you use our Service, you voluntarily upload a photograph (typically a selfie) to our servers. This photo is used exclusively to generate your professional headshots using our AI technology.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Email Address:</strong> We collect your email address when you make a purchase or request services. This is used for order confirmations, delivery of your generated headshots, and customer support purposes.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Payment Information:</strong> Payment information (such as credit card details) is collected and processed by Stripe, our third-party payment processor. We do not store your full credit card information on our servers. We only receive order confirmation details.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Order Information:</strong> We collect information related to your purchase, including order ID, package selected, transaction timestamp, and processing status.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.2 Information Automatically Collected</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Usage Data:</strong> We automatically collect certain information about how you interact with our Website and Service, including IP address, browser type, device information, pages visited, time spent, and referring URL.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Cookies and Tracking:</strong> We use cookies and similar tracking technologies to enhance your experience and analyze usage patterns. This includes both session-based and persistent cookies.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Analytics:</strong> We use Vercel Analytics to understand how users interact with our Website and to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>

            <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect for the following purposes:</p>

            <ul className="space-y-3 text-gray-700 ml-4">
              <li><strong>Service Delivery:</strong> To process your order, generate your professional headshots, and deliver them to you via email.</li>
              <li><strong>Communication:</strong> To send you order confirmations, delivery notifications, customer support responses, and updates about our Service.</li>
              <li><strong>Payment Processing:</strong> To process payments and prevent fraudulent transactions.</li>
              <li><strong>Improvement:</strong> To analyze usage patterns, improve our Website and Service, and develop new features.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.</li>
              <li><strong>Customer Support:</strong> To respond to your inquiries and provide technical assistance.</li>
              <li><strong>Analytics:</strong> To understand user behavior and optimize our platform's performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Storage and Retention</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Photo Storage:</strong> When you upload a photo for processing, it is securely stored in Supabase storage. Your uploaded photo and the AI-generated headshots are retained for <strong>30 days</strong> from the date of upload. After 30 days, all photos are automatically and permanently deleted from our servers.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Email and Order Data:</strong> We retain your email address and order information for customer service, refund processing, and legal compliance purposes. You can request deletion of this data by contacting us at support@iheadshot.co, except where required by law.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Download Window:</strong> You have full access to download your generated headshots during the 30-day retention period. We recommend downloading your photos promptly to ensure you have permanent copies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>

            <p className="text-gray-700 leading-relaxed mb-4">Our Service relies on third-party providers that may access your information:</p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.1 Stripe</h3>
            <p className="text-gray-700 leading-relaxed">
              We use Stripe for payment processing. Stripe handles your payment card information in compliance with PCI Data Security Standards. Your full credit card details are not stored on our servers. For more information, see Stripe's Privacy Policy at stripe.com/privacy.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.2 Supabase</h3>
            <p className="text-gray-700 leading-relaxed">
              We use Supabase for secure storage of your uploaded photos and generated headshots. Supabase employs industry-standard security measures and encryption. Your photos are stored only for the 30-day retention period as described above.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.3 Google Gemini AI</h3>
            <p className="text-gray-700 leading-relaxed">
              Your uploaded photo is processed by Google Gemini AI to generate professional headshots. Google Gemini's use of your data is governed by Google's Privacy Policy. The photo is used solely for generating your headshots and is not retained by Google beyond the processing period.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.4 Resend</h3>
            <p className="text-gray-700 leading-relaxed">
              We use Resend to send order confirmation and headshot delivery emails. Your email address is shared with Resend for the purpose of sending these communications.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">4.5 Vercel Analytics</h3>
            <p className="text-gray-700 leading-relaxed">
              We use Vercel Analytics to analyze Website usage patterns and performance. This service collects anonymized usage data.
            </p>

            <p className="text-gray-700 leading-relaxed mt-6">
              We do not sell, rent, or share your personal information with third parties except as necessary to provide our Service or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>

            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="space-y-3 text-gray-700 ml-4 mt-4">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Secure storage in Supabase with encryption at rest</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Regular security assessments</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security. You use our Service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>

            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="space-y-3 text-gray-700 ml-4 mt-4">
              <li>Remember your preferences</li>
              <li>Understand how you use our Website</li>
              <li>Provide analytics and improve our services</li>
              <li>Enable secure authentication</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              You can control cookie settings through your browser. However, disabling cookies may affect the functionality of our Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>

            <p className="text-gray-700 leading-relaxed mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.1 Access</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to request access to the personal information we hold about you.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.2 Deletion</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to request deletion of your personal information, subject to certain legal exceptions.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">7.3 Correction</h3>
            <p className="text-gray-700 leading-relaxed">
              You have the right to request correction of inaccurate personal information.
            </p>

            <p className="text-gray-700 leading-relaxed mt-6">
              To exercise any of these rights, please contact us at support@iheadshot.co with your request and verification information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>

            <p className="text-gray-700 leading-relaxed">
              Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will promptly delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Privacy Policy</h2>

            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of significant changes by updating the "Last updated" date and, where appropriate, by email or other notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>

            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy, our privacy practices, or wish to exercise your rights, please contact us at:
            </p>
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-6 mt-4">
              <p className="text-gray-900"><strong>iHeadshot</strong></p>
              <p className="text-gray-700">Email: support@iheadshot.co</p>
              <p className="text-gray-700">Website: iheadshot.co</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-6">
              We will respond to your request within 30 days or as required by applicable law.
            </p>
          </section>

        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-12" />
    </div>
  );
}
