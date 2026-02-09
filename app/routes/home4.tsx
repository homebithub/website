import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { Link } from "react-router";
import React, { useEffect, useRef, useState } from "react";

export const meta = () => [
    { title: "Homebit — Trusted Home Services in Kenya" },
    { name: "description", content: "Find vetted housekeepers, nannies, and home-service professionals in Kenya. Browse profiles, read reviews, and hire with confidence on Homebit." },
    { property: "og:title", content: "Homebit — Trusted Home Services in Kenya" },
    { property: "og:description", content: "Find vetted housekeepers, nannies, and home-service professionals in Kenya." },
    { property: "og:url", content: "https://homebit.co.ke" },
];
import {
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";

function SlideUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.97]"
      } ${className}`}
      style={{ transitionDuration: "600ms" }}
    >
      {children}
    </div>
  );
}

function RevealOnScroll({ children, delay = 0, direction = "up" }: { children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  const hiddenClass =
    direction === "left"
      ? "opacity-0 -translate-x-10"
      : direction === "right"
      ? "opacity-0 translate-x-10"
      : "opacity-0 translate-y-10";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-x-0 translate-y-0" : hiddenClass
      }`}
    >
      {children}
    </div>
  );
}

function Typewriter({ words, className = "" }: { words: string[]; className?: string }) {
  const [currentWord, setCurrentWord] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!isDeleting && displayed.length === word.length) {
      timeout = setTimeout(() => setIsDeleting(true), 1800);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length - 1)), 40);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setCurrentWord((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentWord, words]);

  return (
    <span className={className}>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

const services = [
  { icon: HomeIcon, title: "Deep Cleaning", desc: "Thorough home cleaning by trained professionals." },
  { icon: UserGroupIcon, title: "Childcare", desc: "Trusted nannies and babysitters for your family." },
  { icon: ShieldCheckIcon, title: "Secure Hiring", desc: "Background-checked and verified househelps." },
  { icon: SparklesIcon, title: "Laundry", desc: "Fresh, folded, and delivered on time." },
  { icon: ClockIcon, title: "Flexible Hours", desc: "Book by the hour, day, or full-time." },
  { icon: ChatBubbleLeftRightIcon, title: "Direct Chat", desc: "Message professionals before you hire." },
];

export default function Home4() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false}>
        <main className="flex-grow">
          {/* Hero — split screen with typewriter (from home3, tighter padding) */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-center">
              {/* Left — text (3 cols) */}
              <div className="lg:col-span-3">
                <RevealOnScroll direction="left">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-500 dark:text-purple-400 mb-2">
                    Homebit
                  </p>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    Find the perfect help for{" "}
                    <Typewriter
                      words={["cooking", "laundry", "dishwashing", "ironing", "mopping", "grocery shopping", "childcare", "pet care", "bathroom cleaning"]}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500"
                    />
                  </h1>
                  <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                    We connect households with trusted, skilled professionals. Simple hiring, transparent pricing, and peace of mind — all in one platform.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      to="/signup"
                      className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-5 py-2 text-sm font-bold text-white dark:text-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Get Started
                      <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                      to="/about"
                      className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 underline underline-offset-4 decoration-gray-300 dark:decoration-gray-600 hover:decoration-purple-400"
                    >
                      Learn more
                    </Link>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right — stacked images (2 cols) */}
              <div className="lg:col-span-2">
                <RevealOnScroll direction="right" delay={200}>
                  <div className="relative">
                    <div className="absolute -inset-3 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-3xl blur-xl" />
                    <div className="relative grid grid-cols-2 gap-2.5">
                      {[
                        { src: "/assets/mtoi.svg", alt: "Laundry", fit: "object-contain" },
                        { src: "/assets/babysitter.webp", alt: "Childcare", fit: "object-cover" },
                        { src: "/assets/shopping.svg", alt: "Shopping", fit: "object-contain" },
                        { src: "/assets/man-trash.svg", alt: "Cleaning", fit: "object-contain" },
                      ].map((img, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-white dark:bg-[#13131a] rounded-xl p-2 border border-purple-100/60 dark:border-purple-500/15 shadow-sm hover:shadow-light-glow-sm dark:hover:shadow-glow-sm transition-all duration-400"
                        >
                          <img
                            src={img.src}
                            alt={img.alt}
                            className={`w-full h-full ${img.fit} rounded-lg`}
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              if (!el.dataset.fallback) {
                                el.dataset.fallback = "1";
                                el.src = img.src.replace("/assets/", "/");
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </section>

          {/* Bento grid of services (from home2) */}
          <section className="bg-white dark:bg-[#0a0a0f] py-14 sm:py-20 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <SlideUp>
                <div className="text-center mb-10 sm:mb-14">
                  <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Our Services
                  </h2>
                  <p className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Everything under one roof
                  </p>
                </div>
              </SlideUp>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {services.map((svc, idx) => (
                  <SlideUp key={svc.title} delay={idx * 80}>
                    <div className="group relative rounded-2xl border border-purple-200/30 dark:border-purple-500/15 bg-gradient-to-br from-white to-purple-50/50 dark:from-[#13131a] dark:to-[#0a0a0f] p-5 sm:p-6 transition-all duration-300 hover:shadow-light-glow-md dark:hover:shadow-glow-sm hover:-translate-y-1">
                      <div className="flex items-start gap-3.5">
                        <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                          <svc.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            {svc.title}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {svc.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SlideUp>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works — Households */}
          <section className="py-14 sm:py-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <SlideUp>
                <div className="text-center mb-10 sm:mb-14">
                  <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    How It Works
                  </h2>
                  <p className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    Getting started is easy
                  </p>
                </div>
              </SlideUp>

              {/* Household steps */}
              <SlideUp delay={100}>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-1.5 mb-6">
                    <HomeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                      For Households
                    </span>
                  </div>
                </div>
              </SlideUp>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
                {[
                  { step: "01", title: "Complete Your Profile", desc: "Sign up and set up your household profile — tell us your location, chores, budget, and preferences." },
                  { step: "02", title: "Browse & Connect", desc: "Search househelp profiles by skill, location, and ratings. Chat directly before hiring." },
                  { step: "03", title: "Hire with Confidence", desc: "Send a hire request, agree on terms, and enjoy professional help in your home." },
                ].map((item, idx) => (
                  <SlideUp key={item.step} delay={idx * 150}>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                        <span className="text-sm font-extrabold text-purple-700 dark:text-purple-400">{item.step}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                        {item.desc}
                      </p>
                    </div>
                  </SlideUp>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-purple-200/50 dark:border-purple-500/15 mb-14" />

              {/* Househelp steps */}
              <SlideUp delay={100}>
                <div className="mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-pink-100 dark:bg-pink-900/30 px-4 py-1.5 mb-6">
                    <UserGroupIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    <span className="text-xs sm:text-sm font-bold text-pink-700 dark:text-pink-300 uppercase tracking-wide">
                      For Househelps
                    </span>
                  </div>
                </div>
              </SlideUp>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { step: "01", title: "Create Your Profile", desc: "Sign up and showcase your skills, experience, availability, and salary expectations." },
                  { step: "02", title: "Get Discovered", desc: "Households browse and find you based on your skills and location. Respond to messages and hire requests." },
                  { step: "03", title: "Start Working", desc: "Accept a hire request, agree on terms, and begin your new role with a verified household." },
                ].map((item, idx) => (
                  <SlideUp key={`hh-${item.step}`} delay={idx * 150}>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-pink-100 dark:bg-pink-900/30 mb-4">
                        <span className="text-sm font-extrabold text-pink-700 dark:text-pink-400">{item.step}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{item.title}</h3>
                      <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                        {item.desc}
                      </p>
                    </div>
                  </SlideUp>
                ))}
              </div>
            </div>
          </section>

          {/* CTA (from home2) */}
          <section className="bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-14 sm:py-20 transition-colors duration-300">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <SlideUp>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Ready to transform your home experience?
                </h2>
                <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Join thousands of households and professionals already on Homebit.
                </p>
                <div className="mt-6">
                  <Link
                    to="/signup"
                    className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm sm:text-base font-bold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
                  >
                    Join Homebit Today
                  </Link>
                </div>
              </SlideUp>
            </div>
          </section>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
