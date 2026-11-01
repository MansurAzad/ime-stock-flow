import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/me";
import { useT, type Key } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Package, Users, PackageOpen, HandCoins, ShoppingCart, Store, Settings2, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useBusiness } from "@/lib/business";
import { useOnline, usePendingSyncCount } from "@/lib/offline";
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
    // Local session read (no network round-trip per navigation); RLS still enforces access server-side.
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
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
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-4">
          <div className="min-w-0">
            <div className="break-words font-display text-base font-bold sm:text-lg">{t("companyName")}</div>
            <div className="break-words text-xs leading-relaxed opacity-90 sm:text-sm">{t("appName")}</div>
            <div className="hidden text-xs opacity-80 sm:block">{t("companyAddress")} · {t("companyPhone")}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <SyncBadge />
            <BusinessSettings />
            <Button size="sm" variant="secondary" onClick={() => setLang(lang === "bn" ? "en" : "bn")}>{lang === "bn" ? "EN" : "বাং"}</Button>
            <Button size="sm" variant="secondary" className="px-2" onClick={signOut}>{t("signOut")}</Button>
          </div>
          <nav className="col-span-2 hidden flex-wrap gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md px-3 py-1.5 text-sm hover:bg-primary-foreground/10" activeProps={{ className: "bg-accent text-accent-foreground" }}>
                {t(n.k)}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-6xl px-3 py-5 sm:px-4">{me ? <Outlet /> : null}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid auto-cols-fr grid-flow-col border-t bg-card pb-[env(safe-area-inset-bottom)] shadow-sm md:hidden">
        {nav.map((n) => {
          const Icon = navIcon[n.k] ?? LayoutDashboard;
          return (
            <Link
              key={n.to}
              to={n.to}
              className="flex min-w-0 flex-col items-center gap-1 px-0.5 py-3 text-[10px] text-muted-foreground sm:text-xs"
              activeProps={{ className: "font-bold text-primary" }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="break-words text-center leading-tight">{t(n.k)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function BusinessSettings() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [business, saveBusiness] = useBusiness();
  const [f, setF] = useState(business);
  return (
    <>
      <Button size="sm" variant="secondary" title={t("businessInfo")} onClick={() => { setF(business); setOpen(true); }}>
        <Settings2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("businessInfo")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>{t("name")}</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>{t("address")}</Label><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
            <div className="space-y-1"><Label>{t("phone")}</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
            <Button className="w-full" onClick={() => { saveBusiness(f); setOpen(false); }}>{t("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
