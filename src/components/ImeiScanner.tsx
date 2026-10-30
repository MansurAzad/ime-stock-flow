import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { extractImei, isValidImeiFormat, signalFeedback } from "@/lib/imei";
import { cn } from "@/lib/utils";

export type ScanResult = { ok: boolean; message?: string };

/**
 * Camera + manual IMEI input. `validate` decides if the IMEI is acceptable;
 * wrong → red flash + vibration, right → green flash, no vibration.
 */
export function ImeiScanner({ validate }: { validate: (imei: string) => Promise<ScanResult> }) {
  const { t } = useT();
  const [signal, setSignal] = useState<null | { ok: boolean; text: string }>(null);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const busy = useRef(false);
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const elId = useRef("scan-" + Math.random().toString(36).slice(2)).current;

  async function handle(raw: string) {
    const imei = extractImei(raw);
    const now = Date.now();
    if (busy.current || (lastRef.current.code === imei && now - lastRef.current.at < 2500)) return;
    lastRef.current = { code: imei, at: now };
    busy.current = true;
    try {
      let res: ScanResult;
      if (!isValidImeiFormat(imei)) res = { ok: false, message: "IMEI format" };
      else res = await validate(imei);
      signalFeedback(res.ok);
      setSignal({ ok: res.ok, text: `${res.ok ? t("imeiOk") : t("imeiWrong")} ${imei}${res.message ? " — " + res.message : ""}` });
    } finally {
      busy.current = false;
    }
  }

  async function start() {
    const { Html5Qrcode } = await import("html5-qrcode");
    const s = new Html5Qrcode(elId);
    await s.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 280, height: 120 } }, (txt) => void handle(txt), () => {});
    scannerRef.current = { stop: () => s.stop() };
    setScanning(true);
  }
  async function stop() {
    await scannerRef.current?.stop().catch(() => {});
    scannerRef.current = null;
    setScanning(false);
  }
  useEffect(() => () => void scannerRef.current?.stop().catch(() => {}), []);

  return (
    <div className="space-y-2">
      <div id={elId} className={cn("overflow-hidden rounded-lg", scanning && "border")} />
      <div className="flex gap-2">
        <Button type="button" variant={scanning ? "outline" : "default"} onClick={() => (scanning ? stop() : start().catch((e) => setSignal({ ok: false, text: String(e) })))}>
          {scanning ? t("stopScan") : t("scan")}
        </Button>
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (manual.trim()) void handle(manual.trim()).then(() => setManual(""));
          }}
        >
          <Input inputMode="numeric" placeholder={t("typeImei")} value={manual} onChange={(e) => setManual(e.target.value)} />
          <Button type="submit" variant="secondary">{t("add")}</Button>
        </form>
      </div>
      {signal && (
        <div
          role="status"
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
            signal.ok ? "bg-success text-success-foreground" : "animate-pulse bg-destructive text-destructive-foreground",
          )}
        >
          {signal.ok ? "● " : "✖ "}
          {signal.text}
        </div>
      )}
    </div>
  );
}
