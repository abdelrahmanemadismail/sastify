"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Upload, Settings, Search, FileBarChart, CheckCircle2, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

function WorkflowStep({ number, title, description, icon, index }: WorkflowStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative rounded-2xl border border-red-500/30 bg-linear-to-br from-background/50 to-red-500/5 backdrop-blur-sm p-6 hover:border-red-500/50 transition-all duration-300 group"
    >
      {/* Inner glow effect */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: "inset 0px 0px 20px rgba(239, 68, 68, 0.15)",
        }}
      />

      <div className="relative z-10">
        {/* Number badge */}
        <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg border-4 border-background">
          {number}
        </div>

        {/* Icon */}
        <div className="flex justify-end mb-4">
          <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <div className="text-red-500">{icon}</div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      number: 1,
      title: t("steps.upload.title"),
      description: t("steps.upload.description"),
      icon: <Upload className="w-8 h-8" />,
    },
    {
      number: 2,
      title: t("steps.configure.title"),
      description: t("steps.configure.description"),
      icon: <Settings className="w-8 h-8" />,
    },
    {
      number: 3,
      title: t("steps.scan.title"),
      description: t("steps.scan.description"),
      icon: <Search className="w-8 h-8" />,
    },
    {
      number: 4,
      title: t("steps.reports.title"),
      description: t("steps.reports.description"),
      icon: <FileBarChart className="w-8 h-8" />,
    },
    {
      number: 5,
      title: t("steps.fix.title"),
      description: t("steps.fix.description"),
      icon: <CheckCircle2 className="w-8 h-8" />,
    },
    {
      number: 6,
      title: t("steps.track.title"),
      description: t("steps.track.description"),
      icon: <BarChart3 className="w-8 h-8" />,
    },
  ];

  return (
    <section className="relative py-20 px-4 md:px-8 lg:px-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-red-500/5 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Workflow steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {steps.map((step, index) => (
            <WorkflowStep key={step.number} {...step} index={index} />
          ))}
        </div>

        {/* AI-Powered section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-red-500/30 bg-linear-to-br from-red-500/10 via-purple-500/10 to-background backdrop-blur-sm p-8 md:p-12 overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-linear-to-r from-red-500/20 via-purple-500/20 to-red-500/20 blur-3xl opacity-30 pointer-events-none" />

          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-500">
              {t("aiPowered.badge")}
            </span>
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t("aiPowered.title")}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t("aiPowered.description")}
              </p>
              <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white font-semibold">
                {t("aiPowered.cta")}
              </Button>
            </div>

            {/* Visual representation */}
            <div className="relative h-64 rounded-2xl bg-background/50 border border-red-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                  <Sparkles className="w-10 h-10 text-red-500 animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("aiPowered.visual")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
