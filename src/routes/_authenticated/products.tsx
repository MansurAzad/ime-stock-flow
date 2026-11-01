import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProducts } from "@/lib/me";
import { useT } from "@/lib/i18n";
import { isValidImeiFormat, money } from "@/lib/imei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageTitle } from "@/components/Stat";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({ meta: [{ title: "প্রোডাক্ট — মোবাইল হিসাব" }] }),
  component: Products,
});

function Products() {
  const { t } = useT();
  const qc = useQueryClient();
  const { data: products = [] } = useProducts();
  const { data: counts = {} } = useQuery({
    queryKey: ["imei-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("imei_units").select("product_id").eq("status", "in_stock");
      const m: Record<string, number> = {};
      for (const r of data ?? []) m[r.product_id] = (m[r.product_id] ?? 0) + 1;
      return m;
    },
  });
  const [f, setF] = useState({ name: "", model: "", price: "", is_smartphone: true, stock_qty: "" });
  const [imeiFor, setImeiFor] = useState<string | null>(null);
  const [imeiText, setImeiText] = useState("");
  const [addQty, setAddQty] = useState<Record<string, string>>({});
  const refresh = () => { qc.invalidateQueries({ queryKey: ["products"] }); qc.invalidateQueries({ queryKey: ["imei-counts"] }); };

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("products").insert({
      name: f.name, model: f.model || null, price: Number(f.price || 0), is_smartphone: f.is_smartphone,
      stock_qty: f.is_smartphone ? 0 : Number(f.stock_qty || 0),
    });
    if (error) return toast.error(error.message);
    setF({ name: "", model: "", price: "", is_smartphone: true, stock_qty: "" });
    refresh();
  }

  async function saveImeis() {
    const list = [...new Set(imeiText.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean))];
    const bad = list.filter((i) => !isValidImeiFormat(i));
    if (bad.length) { navigator.vibrate?.(300); return toast.error(`${t("imeiWrong")} ${bad.join(", ")}`); }
    const { error } = await supabase.from("imei_units").insert(list.map((imei) => ({ imei, product_id: imeiFor! })));
    if (error) return toast.error(error.message);
    toast.success(`${list.length} IMEI ${t("done")}`);
    setImeiFor(null); setImeiText(""); refresh();
  }

  async function addStock(id: string, current: number) {
    const n = Number(addQty[id] || 0);
    if (!n) return;
    const { error } = await supabase.from("products").update({ stock_qty: current + n }).eq("id", id);
    if (error) return toast.error(error.message);
    setAddQty({ ...addQty, [id]: "" }); refresh();
  }

  return (
    <div className="space-y-6">
      <PageTitle>{t("products")}</PageTitle>
      <form onSubmit={add} className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-6">
        <Input required placeholder={t("name")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input placeholder={t("model")} value={f.model} onChange={(e) => setF({ ...f, model: e.target.value })} />
        <Input required type="number" placeholder={t("price")} value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><Switch checked={f.is_smartphone} onCheckedChange={(v) => setF({ ...f, is_smartphone: v })} />{f.is_smartphone ? t("smartphone") : t("buttonPhone")}</label>
        {!f.is_smartphone ? <Input type="number" placeholder={t("stock")} value={f.stock_qty} onChange={(e) => setF({ ...f, stock_qty: e.target.value })} /> : <div />}
        <Button>{t("add")}</Button>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {products.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-lg font-bold">{p.name} <span className="text-sm font-normal text-muted-foreground">{p.model}</span></div>
                <div className="text-sm text-muted-foreground">{p.is_smartphone ? t("smartphone") : t("buttonPhone")} · {money(p.price)}</div>
              </div>
              <div className="text-right"><div className="text-xs text-muted-foreground">{t("stock")}</div><div className="font-display text-2xl font-bold">{p.is_smartphone ? counts[p.id] ?? 0 : p.stock_qty}</div></div>
            </div>
            <div className="mt-3 flex gap-2">
              {p.is_smartphone ? (
                <Button size="sm" variant="secondary" onClick={() => setImeiFor(p.id)}>{t("addImei")}</Button>
              ) : (
                <>
                  <Input className="h-8 w-24" type="number" value={addQty[p.id] ?? ""} onChange={(e) => setAddQty({ ...addQty, [p.id]: e.target.value })} />
                  <Button size="sm" variant="secondary" onClick={() => addStock(p.id, p.stock_qty)}>+ {t("stock")}</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!imeiFor} onOpenChange={(o) => !o && setImeiFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("addImei")}</DialogTitle></DialogHeader>
          <Label>{t("imeiList")}</Label>
          <Textarea rows={8} value={imeiText} onChange={(e) => setImeiText(e.target.value)} />
          <Button onClick={saveImeis}>{t("save")}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
