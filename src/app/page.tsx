import Link from "next/link";

export default function HomePage() {
  return (
    <div className="font-sans antialiased text-gray-900 bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo/logo-white-on-orange.png" alt="iHeadshot logo" className="w-9 h-9 rounded-xl" />
              <span className="text-xl font-bold">iHeadshot</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">How it Works</a>
              <a href="#examples" className="text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">Our Styles</a>
              <a href="#pricing" className="text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-brand-600 text-sm font-medium transition-colors">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</a>
              <Link href="/pricing" className="bg-brand-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Professional headshots
                <span className="gradient-text"> powered by AI</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Upload a selfie, get stunning professional headshots in minutes. Perfect for LinkedIn, resumes, and team pages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/pricing" className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-700 transition-all hover:scale-105 shadow-lg shadow-brand-200">
                  Create Your Headshots
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a href="#examples" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-brand-200 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-brand-300 hover:bg-brand-50 transition-colors">
                  <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  See Styles
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No subscription required
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ready in minutes
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Powered by enterprise AI
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-brand-200/40 blob" />
              <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-brand-300/30 blob" style={{ animationDelay: "-4s" }} />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl card-hover">
                    <img src="/style-previews/hero/hero-executive-black.jpg" alt="Executive Black female headshot" className="w-full h-full object-cover" />
                  </div>
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg card-hover">
                    <img src="/style-previews/hero/hero-academic.jpg" alt="Academic Scholar male headshot" className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }} />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg card-hover">
                    <img src="/style-previews/hero/hero-creative-turtleneck.jpg" alt="Creative Turtleneck male headshot" className="w-full h-full object-cover" style={{ objectPosition: "center 20%" }} />
                  </div>
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl card-hover">
                    <img src="/style-previews/hero/hero-warm-studio.jpg" alt="Warm Studio female headshot" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4 border border-brand-100">
                <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Studio Quality</p>
                  <p className="text-sm text-gray-500">Without the studio price</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 orange-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Get your professional headshots in three easy steps. No photography experience needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 border border-brand-100 card-hover shadow-sm">
                <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute top-8 right-8 text-6xl font-bold text-brand-100">1</div>
                <h3 className="text-xl font-bold mb-3">Upload your photo</h3>
                <p className="text-gray-600">Take a clear selfie or upload an existing photo. Our AI works with any good quality image.</p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 border border-brand-100 card-hover shadow-sm">
                <div className="w-14 h-14 bg-brand-400 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div className="absolute top-8 right-8 text-6xl font-bold text-brand-100">2</div>
                <h3 className="text-xl font-bold mb-3">Choose your styles</h3>
                <p className="text-gray-600">Select from 20 professional styles including corporate, casual, creative, and outdoor looks.</p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 border border-brand-100 card-hover shadow-sm">
                <div className="w-14 h-14 bg-brand-300 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="absolute top-8 right-8 text-6xl font-bold text-brand-100">3</div>
                <h3 className="text-xl font-bold mb-3">Download {"&"} use</h3>
                <p className="text-gray-600">Get your headshots in minutes. Download in high resolution, ready for LinkedIn, resumes, and more.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Styles */}
      <section id="examples" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Our Styles</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">20 professional styles to choose from</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">From corporate to creative, outdoor to studio — find your perfect look.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { src: "/style-previews/female/executive-black.jpg", name: "Executive Black", category: "Corporate" },
              { src: "/style-previews/male/academic-scholar.jpg", name: "Academic Scholar", category: "Industry" },
              { src: "/style-previews/female/creative-turtleneck.jpg", name: "Creative Turtleneck", category: "Creative" },
              { src: "/style-previews/male/dark-dramatic.jpg", name: "Dark & Dramatic", category: "Artistic" },
              { src: "/style-previews/female/real-estate.jpg", name: "Real Estate Agent", category: "Industry" },
              { src: "/style-previews/male/classic-studio.jpg", name: "Classic Studio", category: "Studio" },
              { src: "/style-previews/female/outdoor-natural.jpg", name: "Natural Light", category: "Outdoor" },
              { src: "/style-previews/male/finance-exec.jpg", name: "Finance Executive", category: "Corporate" },
              { src: "/style-previews/female/warm-studio.jpg", name: "Warm Studio", category: "Studio" },
              { src: "/style-previews/male/smart-casual-sweater.jpg", name: "Smart Casual", category: "Casual" },
            ].map((style) => (
              <div key={style.name} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 card-hover">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img src={style.src} alt={`${style.name} style`} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-medium text-gray-900 text-sm">{style.name}</p>
                  <p className="text-xs text-emerald-600">{style.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Perfect For */}
          <div className="mt-16 pt-12 border-t border-gray-100">
            <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">Perfect for</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {[
                { icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "LinkedIn" },
                { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Real Estate" },
                { icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", label: "Corporate Teams" },
                { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "Resumes" },
                { icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", label: "Actors & Models" },
                { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Email Signatures" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing" className="inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200 hover:scale-105">
              Create Yours Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 orange-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Simple Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Choose your package</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">One-time payment. No subscriptions. Keep your photos forever.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-white rounded-3xl p-8 border-2 border-brand-100 card-hover shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Basic</h3>
                <p className="text-gray-500 text-sm mt-1">Perfect for getting started</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-gray-500">/one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["5 professional headshots", "All 20 style options", "HD resolution", "4K upscale option", "Instant download"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {i === 0 ? <><strong>5</strong>{"\u00A0"}professional headshots</> : feature}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full text-center bg-brand-50 text-brand-700 py-3 rounded-full font-semibold hover:bg-brand-100 transition-colors border border-brand-200">
                Get Started
              </Link>
            </div>
            {/* Standard */}
            <div className="bg-brand-600 rounded-3xl p-8 relative card-hover scale-105 shadow-xl shadow-brand-200">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-brand-400 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-md">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Standard</h3>
                <p className="text-brand-200 text-sm mt-1">Best value for professionals</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$14.99</span>
                <span className="text-brand-200">/one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["10 professional headshots", "All 20 style options", "HD resolution", "4K upscale option", "Instant download"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-brand-100">
                    <svg className="w-5 h-5 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {i === 0 ? <><strong>10</strong>{"\u00A0"}professional headshots</> : feature}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full text-center bg-white text-brand-700 py-3 rounded-full font-semibold hover:bg-brand-50 transition-colors">
                Get Started
              </Link>
            </div>
            {/* Premium */}
            <div className="bg-white rounded-3xl p-8 border-2 border-brand-100 card-hover shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                <p className="text-gray-500 text-sm mt-1">For maximum variety</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">$24.99</span>
                <span className="text-gray-500">/one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["20 professional headshots", "All 20 style options", "HD resolution", "4K upscale option", "Instant download"].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <svg className="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {i === 0 ? <><strong>20</strong>{"\u00A0"}professional headshots</> : feature}
                  </li>
                ))}
              </ul>
              <Link href="/pricing" className="block w-full text-center bg-brand-50 text-brand-700 py-3 rounded-full font-semibold hover:bg-brand-100 transition-colors border border-brand-200">
                Get Started
              </Link>
            </div>
          </div>
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 bg-white border border-brand-200 rounded-full px-6 py-3 shadow-sm">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium text-brand-800">100% Money-Back Guarantee — Not satisfied? Full refund, no questions.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why iHeadshot - Comparison */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Why iHeadshot</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Skip the studio. Keep the quality.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you'd get from a professional photographer — at a fraction of the cost and time.</p>
          </div>
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3">
              <div className="p-6 bg-gray-50 border-b border-r border-gray-200" />
              <div className="p-6 bg-brand-50 border-b border-r border-gray-200 text-center">
                <div className="flex items-center justify-center gap-2">
                  <img src="/logo/logo-white-on-orange.png" alt="iHeadshot" className="w-7 h-7 rounded-lg" />
                  <span className="font-bold text-brand-800">iHeadshot</span>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-b border-gray-200 text-center">
                <span className="font-bold text-gray-500">Photo Studio</span>
              </div>
              {[
                { label: "Price", us: "$9.99 – $24.99", them: "$150 – $450+", highlight: true },
                { label: "Turnaround", us: "Minutes", them: "1 – 2 weeks", highlight: false },
                { label: "Styles included", us: "Up to 20", them: "2 – 3 looks", highlight: false },
                { label: "Location", us: "Anywhere", them: "In-studio only", highlight: false },
                { label: "Retakes", us: "Unlimited styles", them: "Extra session fee", highlight: false },
              ].map((row, i, arr) => (
                <div key={row.label} className="contents">
                  <div className={`p-5 ${i < arr.length - 1 ? "border-b" : ""} border-r border-gray-100 font-medium text-gray-700`}>{row.label}</div>
                  <div className={`p-5 ${i < arr.length - 1 ? "border-b" : ""} border-r border-gray-100 text-center`}>
                    <span className={`text-brand-600 font-bold ${row.highlight ? "text-lg" : ""}`}>{row.us}</span>
                  </div>
                  <div className={`p-5 ${i < arr.length - 1 ? "border-b" : ""} border-gray-100 text-center`}>
                    <span className="text-gray-500">{row.them}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-10">
            <p className="text-gray-500 text-sm">Save up to 95% compared to traditional photography</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 orange-section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Common questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How long does it take to get my headshots?", a: "Most headshots are ready within minutes. Our AI processes your photos quickly while maintaining high quality. You'll receive an email with a download link as soon as they're done." },
              { q: "What kind of photo should I upload?", a: "Upload a clear, well-lit photo where your face is clearly visible. A simple selfie works great! Avoid heavy filters, sunglasses, or photos where your face is partially hidden." },
              { q: "Can I use these for LinkedIn and professional profiles?", a: "Absolutely! Our headshots are specifically designed for professional use. They're perfect for LinkedIn, company websites, resumes, email signatures, and any professional profile." },
              { q: "What if I'm not satisfied with the results?", a: "We offer a 100% money-back guarantee. If you're not happy with your headshots for any reason, contact us within 7 days for a full refund, no questions asked." },
              { q: "Is my photo data secure?", a: "Yes, your privacy is our priority. We use secure encryption for all uploads and processing. Your photos are automatically deleted from our servers after 30 days, and we never share your data with third parties." },
            ].map((faq) => (
              <details key={faq.q} className="group bg-white rounded-2xl border border-brand-100 shadow-sm">
                <summary className="flex items-center justify-between p-6 cursor-pointer">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <svg className="w-5 h-5 text-brand-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 dark-orange-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to upgrade your professional image?</h2>
          <p className="text-xl text-white/80 mb-10">Transform your online presence with AI-powered headshots.</p>
          <Link href="/pricing" className="inline-flex items-center gap-2 bg-white text-brand-700 px-10 py-5 rounded-full text-lg font-semibold hover:bg-brand-50 transition-all hover:scale-105 shadow-lg">
            Create Your Headshots Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-white/60 mt-6 text-sm">Starting at just $9.99 • No subscription required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo/logo-white-on-orange.png" alt="iHeadshot logo" className="w-9 h-9 rounded-xl" />
                <span className="text-xl font-bold">iHeadshot</span>
              </div>
              <p className="text-gray-500 text-sm">Professional AI headshots in minutes. No studio, no hassle.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#how-it-works" className="hover:text-brand-600 transition-colors">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a></li>
                <li><a href="#examples" className="hover:text-brand-600 transition-colors">Our Styles</a></li>
                <li><a href="#faq" className="hover:text-brand-600 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-brand-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-brand-100 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">© 2026 iHeadshot. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
