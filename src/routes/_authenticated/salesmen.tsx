import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSalesmen, requireAdmin } from "@/lib/me";
import { useT } from "@/lib/i18n";
import { createSalesman } from "@/lib/salesmen.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageTitle } from "@/components/Stat";
import { SalesmanSummary } from "@/components/SalesmanSummary";

export const Route = createFileRoute("/_authenticated/salesmen")({
  beforeLoad: requireAdmin,
  head: () => ({ meta: [{ title: "সেলসম্যান — মোবাইল হিসাব" }] }),
  component: Salesmen,
});

function Salesmen() {
  const { t } = useT();
  const qc = useQueryClient();
  const create = useServerFn(createSalesman);
  const { data: list = [] } = useSalesmen();
  const [f, setF] = useState({ full_name: "", phone: "", email: "", password: "" });
  const [open, setOpen] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create({ data: f });
      toast.success(t("done"));
      setF({ full_name: "", phone: "", email: "", password: "" });
      qc.invalidateQueries({ queryKey: ["salesmen"] });
    } catch (err) { toast.error((err as Error).message); }
  }
  async function toggle(id: string, active: boolean) {
    await supabase.from("profiles").update({ active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["salesmen"] });
  }

  return (
    <div className="space-y-6">
      <PageTitle>{t("salesmen")}</PageTitle>
      <form onSubmit={add} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-5">
        <Input required placeholder={t("fullName")} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} />
        <Input placeholder={t("phone")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <Input required type="email" placeholder={t("email")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input required minLength={6} placeholder={t("password")} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Button>{t("newSalesman")}</Button>
      </form>
      <div className="space-y-3">
        {list.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <button className="flex-1 text-left" onClick={() => setOpen(open === s.id ? null : s.id)}>
                <div className="font-display font-bold">{s.full_name}</div>
                <div className="text-sm text-muted-foreground">{s.phone}</div>
              </button>
              <label className="flex items-center gap-2 text-sm">{t("active")}<Switch checked={s.active} onCheckedChange={(v) => toggle(s.id, v)} /></label>
            </div>
            {open === s.id && <div className="mt-4"><SalesmanSummary salesmanId={s.id} /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
