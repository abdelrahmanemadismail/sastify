"use client";

import { useTranslations } from "next-intl";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  const t = useTranslations();

  return (
    <div className="w-full">
      {/* Form Card Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Background Card with border */}
        <div className="relative rounded-3xl bg-[#DDDEE5]/90 dark:bg-[#1D2250]/50 backdrop-blur-sm border border-[#CD202F] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 lg:p-10">
          {/* Sign Up Header */}
          <div className="mb-8 relative">
            <h1 className="text-4xl lg:text-5xl font-bold font-poppins text-[#171B40] dark:text-white text-center relative inline-block w-full">
              {t("auth.create_account")}
            </h1>
            {/* Red underline accent */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-[#CD202F] -z-10" />
          </div>

          {/* Form Content */}
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
