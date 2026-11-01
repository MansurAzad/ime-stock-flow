import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/me";
import { useT, type Key } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Package, Users, PackageOpen, HandCoins, ShoppingCart, Store, Settings2, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useBusiness } from "@/lib/business";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navIcon: Partial<Record<Key, LucideIcon>> = {
  dashboard: LayoutDashboard,
  products: Package,
  salesmen: Users,
  stockIssue: PackageOpen,
  settlement: HandCoins,
  sales: ShoppingCart,
  retailers: Store,
};

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

const adminNav: { to: string; k: Key }[] = [
  { to: "/dashboard", k: "dashboard" },
  { to: "/products", k: "products" },
  { to: "/salesmen", k: "salesmen" },
  { to: "/stock-issue", k: "stockIssue" },
  { to: "/settlement", k: "settlement" },
  { to: "/retailers", k: "retailers" },
];
const salesNav: { to: string; k: Key }[] = [
  { to: "/dashboard", k: "dashboard" },
  { to: "/sales", k: "sales" },
  { to: "/retailers", k: "retailers" },
  { to: "/settlement", k: "settlement" },
];

function Layout() {
  const { data: me } = useMe();
  const { t, lang, setLang } = useT();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const nav = me?.isAdmin ? adminNav : salesNav;
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="font-display text-lg font-bold">📱 {t("appName")}</span>
          <nav className="ml-4 hidden gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md px-3 py-1.5 text-sm hover:bg-primary-foreground/10" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                {t(n.k)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs opacity-80 sm:inline">{me?.profile?.full_name || me?.email} · {me?.isAdmin ? "Admin" : "Salesman"}</span>
            <Button size="sm" variant="secondary" onClick={() => setLang(lang === "bn" ? "en" : "bn")}>{lang === "bn" ? "EN" : "বাং"}</Button>
            <Button size="sm" variant="secondary" onClick={signOut}>{t("signOut")}</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{me ? <Outlet /> : null}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] md:hidden">
        {nav.map((n) => {
          const Icon = navIcon[n.k] ?? LayoutDashboard;
          return (
            <Link
              key={n.to}
              to={n.to}
              className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[11px] text-muted-foreground"
              activeProps={{ className: "font-bold text-primary" }}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-tight">{t(n.k)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
