import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Sparkles,
  Download,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Professional Photos
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Headshots
              <br />
              <span className="text-blue-600">in Seconds</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              No photographer. No studio. Just upload a selfie and let AI create
              stunning professional headshots for LinkedIn, resumes, and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="xl">
                <Link href="/pricing">
                  Get Your Headshots — $4.99
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Join 10,000+ professionals who upgraded their LinkedIn
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">4.9/5</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-gray-300" />
            <p className="text-gray-600">
              <span className="font-semibold">50,000+</span> headshots generated
            </p>
            <div className="hidden sm:block h-8 w-px bg-gray-300" />
            <p className="text-gray-600">
              Trusted by professionals at top companies
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get professional headshots in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-blue-600 mb-2">
                  Step 1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Upload Your Photos
                </h3>
                <p className="text-gray-600">
                  Upload 10-15 casual photos of yourself. Include different
                  angles, lighting, and expressions.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-sm font-semibold text-purple-600 mb-2">
                  Step 2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  AI Learns Your Features
                </h3>
                <p className="text-gray-600">
                  Our AI studies your unique features and creates a personalized
                  model just for you.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Download className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-green-600 mb-2">
                  Step 3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Download Your Headshots
                </h3>
                <p className="text-gray-600">
                  Get 40+ professional headshots in various styles. Download
                  your favorites and use anywhere.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Save Time and Money
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional quality at a fraction of the cost
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 bg-gray-100 border-gray-200">
              <h3 className="text-xl font-bold text-gray-500 mb-6">
                Traditional Photographer
              </h3>
              <ul className="space-y-4 text-gray-500">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <span>$150 - $500 per session</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <span>Schedule weeks in advance</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🚗</span>
                  <span>Travel to studio</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📸</span>
                  <span>5-10 final photos</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <span>Wait 1-2 weeks for edits</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-2 border-blue-600 bg-white">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-xl font-bold text-gray-900">iHeadshot</h3>
                <Badge className="bg-blue-600">Recommended</Badge>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-gray-900 font-medium">
                    Just $29 - $59 one-time
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-gray-900 font-medium">
                    Start immediately
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-gray-900 font-medium">
                    Upload from anywhere
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-gray-900 font-medium">
                    40-120 professional photos
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-gray-900 font-medium">
                    Ready in 30 minutes
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How many photos do I need to upload?
              </h3>
              <p className="text-gray-600">
                We recommend uploading 10-15 photos for best results. Include
                variety: different angles, lighting conditions, and expressions.
                This helps our AI learn your unique features accurately.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long does it take?
              </h3>
              <p className="text-gray-600">
                About 30 minutes from upload to receiving your headshots. The AI
                training takes 10-15 minutes, then generation takes another
                10-15 minutes. You'll receive an email when they're ready.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I use these for LinkedIn?
              </h3>
              <p className="text-gray-600">
                Absolutely! Our headshots are specifically designed for
                professional profiles like LinkedIn, company websites, resumes,
                and business cards. They look natural and professional.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What if I'm not happy with the results?
              </h3>
              <p className="text-gray-600">
                We offer a satisfaction guarantee. If you're not happy with your
                headshots, contact us and we'll either regenerate them with
                different styles or provide a full refund.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are my photos secure?
              </h3>
              <p className="text-gray-600">
                Yes. Your photos are encrypted and stored securely. They're used
                only to generate your headshots and are automatically deleted
                after 30 days. We never share your data with third parties.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready for Your Professional Headshots?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who upgraded their online presence
            with AI-generated headshots.
          </p>
          <Button
            asChild
            size="xl"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            <Link href="/pricing">Get Started — $29</Link>
          </Button>
          <p className="mt-4 text-blue-200 text-sm">
            No subscription required. One-time payment.
          </p>
        </div>
      </section>
    </div>
  );
}
