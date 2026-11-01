import { cn } from "@/lib/utils";

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" | "accent" }) {
  return (
    <div className={cn("rounded-xl border bg-card p-4", tone === "accent" && "border-accent bg-accent/15")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-display text-2xl font-bold", tone === "good" && "text-success", tone === "bad" && "text-destructive")}>{value}</div>
    </div>
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-4 font-display text-2xl font-bold">{children}</h1>;
}
