import createMiddleware from "next-intl/middleware";

export const proxy = createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*|api).*)"],
};
