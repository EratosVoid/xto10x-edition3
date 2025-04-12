"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useEffect } from "react";

const features = [
  {
    title: "Community Events",
    description:
      "Create and join events in your neighborhood to connect with others.",
    icon: "🗓️",
  },
  {
    title: "Local Polls",
    description: "Voice your opinion on issues that matter to your community.",
    icon: "📊",
  },
  {
    title: "Petitions",
    description: "Start petitions to drive change in your area.",
    icon: "📝",
  },
  {
    title: "Discussions",
    description: "Engage in meaningful conversations with your neighbors.",
    icon: "💬",
  },
  {
    title: "Neighborhood Initiatives",
    description: "Collaborate on projects to improve your locality.",
    icon: "🏘️",
  },
  {
    title: "AI-Powered Insights",
    description:
      "Get content summarization, community analysis, and personalized news updates through our intelligent assistant.",
    icon: "✨",
  },
];

const testimonials = [
  {
    quote:
      "LocalVoice helped us organize a successful park cleanup that brought our community together.",
    author: "Sarah Johnson",
    role: "Community Organizer",
  },
  {
    quote:
      "Through the platform, we were able to start a petition that led to better street lighting in our neighborhood.",
    author: "Michael Chen",
    role: "Resident",
  },
  {
    quote:
      "The discussions feature has created a space for thoughtful dialogue about local issues that matter to us.",
    author: "Priya Patel",
    role: "Local Business Owner",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      {/* hide if logged in */}
      {!isAuthenticated && (
        <nav
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-md py-4" : "bg-transparent py-6"}`}
        >
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                LV
              </div>
              <span
                className={`font-bold text-xl ${scrolled ? "text-foreground" : "text-white"}`}
              >
                LocalVoice
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-8">
                <a
                  href="#features"
                  className={`font-medium hover:text-primary transition ${scrolled ? "text-foreground" : "text-white"}`}
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  className={`font-medium hover:text-primary transition ${scrolled ? "text-foreground" : "text-white"}`}
                >
                  Testimonials
                </a>
                <a
                  href="#about"
                  className={`font-medium hover:text-primary transition ${scrolled ? "text-foreground" : "text-white"}`}
                >
                  About
                </a>
              </div>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className={`px-5 py-2 rounded-lg font-medium transition-all ${
                    scrolled
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-white text-primary hover:bg-white/90"
                  }`}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className={`px-5 py-2 rounded-lg font-medium transition-all ${
                      scrolled
                        ? "text-foreground hover:bg-gray-100"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className={`px-5 py-2 rounded-lg font-medium transition-all ${
                      scrolled
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-white text-primary hover:bg-white/90"
                    }`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen bg-gradient-to-br from-primary/90 via-primary to-purple-700 py-[10vh] md:pt-[28vh] md:pb-[40vh]">
        <div className="relative container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-yellow-300 rounded-full"></div>
              <span className="text-yellow-300 font-medium">
                Community Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Welcome to <span className="text-yellow-300">LocalVoice</span>
            </h1>
            <h2 className="text-xl md:text-2xl mt-4 opacity-90">
              Building stronger communities together
            </h2>
            <p className="mt-6 text-lg opacity-80 max-w-lg">
              Join your neighbors in making your community a better place.
              Connect, collaborate, and create positive change where you live.
            </p>
            <div className="flex gap-4 mt-10">
              {isAuthenticated ? (
                <>
                  <Link
                    className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition shadow-lg"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                  <Link
                    className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                    href="/posts"
                  >
                    Browse Posts
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition shadow-lg"
                    href="/register"
                  >
                    Get Started
                  </Link>
                  <Link
                    className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                    href="/login"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex md:w-1/2 mt-16 md:mt-0 justify-center">
            <div className="relative w-full max-w-md h-80 md:h-96">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-300 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-300 rounded-full opacity-70 animate-pulse"></div>
              <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-pink-300 rounded-full opacity-50 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 relative mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">12K+</p>
              <p className="text-sm text-white/80 mt-1">Community Members</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">240+</p>
              <p className="text-sm text-white/80 mt-1">Local Events</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">85+</p>
              <p className="text-sm text-white/80 mt-1">Neighborhoods</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">9.8k</p>
              <p className="text-sm text-white/80 mt-1">Monthly Posts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-gradient-to-b from-background to-gray-50 dark:to-gray-900/20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              Our Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              What We Offer
            </h2>
            <div className="mt-4 h-1 w-24 bg-primary mx-auto rounded-full"></div>
            <p className="mt-6 text-default-600 max-w-2xl mx-auto text-lg">
              Everything you need to engage with your local community and make a
              difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 group hover:border-primary dark:hover:border-primary hover:translate-y-[-5px]"
              >
                <div className="text-5xl mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-default-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 bg-gray-50 dark:bg-gray-900/30"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">
              Success Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              What Our Users Say
            </h2>
            <div className="mt-4 h-1 w-24 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md relative hover:shadow-lg transition-shadow"
              >
                <div className="absolute -top-5 left-8 text-primary text-5xl">
                  &quot;
                </div>
                <p className="mt-6 mb-8 text-default-600 italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-default-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <div className="relative">
                <div className="w-full h-80 bg-primary/10 rounded-2xl"></div>
                <div className="absolute -top-6 -right-6 w-64 h-64 border-4 border-primary rounded-2xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🏙️</div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">
                About Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">
                Our Mission
              </h2>
              <div className="mt-4 h-1 w-20 bg-primary rounded-full"></div>
              <p className="mt-6 text-default-600">
                LocalVoice was founded on the belief that strong communities are
                built on effective communication, shared goals, and collective
                action. Our platform provides the digital infrastructure for
                local residents to connect, share ideas, organize events, and
                tackle community challenges together.
              </p>
              <p className="mt-4 text-default-600">
                Whether you&apos;re looking to organize a neighborhood cleanup,
                survey opinions on a local issue, or simply connect with
                like-minded individuals in your area, LocalVoice provides the
                tools you need to make a difference.
              </p>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition shadow-lg"
                >
                  Join Our Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to join your community?
          </h2>
          <p className="max-w-2xl mx-auto mb-10 text-white/80">
            Start making a difference in your neighborhood today. Sign up for
            LocalVoice and connect with like-minded individuals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition shadow-lg"
            >
              {isAuthenticated ? "Go to Dashboard" : "Join LocalVoice Today"}
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition"
              >
                I Already Have an Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
