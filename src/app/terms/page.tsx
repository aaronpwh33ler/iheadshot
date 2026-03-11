import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - iHeadshot",
  description: "iHeadshot Terms of Service. Review our terms and conditions for using our AI headshot service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>

            <p className="text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and iHeadshot ("Company," "we," "us," or "our") governing your access to and use of our website at iheadshot.co and our AI-powered professional headshot generation service (collectively, the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using iHeadshot, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. Your continued use of the Service following any changes constitutes your acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>

            <p className="text-gray-700 leading-relaxed">
              iHeadshot provides an AI-powered service that allows users to upload a photograph and receive professional headshots generated in multiple styles. The Service includes:
            </p>
            <ul className="space-y-3 text-gray-700 ml-4 mt-4">
              <li>Upload of one source photograph</li>
              <li>AI-generated professional headshots in multiple styles (20 available styles)</li>
              <li>High-resolution image output (HD and 4K options)</li>
              <li>Email delivery of generated images</li>
              <li>30-day access period to download your generated images</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              The exact number of generated headshots varies by package selected (5, 10, or 20 headshots per package).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Acceptable Use</h2>

            <p className="text-gray-700 leading-relaxed mb-4">You agree to use our Service only for lawful purposes and in a way that does not infringe upon the rights of others or restrict their use and enjoyment of the Service. You must not:</p>

            <ul className="space-y-3 text-gray-700 ml-4">
              <li>Upload photographs that you do not own or have the right to use</li>
              <li>Upload content that is illegal, obscene, defamatory, or violates applicable laws</li>
              <li>Upload photos containing minors without appropriate consent</li>
              <li>Use the Service for commercial purposes without authorization</li>
              <li>Attempt to reverse-engineer, disassemble, or hack our Service</li>
              <li>Violate intellectual property rights of third parties</li>
              <li>Use the Service to harass, harm, or threaten others</li>
              <li>Engage in any form of fraud or misrepresentation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Eligibility and Responsibility</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Age Requirement:</strong> You must be at least 18 years old to use our Service. By using iHeadshot, you represent and warrant that you are of legal age and have the authority to accept these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Account Identification:</strong> Our Service does not require account creation. Orders are identified by order ID and email address. You are responsible for maintaining the confidentiality of your email address and order information.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Photo Rights:</strong> You warrant that the photograph you upload is either your own or that you have all necessary rights, permissions, and consent to use and process it through our Service. This includes the right to use your likeness in the generated headshots for professional purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Pricing:</strong> Current pricing is as follows:
            </p>
            <ul className="space-y-2 text-gray-700 ml-4 mt-4">
              <li>Basic Package: $9.99 (5 headshots)</li>
              <li>Standard Package: $14.99 (10 headshots)</li>
              <li>Premium Package: $24.99 (20 headshots)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              <strong>One-Time Payment:</strong> The Service is available via one-time payment only. There are no subscriptions or recurring charges unless you initiate new orders.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Payment Processing:</strong> Payments are processed through Stripe. By making a purchase, you authorize Stripe to charge your payment method for the full purchase price. You agree to pay all applicable taxes and fees.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Price Changes:</strong> We reserve the right to change pricing at any time. Price changes will apply to new orders only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Your Content:</strong> You retain all ownership rights to the photograph you upload. By uploading and processing your photo through our Service, you grant us a limited license to use your photo solely for the purpose of generating headshots and providing the Service to you.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Generated Headshots:</strong> You own the generated headshot images we create for you. You may use these images freely for professional purposes, including LinkedIn, resumes, company websites, email signatures, and other professional applications.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Service Ownership:</strong> The iHeadshot Service, including our AI models, technology, design, and content (excluding the headshots we generate for you) remain our exclusive property. You may not reproduce, distribute, or create derivative works from our Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Limited License:</strong> We grant you a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Service Availability and Performance</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Processing Time:</strong> Generated headshots are typically delivered within minutes of processing. Processing times may vary based on demand and system load.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Quality:</strong> While we strive to produce high-quality results, the quality of generated headshots depends on the quality of the input photograph. We cannot guarantee satisfaction with all generated outputs.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Availability:</strong> We aim to maintain continuous Service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or due to unforeseen circumstances.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>AI Limitations:</strong> AI-generated images may occasionally contain artifacts or imperfections. While we work to minimize these issues, they are inherent to the technology.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitations of Liability</h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, in no event shall iHeadshot, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, lost revenue, or lost data, arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our total liability to you for any claim arising from or relating to these Terms or the Service shall not exceed the amount you paid for the Service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability. To the extent such exclusions do not apply, our liability is limited to the fullest extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>AS-IS BASIS:</strong> The Service is provided "as-is" and "as-available" without any warranties, representations, or conditions of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We do not warrant that the Service will meet your expectations, that the Service will be uninterrupted or error-free, or that any defects will be corrected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Refund Policy</h2>

            <p className="text-gray-700 leading-relaxed">
              We offer a <strong>100% money-back satisfaction guarantee</strong> for your purchase. If you are not satisfied with your generated headshots for any reason, you may request a full refund within 7 days of your purchase.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For refund requests and specific refund processing details, please see our <a href="/refund" className="text-brand-600 hover:text-brand-700 underline">Refund Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>

            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend access to our Service at any time without notice or liability if you violate these Terms or engage in unlawful or harmful conduct. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>

            <p className="text-gray-700 leading-relaxed">
              You agree to defend, indemnify, and hold harmless iHeadshot and its directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from or related to your use of the Service, your violation of these Terms, or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law and Jurisdiction</h2>

            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law principles. You agree to submit to the exclusive jurisdiction of the courts located in the United States for resolution of any disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Severability</h2>

            <p className="text-gray-700 leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be modified to the minimum extent necessary to make it enforceable, or if not possible, severed. The remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Entire Agreement</h2>

            <p className="text-gray-700 leading-relaxed">
              These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and iHeadshot regarding the Service and supersede all prior agreements, understandings, and communications, whether written or oral.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>

            <p className="text-gray-700 leading-relaxed">
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-brand-50 border border-brand-100 rounded-lg p-6 mt-4">
              <p className="text-gray-900"><strong>iHeadshot</strong></p>
              <p className="text-gray-700">Email: support@iheadshot.co</p>
              <p className="text-gray-700">Website: iheadshot.co</p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-6">
              We will respond to your inquiry within 30 days.
            </p>
          </section>

        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-12" />
    </div>
  );
}
