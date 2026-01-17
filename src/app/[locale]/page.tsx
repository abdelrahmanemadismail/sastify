import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ModeToggle } from "@/components/theme-toggle";

export default function Home() {
  const t = useTranslations();

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between p-4">
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">{t("welcome")}</h1>
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </main>
  );
}
