import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useRetailers } from "@/lib/me";
import { useT } from "@/lib/i18n";
import { money } from "@/lib/imei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTitle } from "@/components/Stat";

export const Route = createFileRoute("/_authenticated/retailers")({
  head: () => ({ meta: [{ title: "রিটেইলার লেজার — মোবাইল হিসাব" }] }),
  component: Retailers,
});

function Retailers() {
  const { t } = useT();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { data: retailers = [] } = useRetailers();
  const [f, setF] = useState({ name: "", phone: "", address: "" });
  const [open, setOpen] = useState<string | null>(null);
  const { data: ledger } = useQuery({
    queryKey: ["ledger"],
    queryFn: async () => {
      const [s, p] = await Promise.all([
        supabase.from("sales").select("*").order("created_at", { ascending: false }),
        supabase.from("retailer_payments").select("*").order("created_at", { ascending: false }),
      ]);
      return { sales: s.data ?? [], pays: p.data ?? [] };
    },
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("retailers").insert({ ...f, salesman_id: me!.id });
    if (error) { toast.error(error.message); return; }
    setF({ name: "", phone: "", address: "" });
    qc.invalidateQueries({ queryKey: ["retailers"] });
  }

  return (
    <div className="space-y-6">
      <PageTitle>{t("retailers")} · {t("ledger")}</PageTitle>
      {!me?.isAdmin && (
        <form onSubmit={add} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
          <Input required placeholder={t("name")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input placeholder={t("phone")} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <Input placeholder="Address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
          <Button>{t("add")}</Button>
        </form>
      )}
      <div className="space-y-3">
        {retailers.map((r) => {
          const sales = ledger?.sales.filter((s) => s.retailer_id === r.id) ?? [];
          const pays = ledger?.pays.filter((p) => p.retailer_id === r.id) ?? [];
          const total = sales.reduce((a, s) => a + Number(s.total), 0);
          const paid = sales.reduce((a, s) => a + Number(s.paid), 0) + pays.reduce((a, p) => a + Number(p.amount), 0);
          return (
            <div key={r.id} className="rounded-xl border bg-card p-4">
              <button className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpen(open === r.id ? null : r.id)}>
                <div className="flex-1"><div className="font-display font-bold">{r.name}</div><div className="text-xs text-muted-foreground">{r.phone} {r.address}</div></div>
                <span className="text-sm">{t("total")}: {money(total)}</span>
                <span className="text-sm text-success">{t("paid")}: {money(paid)}</span>
                <span className="font-bold text-destructive">{t("due")}: {money(total - paid)}</span>
              </button>
              {open === r.id && (
                <div className="mt-3 space-y-3 border-t pt-3">
                  {!me?.isAdmin && <PaymentForm retailerId={r.id} max={total - paid} />}
                  <div className="space-y-1 text-sm">
                    {[...sales.map((s) => ({ at: s.created_at, txt: `${t("sales")} ${money(s.total)} · ${t("paid")} ${money(s.paid)}` })),
                      ...pays.map((p) => ({ at: p.created_at, txt: `${t("collectPayment")} ${money(p.amount)}` }))]
                      .sort((a, b) => b.at.localeCompare(a.at))
                      .map((x, i) => <div key={i} className="flex justify-between rounded bg-muted px-2 py-1"><span>{x.txt}</span><span className="text-muted-foreground">{new Date(x.at).toLocaleDateString()}</span></div>)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {retailers.length === 0 && <p className="text-muted-foreground">{t("noData")}</p>}
      </div>
    </div>
  );
}

function PaymentForm({ retailerId, max }: { retailerId: string; max: number }) {
  const { t } = useT();
  const qc = useQueryClient();
  const [amt, setAmt] = useState("");
  async function pay(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(amt);
    if (n <= 0 || n > max) { toast.error(`${t("due")}: ${money(max)}`); return; }
    const { error } = await supabase.from("retailer_payments").insert({ retailer_id: retailerId, amount: n });
    if (error) { toast.error(error.message); return; }
    setAmt(""); toast.success(t("done"));
    qc.invalidateQueries();
  }
  return (
    <form onSubmit={pay} className="flex gap-2">
      <Input type="number" placeholder={t("amount")} value={amt} onChange={(e) => setAmt(e.target.value)} />
      <Button>{t("collectPayment")}</Button>
    </form>
  );
}
