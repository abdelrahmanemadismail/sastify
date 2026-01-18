"use client"

import { motion, type Variants } from "framer-motion"
import { Lock, Zap, Eye, Gauge, Users, Brain } from "lucide-react"

interface Benefit {
  icon: React.ReactNode
  title: string
  description: string
}

const benefits: Benefit[] = [
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Enterprise Security",
    description: "Access powerful SAST scanning across multiple languages and frameworks",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast Results",
    description: "Get comprehensive security insights in seconds, not hours",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Clear Visibility",
    description: "Intuitive dashboard with real-time vulnerability tracking",
  },
  {
    icon: <Gauge className="h-6 w-6" />,
    title: "Risk Scoring",
    description: "Understand your security posture with intelligent risk assessment",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Team Collaboration",
    description: "Work together to identify, track, and fix vulnerabilities",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Powered Fixes",
    description: "Get intelligent recommendations on how to resolve security issues",
  },
]

export function WaitingListBenefits() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      // Use cubic-bezier easing to satisfy framer-motion's Easing type
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section className="relative px-4 py-24 md:py-40">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-500">
            <span>Why Join</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            What You&apos;ll Get Access To
          </h2>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            Comprehensive security tools and resources designed for modern development teams
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-xl border border-red-500/12 bg-linear-to-br from-card/60 to-card/30 p-7 transition-all duration-300 hover:border-red-500/30 hover:bg-linear-to-br hover:from-card/80 hover:to-card/40"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 -z-10 bg-linear-to-br from-red-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Icon with gradient background */}
              <div className="mb-5 inline-flex rounded-lg bg-linear-to-br from-red-500/18 to-red-500/6 p-3.5 text-red-500 transition-all duration-300 group-hover:from-red-500/26 group-hover:to-red-500/10">
                {benefit.icon}
              </div>

              {/* Content */}
              <h3 className="mb-3 font-semibold text-foreground text-lg">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">{benefit.description}</p>

              {/* Hover indicator dot */}
              <div className="absolute right-5 top-5 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-20 rounded-2xl border border-red-500/20 bg-linear-to-r from-red-500/14 via-red-500/8 to-background p-10 text-center backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="mb-3 text-3xl font-bold">Ready to secure your code?</h3>
          <p className="text-muted-foreground/80 text-lg">
            Join hundreds of developers who are already using SASTify to protect their applications
          </p>
        </motion.div>
      </div>
    </section>
  )
}
