"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/logo/logo-icon";
import { LogoText } from "@/components/logo/logo-text";
import { motion } from "framer-motion";

export function Footer() {
  const t = useTranslations("header");
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setIsSubmitted(true);
    setEmail("");
    // Reset after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const navLinks = [
    { name: t("home"), href: "/" },
    { name: t("features"), href: "#features" },
    { name: t("pricing"), href: "#pricing" },
    { name: t("education"), href: "#education" },
    { name: t("contact"), href: "#contact" },
  ];

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
    { name: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
    { name: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="relative w-full overflow-hidden bg-[#0B0121]">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0B0121]/50 to-[#0B0121] z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-linear-to-b from-red-500/5 to-transparent rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-linear-to-t from-blue-500/5 to-transparent rounded-full blur-[120px] opacity-50" />
      </div>

      {/* Divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent z-0" />

      {/* Content Container */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className={cn(
          "relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between",
          "w-full max-w-7xl mx-auto",
          "px-6 md:px-10 py-16 md:py-20",
          "gap-12 md:gap-14 lg:gap-20"
        )}
      >
        {/* Left Section - Logo, Social, Copyright */}
        <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start gap-8 shrink-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group/logo transition-all duration-300 hover:scale-105">
            <LogoIcon className="h-8 w-8 text-white transition-all duration-300 group-hover/logo:scale-110" />
            <LogoText className="h-8 transition-all duration-300 group-hover/logo:opacity-80" />
          </Link>

          {/* Social Links with hover effects */}
          <div className="flex gap-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center",
                  "bg-linear-to-br from-white/10 to-white/5",
                  "border border-white/20 hover:border-white/40",
                  "text-white transition-all duration-300",
                  "shadow-lg hover:shadow-xl hover:shadow-red-500/20"
                )}
              >
                <SocialIcon icon={social.icon} />
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs md:text-sm text-gray-400 text-center lg:text-left">
            SASTify © 2026. All rights reserved.
          </p>
        </motion.div>

        {/* Middle Section - Navigation Links */}
        <motion.nav variants={itemVariants} className="flex flex-col items-start justify-center gap-4 flex-1">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Link
                href={link.href}
                className="text-sm md:text-base font-medium text-gray-300 hover:text-white transition-all duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-red-500 to-red-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        {/* Right Section - Newsletter Signup */}
        <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-end gap-6 shrink-0 w-full lg:w-auto">
          <div className="text-center lg:text-right">
            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2"
            >
              Smarter. Safer. In Your Inbox.
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs md:text-sm text-gray-400 max-w-xs"
            >
              Get useful security tips and product updates straight to your inbox. No spam, just helpful content.
            </motion.p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleNewsletterSubmit} className="w-full max-w-xs flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="your@email.com"
                className={cn(
                  "w-full px-4 py-3.5 rounded-lg text-sm",
                  "bg-white/10 backdrop-blur-sm border",
                  error ? "border-red-500/50" : "border-white/20",
                  "text-white placeholder:text-gray-500",
                  "focus:outline-none focus:border-white/50 focus:bg-white/15 focus:ring-1 focus:ring-white/30",
                  "transition-all duration-200",
                  "pl-10"
                )}
              />
              <Mail className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                error ? "text-red-500/50" : "text-gray-500"
              )} />
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500"
              >
                {error}
              </motion.p>
            )}

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isSubmitted}
                className={cn(
                  "rounded-lg px-5 py-3 text-sm font-medium w-full",
                  "bg-linear-to-r from-[#FF1B34] to-[#FF4059]",
                  "text-white border border-[#FF1B34]",
                  "shadow-[0px_4px_25px_rgba(255,27,52,0.3)]",
                  "hover:shadow-[0px_8px_40px_rgba(255,27,52,0.5)] hover:-translate-y-0.5",
                  "disabled:opacity-75 disabled:cursor-default",
                  "transition-all duration-300",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isSubmitted ? (
                  <>
                    <span>✓</span>
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <span>Join now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "facebook":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C8.74 0 8.333.015 7.053.072c-1.27.058-2.13.322-2.915.688-.79.306-1.459.717-2.126 1.384-.667.667-1.079 1.335-1.384 2.126-.366.785-.63 1.645-.688 2.915C.015 8.333 0 8.74 0 12s.015 3.667.072 4.947c.058 1.27.322 2.13.688 2.915.306.79.717 1.459 1.384 2.126.667.667 1.335 1.079 2.126 1.384.785.366 1.645.63 2.915.688 1.28.057 1.687.072 4.947.072s3.667-.015 4.947-.072c1.27-.058 2.13-.322 2.915-.688.79-.306 1.459-.717 2.126-1.384.667-.667 1.079-1.335 1.384-2.126.366-.785.63-1.645.688-2.915.057-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.058-1.27-.322-2.13-.688-2.915-.306-.79-.717-1.459-1.384-2.126C21.319 1.347 20.651.936 19.86.63c-.785-.366-1.645-.63-2.915-.688C15.667.015 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.070 1.171.054 1.805.244 2.227.408.56.217.96.477 1.382.896.419.42.679.822.896 1.381.164.422.354 1.057.408 2.227.061 1.264.07 1.646.07 4.849 0 3.203-.009 3.585-.07 4.849-.054 1.171-.244 1.805-.408 2.227-.217.56-.477.96-.896 1.382-.42.419-.822.679-1.381.896-.422.164-1.057.354-2.227.408-1.264.061-1.646.07-4.849.07-3.203 0-3.585-.009-4.849-.07-1.171-.054-1.805-.244-2.227-.408-.56-.217-.96-.477-1.382-.896-.419-.42-.679-.822-.896-1.381-.164-.422-.354-1.057-.408-2.227-.061-1.264-.07-1.646-.07-4.849 0-3.203.009-3.585.07-4.849.054-1.171.244-1.805.408-2.227.217-.56.477-.96.896-1.382.42-.419.822-.679 1.381-.896.422-.164 1.057-.354 2.227-.408 1.264-.061 1.646-.07 4.849-.07zM5.838 12c0-3.403 2.759-6.162 6.162-6.162 3.403 0 6.162 2.759 6.162 6.162 0 3.403-2.759 6.162-6.162 6.162-3.403 0-6.162-2.759-6.162-6.162zm1.622 0c0 2.505 2.035 4.54 4.54 4.54 2.505 0 4.54-2.035 4.54-4.54 0-2.505-2.035-4.54-4.54-4.54-2.505 0-4.54 2.035-4.54 4.54zm5.905-6.812c-.794 0-1.439-.645-1.439-1.439s.645-1.439 1.439-1.439 1.439.645 1.439 1.439-.645 1.439-1.439 1.439z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.735-2.004 1.442-.103.249-.129.597-.129.946v5.417h-3.554s.05-8.797 0-9.714h3.554v1.375c.427-.659 1.191-1.597 2.898-1.597 2.117 0 3.704 1.385 3.704 4.362v5.574zM5.337 9.432c-1.144 0-1.915-.758-1.915-1.707 0-.955.768-1.708 1.959-1.708 1.188 0 1.914.753 1.939 1.708 0 .949-.751 1.707-1.983 1.707zm1.582 11.02H3.772V9.738h3.147v10.714zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      );
    case "youtube":
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    default:
      return null;
  }
}
