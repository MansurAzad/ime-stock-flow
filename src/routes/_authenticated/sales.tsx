import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useRetailers, useSalesmanSummary } from "@/lib/me";
import { useT } from "@/lib/i18n";
import { money } from "@/lib/imei";
import { CartBuilder, type CartLine } from "@/components/CartBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageTitle } from "@/components/Stat";

export const Route = createFileRoute("/_authenticated/sales")({
  head: () => ({ meta: [{ title: "বিক্রি — মোবাইল হিসাব" }] }),
  component: Sales,
});

function Sales() {
  const { t } = useT();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { data: retailers = [] } = useRetailers();
  const { data: summary } = useSalesmanSummary(me?.id);
  const [rid, setRid] = useState("");
  const [paid, setPaid] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const total = cart.reduce((a, l) => a + l.qty * l.unit_price, 0);
  const held = summary?.products.filter((p) => p.hand > 0).map((p) => p.product_id) ?? [];

  async function submit() {
    const { error } = await supabase.rpc("record_sale", {
      _retailer: rid,
      _items: cart.map((l) => ({ product_id: l.product_id, qty: l.qty, unit_price: l.unit_price, imeis: l.imeis })),
      _paid: Number(paid || 0),
    });
    if (error) return toast.error(error.message);
    toast.success(t("done"));
    setCart([]); setPaid("");
    qc.invalidateQueries();
  }

  if (!me) return null;
  return (
    <div className="space-y-4">
      <PageTitle>{t("sales")}</PageTitle>
      <Select value={rid} onValueChange={setRid}>
        <SelectTrigger className="w-72"><SelectValue placeholder={t("selectRetailer")} /></SelectTrigger>
        <SelectContent>{retailers.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
      </Select>
      <CartBuilder mode="sale" salesmanId={me.id} cart={cart} setCart={setCart} editPrice onlyProductIds={held} />
      <div className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-1"><Label>{t("paid")}</Label><Input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} /></div>
        <div className="text-right"><div className="text-xs text-muted-foreground">{t("due")}</div><div className="font-display text-2xl font-bold text-destructive">{money(total - Number(paid || 0))}</div></div>
      </div>
      <Button size="lg" className="w-full" disabled={!rid || !cart.length || Number(paid || 0) > total} onClick={submit}>{t("confirm")}</Button>
    </div>
  );
}
