"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, Mail, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactSection() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("errors.nameRequired") || "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("errors.nameMinLength") || "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = t("errors.emailRequired") || "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("errors.emailInvalid") || "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t("errors.subjectRequired") || "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = t("errors.subjectMinLength") || "Subject must be at least 3 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = t("errors.messageRequired") || "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("errors.messageMinLength") || "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitStatus("error");
      setSubmitMessage(t("errors.validationFailed") || "Please fix the errors above");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Add your form submission logic here
      // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
      console.log("Form submitted:", formData);

      // Simulate successful submission
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitStatus("success");
      setSubmitMessage(t("success") || "Thank you! Your message has been sent successfully.");
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 5000);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(t("errors.submissionFailed") || "Failed to send message. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-7xl">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            {t("title")}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-2">
            {t("subtitle")}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-2xl bg-card dark:bg-card border border-border dark:border-border p-8 shadow-xl mx-auto max-w-2xl"
        >
          {/* Status Messages */}
          {submitStatus === "success" && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
              <p className="text-emerald-500 text-sm">{submitMessage}</p>
            </div>
          )}
          {submitStatus === "error" && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertCircle size={20} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-destructive text-sm">{submitMessage}</p>
            </div>
          )}

          {/* Name Field */}
          <div className="relative group">
            <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
              {t("namePlaceholder")} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary pointer-events-none" />
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("namePlaceholder")}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-muted/10 border transition-all focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${
                  errors.name
                    ? "border-destructive focus:ring-destructive focus:border-transparent"
                    : "border-border focus:ring-primary focus:border-transparent"
                }`}
              />
            </div>
            {errors.name && (
              <p id="name-error" className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle size={14} /> {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="relative group">
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
              {t("emailPlaceholder")} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary pointer-events-none" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("emailPlaceholder")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-muted/10 border transition-all focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${
                  errors.email
                    ? "border-destructive focus:ring-destructive focus:border-transparent"
                    : "border-border focus:ring-primary focus:border-transparent"
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle size={14} /> {errors.email}
              </p>
            )}
          </div>

          {/* Subject Field */}
          <div className="relative group">
            <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground mb-2">
              {t("subjectPlaceholder")} <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MessageSquare size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary pointer-events-none" />
              <input
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder={t("subjectPlaceholder")}
                aria-invalid={!!errors.subject}
                aria-describedby={errors.subject ? "subject-error" : undefined}
                className={`w-full pl-12 pr-4 py-3 rounded-xl bg-muted/10 border transition-all focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${
                  errors.subject
                    ? "border-destructive focus:ring-destructive focus:border-transparent"
                    : "border-border focus:ring-primary focus:border-transparent"
                }`}
              />
            </div>
            {errors.subject && (
              <p id="subject-error" className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle size={14} /> {errors.subject}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div className="relative group">
            <label htmlFor="message" className="block text-sm font-medium text-muted-foreground mb-2">
              {t("messagePlaceholder")} <span className="text-destructive">*</span>
              <span className="float-right text-xs text-muted-foreground/60">
                {formData.message.length}/1000
              </span>
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                maxLength={1000}
                placeholder={t("messagePlaceholder")}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                rows={6}
                className={`w-full px-4 py-3 rounded-xl bg-muted/10 border transition-all focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground resize-none ${
                  errors.message
                    ? "border-destructive focus:ring-destructive focus:border-transparent"
                    : "border-border focus:ring-primary focus:border-transparent"
                }`}
              />
            </div>
            {errors.message && (
              <p id="message-error" className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle size={14} /> {errors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("submitting") || "Sending..."}
                </>
              ) : (
                <>
                  {t("submitButton")}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
