"use client";

import { useTranslations } from "next-intl";

interface DashboardPageWrapperProps {
  title: string;
  translationKey: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function DashboardPageWrapper({
  title,
  translationKey,
  icon,
  children,
}: DashboardPageWrapperProps) {
  const t = useTranslations();

  return (
    <div className="flex-1 space-y-6">
      {/* Page Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {icon && <span className="text-3xl">{icon}</span>}
          {title}
        </h2>
        <p className="text-muted-foreground">
          {t(`dashboard.${translationKey}_description`) ||
            `Manage your ${title.toLowerCase()}.`}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4 opacity-50">{icon}</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-md">
              {t(`dashboard.${translationKey}_description`) ||
                `This section is coming soon. Stay tuned for ${title}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
