"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, type Variants } from "framer-motion"
import { Mail, User, Building2, Briefcase, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"

interface WaitingListFormData {
  fullName: string
  email: string
  company: string
  position: string
}

interface WaitingListFormProps {
  onSuccess?: () => void
}

export function WaitingListForm({ onSuccess }: WaitingListFormProps) {
  const t = useTranslations("waitingList")
  const [formData, setFormData] = useState<WaitingListFormData>({
    fullName: "",
    email: "",
    company: "",
    position: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError(t("errors.nameRequired"))
      return false
    }
    if (!formData.email.trim()) {
      setError(t("errors.emailRequired"))
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t("errors.emailInvalid"))
      return false
    }
    if (!formData.company.trim()) {
      setError(t("errors.companyRequired"))
      return false
    }
    if (!formData.position.trim()) {
      setError(t("errors.positionRequired"))
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("https://formspree.io/f/xojljegb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(t("errors.submissionFailed"))
      }

      setSuccess(true)
      setFormData({
        fullName: "",
        email: "",
        company: "",
        position: "",
      })

      if (onSuccess) {
        onSuccess()
      }

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.submissionFailed")
      )
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const fieldVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    }),
  }

  const inputClass = cn(
    "w-full rounded-lg border bg-background/50 px-4 py-3 text-sm",
    "placeholder:text-muted-foreground/50",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary focus:bg-background",
    "dark:border-primary/20 dark:bg-primary/5 dark:focus:bg-primary/10 dark:focus:ring-primary/50",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    error && "border-destructive/60 focus:ring-destructive/40 focus:border-destructive"
  )

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-xl space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Full Name Field */}
      <motion.div
        className="space-y-2.5"
        custom={0}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
      >
        <label htmlFor="fullName" className="block text-sm font-semibold text-foreground">
          {t("form.fullName")}
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/40" />
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder={t("form.fullNamePlaceholder")}
            className={cn(inputClass, "pl-10")}
            disabled={isLoading}
          />
        </div>
      </motion.div>

      {/* Email Field */}
      <motion.div
        className="space-y-2.5"
        custom={1}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
      >
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">
          {t("form.email")}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/40" />
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t("form.emailPlaceholder")}
            className={cn(inputClass, "pl-10")}
            disabled={isLoading}
          />
        </div>
      </motion.div>

      {/* Company Field */}
      <motion.div
        className="space-y-2.5"
        custom={2}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
      >
        <label htmlFor="company" className="block text-sm font-semibold text-foreground">
          {t("form.company")}
        </label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/40" />
          <input
            id="company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            placeholder={t("form.companyPlaceholder")}
            className={cn(inputClass, "pl-10")}
            disabled={isLoading}
          />
        </div>
      </motion.div>

      {/* Position Field */}
      <motion.div
        className="space-y-2.5"
        custom={3}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
      >
        <label htmlFor="position" className="block text-sm font-semibold text-foreground">
          {t("form.position")}
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/40" />
          <input
            id="position"
            name="position"
            type="text"
            value={formData.position}
            onChange={handleChange}
            placeholder={t("form.positionPlaceholder")}
            className={cn(inputClass, "pl-10")}
            disabled={isLoading}
          />
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 rounded-lg bg-destructive/8 p-4 text-sm text-destructive backdrop-blur-sm border border-destructive/20 dark:bg-destructive/5 dark:border-destructive/15"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex items-start gap-3 rounded-lg bg-green-500/8 p-4 text-sm text-green-600 dark:text-green-400 backdrop-blur-sm border border-green-500/20 dark:border-green-500/15"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{t("success.message")}</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        custom={4}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        className="pt-2"
      >
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-6 text-base font-semibold bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-2"
            >
              <span>✨</span>
              <span>Processing...</span>
            </motion.div>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {t("form.joinWaitingList")}
            </span>
          )}
        </Button>
      </motion.div>

      <motion.p
        custom={5}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        className="text-center text-xs text-muted-foreground/60"
      >
        {t("form.privacyNotice")}
      </motion.p>
    </motion.form>
  )
}
