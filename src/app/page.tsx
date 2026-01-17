import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  const semanticColors = [
    { name: "background", bg: "bg-background", text: "text-foreground", desc: "Default page background" },
    { name: "foreground", bg: "bg-foreground", text: "text-background", desc: "Default text color" },
    { name: "card", bg: "bg-card", text: "text-card-foreground", desc: "Card backgrounds" },
    { name: "popover", bg: "bg-popover", text: "text-popover-foreground", desc: "Popover backgrounds" },
    { name: "primary", bg: "bg-primary", text: "text-primary-foreground", desc: "Primary actions" },
    { name: "secondary", bg: "bg-secondary", text: "text-secondary-foreground", desc: "Secondary actions" },
    { name: "muted", bg: "bg-muted", text: "text-muted-foreground", desc: "Muted backgrounds" },
    { name: "accent", bg: "bg-accent", text: "text-accent-foreground", desc: "Accent elements" },
    { name: "destructive", bg: "bg-destructive", text: "text-destructive-foreground", desc: "Destructive actions" },
  ];

  const utilityColors = [
    { name: "border", border: "border-4 border-border", desc: "Default borders" },
    { name: "input", border: "border-4 border-input", desc: "Input borders" },
    { name: "ring", border: "border-4 border-ring", desc: "Focus rings" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">shadcn/ui Color System</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Comprehensive color palette testing for light & dark modes
            </p>
          </div>
          <ModeToggle />
        </div>

        {/* Semantic Color Swatches */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Semantic Colors</h2>
            <p className="text-sm text-muted-foreground">Core color tokens with semantic meaning</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {semanticColors.map((color) => (
              <div
                key={color.name}
                className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className={`${color.bg} ${color.text} flex h-32 items-center justify-center p-4`}>
                  <div className="text-center">
                    <p className="font-mono text-base font-bold">{color.name}</p>
                    <p className="mt-1 text-xs opacity-80">{color.bg}</p>
                  </div>
                </div>
                <div className="bg-card p-3">
                  <p className="text-xs text-muted-foreground">{color.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Utility Colors (Border, Input, Ring) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Utility Colors</h2>
            <p className="text-sm text-muted-foreground">Border, input, and focus ring colors</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {utilityColors.map((color) => (
              <div key={color.name} className="space-y-2 rounded-lg border border-border bg-card p-6">
                <div className={`h-20 rounded ${color.border} bg-background`} />
                <p className="font-mono text-sm font-semibold text-card-foreground">{color.name}</p>
                <p className="text-xs text-muted-foreground">{color.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Button Variants */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Button Variants</h2>
            <p className="text-sm text-muted-foreground">All button styles with different variants</p>
          </div>
          <div className="space-y-6 rounded-lg border border-border bg-card p-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Default Size</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Small Size</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" size="sm">Default</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Large Size</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default" size="lg">Default</Button>
                <Button variant="secondary" size="lg">Secondary</Button>
                <Button variant="destructive" size="lg">Destructive</Button>
                <Button variant="outline" size="lg">Outline</Button>
                <Button variant="ghost" size="lg">Ghost</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Text Colors */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Text Colors</h2>
            <p className="text-sm text-muted-foreground">All text color utilities</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold text-card-foreground">On Card Background</h3>
              <div className="space-y-2">
                <p className="text-card-foreground">text-card-foreground (default)</p>
                <p className="text-muted-foreground">text-muted-foreground (subtle)</p>
                <p className="text-primary">text-primary (important)</p>
                <p className="text-secondary">text-secondary (alternate)</p>
                <p className="text-accent">text-accent (highlight)</p>
                <p className="text-destructive">text-destructive (errors)</p>
              </div>
            </div>
            <div className="space-y-3 rounded-lg border border-border bg-muted p-6">
              <h3 className="font-semibold text-foreground">On Muted Background</h3>
              <div className="space-y-2">
                <p className="text-foreground">text-foreground (default)</p>
                <p className="text-muted-foreground">text-muted-foreground (subtle)</p>
                <p className="text-primary">text-primary (important)</p>
                <p className="text-secondary">text-secondary (alternate)</p>
                <p className="text-accent">text-accent (highlight)</p>
                <p className="text-destructive">text-destructive (errors)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive States */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Interactive States</h2>
            <p className="text-sm text-muted-foreground">Hover, focus, and active states</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-semibold text-card-foreground">Hover Effect</p>
              <div className="rounded bg-muted p-4 transition-colors hover:bg-accent hover:text-accent-foreground">
                Hover me
              </div>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-semibold text-card-foreground">Focus Ring</p>
              <input
                type="text"
                placeholder="Focus me"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-semibold text-card-foreground">Active State</p>
              <button className="w-full rounded bg-primary p-4 text-primary-foreground transition-opacity active:opacity-80">
                Click me
              </button>
            </div>
          </div>
        </section>

        {/* Card Examples */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Card & Popover Examples</h2>
            <p className="text-sm text-muted-foreground">Real-world component examples</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground">Card Component</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This is a standard card with card background and proper text hierarchy.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Action
              </Button>
            </div>
            <div className="rounded-lg border border-border bg-popover p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-popover-foreground">Popover Component</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This uses popover background colors for elevated UI elements.
              </p>
            </div>
            <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-6">
              <h3 className="text-lg font-semibold text-destructive">Error State</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Destructive colors for error messages and warnings.
              </p>
            </div>
          </div>
        </section>

        {/* Opacity Variations */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Opacity Variations</h2>
            <p className="text-sm text-muted-foreground">Colors at different opacity levels</p>
          </div>
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            {["primary", "secondary", "accent", "destructive"].map((color) => (
              <div key={color} className="space-y-2">
                <p className="text-sm font-semibold text-card-foreground">{color}</p>
                <div className="flex gap-2">
                  <div className={`h-16 flex-1 rounded bg-${color}/10 flex items-center justify-center text-xs`}>10%</div>
                  <div className={`h-16 flex-1 rounded bg-${color}/20 flex items-center justify-center text-xs`}>20%</div>
                  <div className={`h-16 flex-1 rounded bg-${color}/40 flex items-center justify-center text-xs`}>40%</div>
                  <div className={`h-16 flex-1 rounded bg-${color}/60 flex items-center justify-center text-xs`}>60%</div>
                  <div className={`h-16 flex-1 rounded bg-${color}/80 flex items-center justify-center text-xs`}>80%</div>
                  <div className={`h-16 flex-1 rounded bg-${color} flex items-center justify-center text-xs text-${color}-foreground`}>100%</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="pb-8 pt-4 text-center text-sm text-muted-foreground">
          Toggle dark mode to test all colors in both themes
        </div>
      </div>
    </div>
  );
}
