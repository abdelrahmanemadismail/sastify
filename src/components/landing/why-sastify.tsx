"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, Zap, LayoutDashboard, FileText } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative rounded-3xl border border-red-500/30 bg-linear-to-br from-red-500/10 to-purple-500/5 backdrop-blur-sm p-8 hover:border-red-500/50 transition-all duration-300"
    >
      {/* Inner shadow effect */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          boxShadow:
            "inset 0px 2px 8px rgba(255, 255, 255, 0.1), inset 0px 1px 20px rgba(255, 0, 22, 0.15)",
        }}
      />

      <div className="relative z-10">
        {/* Icon container */}
        <div className="mb-6 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <div className="text-red-500">{icon}</div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function WhySastify() {
  const t = useTranslations();

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: t("whySastify.features.detection.title"),
      description: t("whySastify.features.detection.description"),
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t("whySastify.features.scanning.title"),
      description: t("whySastify.features.scanning.description"),
    },
    {
      icon: <LayoutDashboard className="w-6 h-6" />,
      title: t("whySastify.features.dashboard.title"),
      description: t("whySastify.features.dashboard.description"),
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("whySastify.features.reporting.title"),
      description: t("whySastify.features.reporting.description"),
    },
  ];

  return (
    <section className="relative px-4">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-200 h-200 bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-150 h-150 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Main container with glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative rounded-[50px] bg-black/[0.004] backdrop-blur-sm p-8 md:p-16 lg:p-20"
        >
          {/* Inner shadow effect */}
          <div
            className="absolute inset-0 rounded-[50px] pointer-events-none"
            style={{
              boxShadow:
                "inset 4px 0px 15px rgba(255, 255, 255, 0.25)",
            }}
          />

          <div className="relative z-10">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {t("whySastify.title")}
              </h2>
              <p className="text-xl md:text-2xl text-red-400 font-semibold mb-3">
                {t("whySastify.subtitle")}
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("whySastify.description")}
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
