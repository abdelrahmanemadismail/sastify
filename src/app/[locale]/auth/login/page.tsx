"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoginForm } from "@/components/auth/LoginForm";
import { OtpForm } from "@/components/auth/OtpForm";

export default function LoginPage() {
  const t = useTranslations();
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otpUsername, setOtpUsername] = useState("");

  const handleOTPRequired = (username: string) => {
    setOtpUsername(username);
    setRequiresOtp(true);
  };

  const handleBack = () => {
    setRequiresOtp(false);
    setOtpUsername("");
  };

  return (
    <div className="w-full">
      {/* Form Card Container */}
      <div className="w-full max-w-md mx-auto">
        {/* Background Card with border */}
        <div className="relative rounded-3xl bg-[#DDDEE5]/90 dark:bg-[#1D2250]/50 backdrop-blur-sm border border-[#CD202F] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-8 lg:p-10">
          {/* Sign In Header */}
          <div className="mb-8 relative">
            <h1 className="text-4xl lg:text-5xl font-bold font-poppins text-[#171B40] dark:text-white text-center relative inline-block w-full">
              {t("auth.sign_in")}
            </h1>
            {/* Red underline accent */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-2 bg-[#CD202F] -z-10" />
          </div>

          {/* Form Content */}
          {requiresOtp ? (
            <OtpForm username={otpUsername} onBack={handleBack} />
          ) : (
            <LoginForm onOTPRequired={handleOTPRequired} />
          )}
        </div>

        {/* Mobile Hero Text - shown only on small screens */}
        <div className="lg:hidden mt-8 text-center">
          <h2 className="text-2xl font-bold font-poppins text-[#1D2250] dark:text-white mb-4">
            {t("auth.welcome_back")}
          </h2>
        </div>
      </div>
    </div>
  );
}
