import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - iHeadshot",
  description: "iHeadshot Refund Policy. Learn about our 100% satisfaction guarantee and how to request a refund.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-gray-600">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none space-y-8">

          <section>
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg mb-8">
              <p className="text-green-900 font-semibold text-lg">100% Money-Back Guarantee</p>
              <p className="text-green-800 mt-2">
                We're confident in the quality of our AI-generated headshots. If you're not completely satisfied with your results for any reason, we'll refund your full purchase price with no questions asked.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>

            <p className="text-gray-700 leading-relaxed">
              At iHeadshot, we believe in customer satisfaction above all else. Our AI-powered headshot generation service produces professional-quality results that work well for LinkedIn profiles, resumes, team pages, and other professional applications. However, if for any reason you are not satisfied with your generated headshots, we will refund your entire purchase price.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This refund policy is backed by our absolute confidence in our service and our commitment to making sure you're happy with your investment in professional imagery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Refund Eligibility</h2>

            <p className="text-gray-700 leading-relaxed mb-4">You are eligible for a refund if:</p>

            <ul className="space-y-3 text-gray-700 ml-4">
              <li>You are not satisfied with the quality of your generated headshots</li>
              <li>You feel the headshots do not meet your professional expectations</li>
              <li>You are unsatisfied with the AI-generated results for any reason</li>
              <li>You have not used or shared the headshots commercially</li>
              <li>You have not downloaded or used the images commercially for third-party gain</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-6 mb-4">
              <strong>Refunds are applicable only to the original purchaser and the original order.</strong> We process refunds based on:
            </p>

            <ul className="space-y-3 text-gray-700 ml-4">
              <li>Order ID verification</li>
              <li>Email address associated with the purchase</li>
              <li>Payment method used for the original transaction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Window</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Refund requests must be submitted within 7 days of your purchase.</strong>
            </p>
            <p className="text-gray-700 leading-relaxed">
              We count from the date of your original transaction. After 7 days, we cannot process refund requests, though we may consider exceptions on a case-by-case basis if you reach out to us within 14 days with extenuating circumstances.
            </p>
            <p className="text-gray-700 leading-relaxed">
              It is important to evaluate your headshots and initiate a refund request promptly if you are dissatisfied. While you have 30 days to download your images, we ask that refund requests be made within the first 7 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How to Request a Refund</h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              To request a refund, please contact our customer support team with the following information:
            </p>

            <ol className="space-y-3 text-gray-700 ml-4 list-decimal">
              <li><strong>Order ID:</strong> Your unique order identifier (found in your order confirmation email)</li>
              <li><strong>Email Address:</strong> The email address associated with your purchase</li>
              <li><strong>Reason for Refund:</strong> A brief explanation of why you are requesting a refund (optional, but helpful)</li>
            </ol>

            <p className="text-gray-700 leading-relaxed mt-6 mb-4">
              Email your refund request to:
            </p>

            <div className="bg-brand-50 border border-brand-100 rounded-lg p-6">
              <p className="text-gray-900 font-semibold text-lg">support@iheadshot.co</p>
              <p className="text-gray-700 text-sm mt-2">Subject: Refund Request - [Your Order ID]</p>
            </div>

            <p className="text-gray-700 leading-relaxed mt-6">
              Please include your Order ID in the subject line to help us process your request more quickly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Refund Processing</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Processing Time:</strong> Once we receive your refund request, we will process it within 5-7 business days.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Refund Method:</strong> Refunds are issued to the original payment method used for your purchase. If you paid by credit card, the refund will be credited back to that card. Please note that it may take an additional 3-5 business days for the refund to appear in your account, depending on your bank or credit card company.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Full Refund:</strong> We will refund the complete amount you paid, including the full package price. There are no deductions or refund fees.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Confirmation:</strong> You will receive an email confirmation once your refund has been processed. This email will include your refund amount and the expected timeline for the funds to appear in your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Conditions and Exclusions</h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              While we process refunds generously and without extensive questioning, the following conditions apply:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.1 Refund Eligibility Conditions</h3>
            <p className="text-gray-700 leading-relaxed">
              Refunds are intended for genuine dissatisfaction with service quality. We will process refunds for customers who are unhappy with their results. However, we reserve the right to deny refunds in cases of:
            </p>
            <ul className="space-y-3 text-gray-700 ml-4 mt-4">
              <li>Fraudulent or suspicious payment activity</li>
              <li>Multiple refund requests for the same order</li>
              <li>Attempts to circumvent our terms of service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.2 Commercial Use Restrictions</h3>
            <p className="text-gray-700 leading-relaxed">
              If you have commercially distributed, sold, or used the headshots for business purposes outside of your own professional profiles (such as LinkedIn, resumes, or company websites), we may not be able to process a refund. The refund policy is designed for personal professional use.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">5.3 Multiple Requests</h3>
            <p className="text-gray-700 leading-relaxed">
              We can only process one refund per order. If you have submitted multiple refund requests for the same order, we will process the first valid request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Deletion Upon Refund</h2>

            <p className="text-gray-700 leading-relaxed">
              Upon approval of your refund request, we will:
            </p>
            <ul className="space-y-3 text-gray-700 ml-4 mt-4">
              <li>Process your refund to the original payment method</li>
              <li>Delete your uploaded source photo from our servers (if not already deleted)</li>
              <li>Delete your generated headshots from our servers (if not already deleted)</li>
              <li>Retain only your email and order information for refund processing and legal compliance</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Note: Photos are automatically deleted 30 days after upload regardless of refund status. A refund does not delay this automatic deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. What Happens to Your Headshots After Refund</h2>

            <p className="text-gray-700 leading-relaxed">
              After you receive a refund, your access to download the generated headshots will be revoked. However, if you have already downloaded the images before requesting a refund, those downloaded files remain yours to keep and use.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We ask that you use your own judgment in how you use headshots for which you received a refund. The refund is intended to compensate for dissatisfaction, not to provide free images for commercial use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Non-Refundable Services</h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              The following are not subject to refund:
            </p>

            <ul className="space-y-3 text-gray-700 ml-4">
              <li>Refund processing fees (if any are charged by your bank)</li>
              <li>Fees charged by third-party payment processors</li>
              <li>Taxes paid on the purchase (in some jurisdictions)</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-4">
              You are responsible for any fees your bank or payment processor may charge for processing the refund back to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Right to Improve Results</h2>

            <p className="text-gray-700 leading-relaxed">
              Before requesting a refund, we encourage you to try different approaches to achieve the best results:
            </p>
            <ul className="space-y-3 text-gray-700 ml-4 mt-4">
              <li>Use a higher-quality source photo if possible</li>
              <li>Ensure good lighting and clear facial visibility in your upload</li>
              <li>Try different style selections to find the best fit</li>
              <li>Consider that professional photos often require multiple attempts</li>
            </ul>

            <p className="text-gray-700 leading-relaxed mt-6">
              However, we understand that not every result will meet every customer's needs, and that's why we offer the refund guarantee without hassle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Special Circumstances</h2>

            <p className="text-gray-700 leading-relaxed">
              <strong>Damaged or Corrupted Files:</strong> If your generated headshots were damaged, corrupted, or could not be downloaded due to a technical issue on our end, please contact us. We will either regenerate your headshots or process a refund at your request.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Service Failure:</strong> If our Service failed to process your order or generate headshots due to a technical issue, we will either reprocess your order for free or issue a full refund.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Billing Errors:</strong> If you were charged incorrectly or multiple times for a single order, please contact us immediately. We will investigate and issue appropriate refunds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Customer Support</h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about your refund, the refund process, or need assistance with your order, please don't hesitate to contact us:
            </p>

            <div className="bg-brand-50 border border-brand-100 rounded-lg p-6">
              <p className="text-gray-900"><strong>iHeadshot Customer Support</strong></p>
              <p className="text-gray-700">Email: support@iheadshot.co</p>
              <p className="text-gray-700">Website: iheadshot.co</p>
              <p className="text-gray-700 text-sm mt-4">Response time: Within 24 business hours</p>
            </div>

            <p className="text-gray-700 leading-relaxed mt-6">
              Our support team is here to help ensure you have the best experience possible. If you have any concerns about your purchase or generated headshots, we encourage you to reach out before requesting a refund. We may be able to help resolve your concerns or provide guidance to improve your results.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Refund Policy</h2>

            <p className="text-gray-700 leading-relaxed">
              We may update this Refund Policy from time to time. If we make significant changes, we will notify you by email or by updating the "Last updated" date on this page. Your continued use of our Service following any changes indicates your acceptance of the updated Refund Policy.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Refunds requested before any policy changes will be processed according to the terms in effect at the time of purchase.
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Need Help?</h3>
            <p className="text-blue-800 mb-4">
              We're here to ensure you're completely satisfied with your iHeadshot experience. If you have any questions about this Refund Policy or about your purchase, please reach out to our support team at support@iheadshot.co.
            </p>
            <p className="text-blue-800">
              We respond to all inquiries within 24 business hours and are committed to resolving any concerns quickly and fairly.
            </p>
          </section>

        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-12" />
    </div>
  );
}
