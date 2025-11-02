"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import React from 'react'
import { FloatingNav } from '../../components/ui/floating-navbar';
import { ContainerTextFlip } from '../../components/ui/container-text-flip';
import { HoverBorderGradient } from '../../components/ui/hover-border-gradient';
import { FeaturesSectionDemo } from '../../components/ui/FeatureSection';
import { motion } from 'motion/react';
import { AnimatedTestimonials } from '@repo/ui/animated-testimonials';
import { PointerHighlight } from '../../components/ui/pointer-highlight';



import roni from '../../public/roni.jpeg';
import nasir from '../../public/nasir.jpg';
import tan from '../../public/tan.jpeg';
import vikas from '../../public/vikas.jpeg';

const page = () => {
    const navItems = [
    { name: "Home", link: "/" },
    { name: "Qr", link: "/qr" },
    { name: "Bill", link: "/bills" },
    { name: "Settings", link: "/settings" },
  ];

  const team = [
    {
      name: "Roni Bhakta",
      designation: "Full Stack Developer",
      description:
        "Full Stack Developer and GSoC 2025 contributor at Internet Archive.",
      src: roni.src,
    },
    {
      name: "Nasir Nadaf",
      designation: "Full Stack Developer",
      description:
        "Expert in frontend, backend, and database development, building scalable solutions.",
      src: nasir.src,
    },
    {
      name: "Tanishq Dasari",
      designation: "AI/ML Engineer",
      description:
        "Specialist in creating AI models and Python development for advanced solutions.",
      src: tan.src,
    },
    {
      name: "Vikas Budhyal",
      designation: "Full Stack Frontend Developer",
      description:
        "Focused on frontend development with experience in building interactive web applications.",
      src: vikas.src,
    },
  ];

 
  const S1 = [
    {
      icon: "🔐",
      title: "Encryption",
      description: "Military-grade AES encryption",
    },
    {
      icon: "🛡️",
      title: "AI Fraud Detection",
      description: "Real-time threat analysis",
    },
    {
      icon: "🔍",
      title: "Multi-Factor Auth",
      description: "Biometric + device verification",
    },
    {
      icon: "🌐",
      title: "Global Compliance",
      description: "PCI DSS & GDPR certified",
    },
  ];

  const { status } = useSession();
  const router = useRouter();
  return (
    <div className="selection:bg-zinc-500 selection:text-white relative min-h-screen bg-zinc-950 dark:from-black dark:to-gray-900 overflow-hidden ">
      {/* Floating Navbar */}
      <FloatingNav navItems={navItems} />

      {/* Background with content */}
      <div className="flex flex-col  justify-center items-center h-screen text-center px-4 gap-3 mt-6">
        <div className="mb-8 relative z-10 gap-4 flex flex-col justify-center items-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-500">
            <ContainerTextFlip words={["Send", "Spend", "Grow"]} /> — with
            confidence.
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl">
            Experience effortless payments built for security and speed.
            CalxSecure empowers you to handle every transaction with total
            trust.
          </p>
          <HoverBorderGradient>
            {status === "authenticated" && (
              <button onClick={() => router.push("/qr")}>
                Generate QR Code
              </button>
            )}
            {status === "unauthenticated" && (
              <button onClick={() => router.push("/auth/signup")}>
                Get Started
              </button>
            )}
          </HoverBorderGradient>
        </div>

        
      </div>

      {/* Features Section */}
      <section className="py-24 bg-gray-700 dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-violet-50/10 dark:from-blue-900/10 dark:to-violet-900/5" />

        <div className="container relative mx-auto px-6">
          <div>
            <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white">
              Powerful Features for Modern Finance
            </h4>

            <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-100 text-center font-normal dark:text-neutral-100">
              CalxSecure handles everything from peer-to-peer transactions to
              automated bank webhooks — built to scale beyond a million users.
            </p>
          </div>

          <FeaturesSectionDemo />
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-zinc-900 dark:bg-zinc-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-20">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mb-6 animate-pulse">
              🔒 Bank-Grade Protection
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 leading-tight">
              Enterprise-Level Security
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your funds are protected with military-grade encryption,
              AI-powered fraud detection, and 24/7 monitoring—trusted by
              millions worldwide.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {S1.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="text-center p-8 bg-zinc-900/50 dark:bg-zinc-900/70 rounded-2xl border border-zinc-700/50 hover:border-zinc-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-xl text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.description || "Advanced protection"}
                  </p>

                  
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      <section className=" bg-gray-700 dark:bg-gray-900  relative overflow-hidden">
        <AnimatedTestimonials testimonials={team} />
      </section>

      {/* CTA Section */}
      <section className="flex items-center justify-center bg-gradient-to-r from-zinc-800 to-zinc-950 text-white pb-10">
        <div className="flex pt-4 flex-col gap-4 items-center  container   ">
          <div className="flex gap-2 text-2xl font-bold tracking-tight md:text-4xl">
            Ready to Get
            <PointerHighlight>Started?</PointerHighlight>
          </div>
          <p className="text-xl  max-w-2xl text-center ">
            Join thousands of users and merchants powering their payments with
            CalxSecure
          </p>
          <HoverBorderGradient >
            {status === "authenticated" && (
              <button onClick={() => router.push("/qr")}>
                Generate QR Code
              </button>
            )}
            {status === "unauthenticated" && (
              <button onClick={() => router.push("/auth/signup")}>
                Get Started
              </button>
            )}
          </HoverBorderGradient>
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center text-white justify-center p-3 bg-zinc-950 ">
        <p>© 2025 CalxSecure. All rights reserved.</p>
      </div>
    </div>
  )
}

export default page
