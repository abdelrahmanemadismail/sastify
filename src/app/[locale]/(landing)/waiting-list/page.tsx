import { Sparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import { WaitingListBenefits } from "@/components/waiting-list/waiting-list-benefits"
import { WaitingListForm } from "@/components/waiting-list/waiting-list-form"
import { WaitingListHero } from "@/components/waiting-list/waiting-list-hero"

export default async function WaitingListPage() {
  const t = await getTranslations("waitingList")

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="relative flex-1">
        {/* Soft gradient backdrop to mirror the landing aesthetic */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute right-[-15%] top-1/4 h-96 w-96 rounded-full bg-red-500/18 blur-[140px]" />
          <div className="absolute left-1/2 bottom-0 h-64 w-64 -translate-x-1/2 rounded-full bg-red-500/10 blur-[110px]" />
        </div>

        <div className="space-y-24 pb-24 pt-16 md:space-y-28 md:pb-32 md:pt-20">
          {/* Hero Section */}
          <WaitingListHero />

          {/* Form Section */}
          <section className="relative px-4">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-500 backdrop-blur-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>{t("title")}</span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{t("subtitle")}</h2>
                    <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground/80">{t("description")}</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 -z-10 rounded-[32px] bg-linear-to-br from-red-500/18 via-red-500/12 to-transparent blur-3xl" />
                  <div className="relative overflow-hidden rounded-[32px] border border-red-500/25 bg-linear-to-br from-card/80 via-card/60 to-background p-6 shadow-2xl backdrop-blur-xl md:p-10 dark:border-red-500/20 dark:from-card/50 dark:via-card/30">
                    <div className="absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-red-500/40 to-transparent" />
                    <div className="absolute inset-x-10 -bottom-px h-px bg-linear-to-r from-transparent via-red-500/40 to-transparent" />

                    <div className="mb-8 text-center">
                      <h3 className="text-2xl font-semibold md:text-3xl">{t("title")}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
                    </div>

                    <WaitingListForm />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <WaitingListBenefits />
        </div>
      </div>

      <ScrollToTopButton />
    </main>
  )
}
