"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function LearningPlatforms() {
  const t = useTranslations("learningPlatforms");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative w-full py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          {/* Badge */}
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 py-2 rounded-full border border-destructive/40 bg-destructive/10 backdrop-blur-sm hover:border-destructive/60 transition-colors">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider">
                {t("badge")}
              </p>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            {t("title")}
          </h2>

          {/* Subtitle */}
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Cards Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-10"
        >
          {/* CyLearn Card */}
          <motion.div
            variants={itemVariants}
            className="group"
          >
            <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5 hover:border-destructive/50 transition-all duration-300">
              {/* Subtle gradient background */}
              <div className="absolute inset-0 bg-linear-to-br from-destructive/10 to-transparent opacity-50" />

              {/* Content */}
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 p-8 md:p-10">
                {/* Image */}
                <div className="w-full lg:w-2/5 shrink-0">
                  <div className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden border border-destructive/20">
                    <Image
                      src="/cylearn.png"
                      alt="CyLearn Platform"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="w-full lg:w-3/5 space-y-4">
                  <div className="inline-block">
                    <span className="text-xs font-bold text-destructive uppercase tracking-wider">
                      {t("cylearn.subtitle")}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t("cylearn.title")}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("cylearn.description")}
                  </p>

                  <div className="text-xs text-muted-foreground/70 flex items-center gap-2 pt-1">
                    <span>⚡</span>
                    <span>{t("cylearn.hint")}</span>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="px-6 py-5 bg-destructive hover:bg-destructive/90 font-semibold rounded-lg transition-all duration-300 text-sm flex items-center gap-2 group/btn"
                    >
                      {t("cylearn.cta")}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* VulnPlayground Card */}
          <motion.div
            variants={itemVariants}
            className="group"
          >
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 hover:border-primary/50 transition-all duration-300">
              {/* Subtle gradient background */}
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent opacity-50" />

              {/* Content */}
              <div className="relative z-10 flex flex-col lg:flex-row-reverse items-center gap-8 p-8 md:p-10">
                {/* Image */}
                <div className="w-full lg:w-2/5 shrink-0">
                  <div className="relative w-full h-56 md:h-64 rounded-xl overflow-hidden border border-primary/20">
                    <Image
                      src="/vulnPlayground.png"
                      alt="VulnPlayground"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="w-full lg:w-3/5 space-y-4">
                  <div className="inline-block">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {t("vulnplayground.subtitle")}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t("vulnplayground.title")}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t("vulnplayground.description")}
                  </p>

                  <div className="text-xs text-muted-foreground/70 flex items-center gap-2 pt-1">
                    <span>⚠️</span>
                    <span>{t("vulnplayground.hint")}</span>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="px-6 py-5 bg-destructive hover:bg-destructive/90 font-semibold rounded-lg transition-all duration-300 text-sm flex items-center gap-2 group/btn"
                    >
                      {t("vulnplayground.cta")}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
