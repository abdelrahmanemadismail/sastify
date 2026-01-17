import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function Home() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">{t("welcome")}</h1>
        <LanguageSwitcher />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
          <p className="text-muted-foreground">Next.js 16 with Arabic Localization</p>
        </div>
      </div>
    </main>
  );
}
