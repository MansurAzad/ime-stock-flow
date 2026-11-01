import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import logoAsset from "@/assets/firoza-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => pageHead("লগইন", "Sign in to FIROZA ENTERPRISE Product Distribution Management. KONABARI, GAZIPUR. MOBILE- 01817122232."),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard" });
        else toast.success(lang === "bn" ? "ইমেইল চেক করে অ্যাকাউন্ট নিশ্চিত করুন" : "Check your email to confirm your account");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md rounded-lg border-t-4 border-t-primary shadow-sm">
        <CardHeader>
          <div className="mb-1 flex justify-center">
            <img src={logoAsset.url} alt={t("companyName")} className="h-20 w-20 rounded-lg object-contain" />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <div className="break-words font-display text-xl font-bold text-primary sm:text-2xl">{t("companyName")}</div>
              <CardTitle className="mt-2 break-words text-lg leading-relaxed">{t("appName")}</CardTitle>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setLang(lang === "bn" ? "en" : "bn")}>{lang === "bn" ? "EN" : "বাং"}</Button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{t("companyAddress")}<br />{t("companyPhone")}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && (
              <div className="space-y-1"><Label>{t("fullName")}</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
            )}
            <div className="space-y-1"><Label>{t("email")}</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1"><Label>{t("password")}</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button className="w-full" disabled={loading}>{mode === "in" ? t("signIn") : t("signUp")}</Button>
            <Button type="button" variant="link" className="w-full" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? t("signUp") : t("signIn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
