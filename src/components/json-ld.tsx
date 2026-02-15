"use client";

/**
 * JSON-LD Schema Component
 * Injects structured data into the page head for SEO
 */

interface JsonLdProps {
  schema: Record<string, unknown>;
  priority?: "high" | "low";
}

export function JsonLd({ schema, priority = "low" }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      suppressHydrationWarning
      // @ts-expect-error: The `strategy` attribute is not recognized by React
      // but is used by Next.js for script optimization
      strategy={priority === "high" ? "beforeInteractive" : "afterInteractive"}
    />
  );
}

/**
 * Multiple JSON-LD Schemas Component
 * Injects multiple schema objects at once
 */
export function JsonLdArray({
  schemas,
  priority = "low",
}: {
  schemas: Record<string, unknown>[];
  priority?: "high" | "low";
}) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
          suppressHydrationWarning
          // @ts-expect-error: The `strategy` attribute is not recognized by React
          strategy={priority === "high" ? "beforeInteractive" : "afterInteractive"}
        />
      ))}
    </>
  );
}
