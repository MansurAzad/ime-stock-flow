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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/15 via-background to-accent/20 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-2xl">📱 {t("appName")}</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setLang(lang === "bn" ? "en" : "bn")}>{lang === "bn" ? "EN" : "বাং"}</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {lang === "bn" ? "প্রথম অ্যাকাউন্টটি মালিক (Admin) হবে। সেলসম্যানদের অ্যাকাউন্ট মালিক তৈরি করে দেবেন।" : "The first account becomes the owner (Admin). The owner creates salesman accounts."}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && (
              <div className="space-y-1"><Label>{t("fullName")}</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
            )}
            <div className="space-y-1"><Label>{t("email")}</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1"><Label>{t("password")}</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button className="w-full" disabled={loading}>{mode === "in" ? t("signIn") : t("signUp")}</Button>
            <button type="button" className="w-full text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? t("signUp") : t("signIn")}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
