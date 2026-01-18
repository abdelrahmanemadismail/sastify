"use client"

import { useTranslations } from "next-intl"
import { motion, type Variants } from "framer-motion"
import { Sparkles, Shield, Zap } from "lucide-react"

export function WaitingListHero() {
  const t = useTranslations("waitingList")

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section className="relative w-full overflow-hidden bg-linear-to-b from-red-500/10 via-background to-background px-4 py-24 md:py-40">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-1/2 -top-1/3 h-full w-full rounded-full bg-linear-to-br from-red-500/25 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-linear-to-r from-red-400/18 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-1/4 -bottom-1/4 h-96 w-96 rounded-full bg-linear-to-l from-rose-500/14 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <motion.div
          className="space-y-8 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-500 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              <span>Exclusive Early Access</span>
            </div>
          </motion.div>

          {/* Main Title with Gradient */}
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
              <span className="bg-linear-to-r from-red-500 via-red-400 to-rose-400 bg-clip-text text-transparent">
                {t("title")}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </motion.p>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-base text-muted-foreground/75 max-w-xl mx-auto leading-relaxed">
            {t("description")}
          </motion.p>

          {/* Feature Highlights */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3"
          >
            {[
              { icon: Shield, label: "Enterprise Grade", color: "from-red-500/20" },
              { icon: Zap, label: "Lightning Fast", color: "from-rose-500/18" },
              { icon: Sparkles, label: "AI Powered", color: "from-orange-500/18" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="group rounded-xl border border-red-500/12 bg-linear-to-br from-card/60 to-card/40 p-5 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30 hover:bg-card/60"
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-lg bg-linear-to-br from-red-500/15 to-red-500/5 p-3 transition-all duration-300 group-hover:from-red-500/25 group-hover:to-red-500/10">
                    <feature.icon className="h-5 w-5 text-red-500/90" />
                  </div>
                  <p className="text-sm font-semibold text-foreground/90">{feature.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
