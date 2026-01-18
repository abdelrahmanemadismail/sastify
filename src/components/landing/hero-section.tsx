"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Download, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  const t = useTranslations();

  return (
    <section className="relative flex items-center justify-center px-4 py-20">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-200 h-200 bg-red-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-150 h-150 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full h-162.5 mx-auto">
        {/* Main Content Container with glassmorphism effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto max-w-7xl"
        >
          {/* Glassmorphism container matching Figma specs */}
          <div className="relative rounded-[50px] bg-black/[0.004] backdrop-blur-sm p-12 md:p-20">
            {/* Inner shadow effect */}
            <div
              className="absolute inset-0 rounded-[50px] pointer-events-none"
              style={{
                boxShadow:
                  "inset 0px 4px 10px rgba(255, 255, 255, 0.15), inset 0px 5px 30px 1px rgba(255, 0, 22, 0.26)",
              }}
            />
            {/* Trusted by Startups Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t("hero.trustedBy")}
                </span>
              </div>
            </motion.div>
            {/* Hero Text Content */}
            <div className="relative z-10 text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
              >
                <span className="block">{t("hero.title.line1")}</span>
                <span className="block">{t("hero.title.line2")}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"
                >
                  {t("hero.cta")}
                  <Download className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>

            {/* Dashboard Preview with Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1 }}
              className="relative"
            >
              {/* Security Bugs Card - Left */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute -left-4 md:-left-12 top-20 z-20"
              >
                <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl w-48">
                  <h3 className="text-sm font-semibold mb-4">
                    {t("hero.stats.securityBugs")}
                  </h3>
                  <div className="flex items-end gap-2 h-32">
                    <div className="flex flex-col justify-end items-center flex-1">
                      <div className="w-full bg-linear-to-t from-red-500 to-red-400 rounded-t-lg h-24" />
                      <span className="text-xs mt-2 text-muted-foreground">
                        Day 1
                      </span>
                    </div>
                    <div className="flex flex-col justify-end items-center flex-1">
                      <div className="w-full bg-linear-to-t from-red-500 to-red-400 rounded-t-lg h-20" />
                      <span className="text-xs mt-2 text-muted-foreground">
                        Day 2
                      </span>
                    </div>
                    <div className="flex flex-col justify-end items-center flex-1">
                      <div className="w-full bg-linear-to-t from-red-500 to-red-400 rounded-t-lg h-16" />
                      <span className="text-xs mt-2 text-muted-foreground">
                        Day 3
                      </span>
                    </div>
                    <div className="flex flex-col justify-end items-center flex-1">
                      <div className="w-full bg-linear-to-t from-red-500 to-red-400 rounded-t-lg h-12" />
                      <span className="text-xs mt-2 text-muted-foreground">
                        Day 4
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Real-time Engine Card - Right */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="absolute -right-4 md:-right-12 top-20 z-20"
              >
                <div className="bg-background/80 backdrop-blur-md border border-border rounded-2xl p-6 shadow-xl w-56">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <h3 className="text-sm font-semibold">
                      {t("hero.stats.realTimeEngine")}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        {t("hero.stats.riskScore")}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-red-500">
                          92
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /100
                        </span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <div className="h-1 flex-1 bg-red-500 rounded" />
                        <div className="h-1 flex-1 bg-orange-500 rounded" />
                        <div className="h-1 flex-1 bg-yellow-500 rounded" />
                        <div className="h-1 flex-1 bg-gray-500 rounded" />
                      </div>
                      <div className="text-xs font-semibold text-red-500 mt-2">
                        {t("hero.stats.highRisk")}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Notification Card - Bottom Left */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="absolute -bottom-8 left-4 md:left-12 z-20"
              >
                <div className="bg-background/80 backdrop-blur-md border border-red-500/30 rounded-xl p-4 shadow-xl w-72 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">
                      {t("hero.stats.newVulnerability")}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {t("hero.stats.vulnerabilityDetail")}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Main Dashboard Mock */}
              <DashboardPreview />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
