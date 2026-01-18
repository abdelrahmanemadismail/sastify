"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";

const languageIcons = [
  { name: "JavaScript", src: "/tech-icons/JavaScript.svg" },
  { name: "HTML5", src: "/tech-icons/html.svg" },
  { name: "Go", src: "/tech-icons/Go.svg" },
  { name: "React", src: "/tech-icons/React.svg" },
  { name: "C#", src: "/tech-icons/C%23.svg" },
  { name: "C++", src: "/tech-icons/C%2B%2B.svg" },
  { name: "PHP", src: "/tech-icons/Php.svg" },
  { name: "Java", src: "/tech-icons/Java.svg" },
  { name: "Python", src: "/tech-icons/Python.svg" },
] as const;

export function LanguageSupport() {
  const t = useTranslations("learningPlatforms");

  return (
    <section className="relative w-full py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="relative rounded-2xl border border-foreground/10 bg-background/80 px-6 py-12 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
              <span>{t("languageSupport.badge")}</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {t("languageSupport.title")}
              </h3>
              <p className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground">
                {t("languageSupport.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              {languageIcons.map((icon) => (
                <motion.div
                  key={icon.name}
                  whileHover={{ y: -2, scale: 1.05 }}
                  transition={{ duration: 0.2, ease: "easeOut" as const }}
                  className="group flex items-center justify-center transition"
                >
                  <Image
                    src={icon.src}
                    alt={`${icon.name} logo`}
                    width={64}
                    height={64}
                    className="h-14 w-14 object-contain transition group-hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              {t("languageSupport.more")}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
