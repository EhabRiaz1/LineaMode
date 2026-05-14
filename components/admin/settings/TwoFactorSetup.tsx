"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCodeGenerator from "qrcode";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

type SetupState = "idle" | "setup" | "verify" | "disable";

export function TwoFactorSetup() {
  const { authHeaders, status } = useAdminSession();
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupState, setSetupState] = useState<SetupState>("idle");
  const [secret, setSecret] = useState<string | null>(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const formattedSecret = secret?.match(/.{1,4}/g)?.join(" ") ?? "";

  const loadStatus = useCallback(async () => {
    if (status !== "authenticated") return;
    
    const res = await adminFetch<{ totp_enabled: boolean }>(
      "/api/admin/2fa/status",
      { authHeaders: authHeaders() }
    );
    
    if (res.ok) {
      setTotpEnabled(res.data.totp_enabled);
    }
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    const id = window.setTimeout(() => void loadStatus(), 0);
    return () => window.clearTimeout(id);
  }, [loadStatus]);

  const startSetup = async () => {
    setActionLoading(true);
    setError(null);
    
    const res = await adminFetch<{ secret: string; otpauth_url: string }>(
      "/api/admin/2fa/setup",
      {
        authHeaders: authHeaders(),
        method: "POST",
      }
    );
    
    setActionLoading(false);
    
    if (res.ok) {
      setSecret(res.data.secret);
      setOtpAuthUrl(res.data.otpauth_url);
      setSetupState("verify");
    } else {
      setError(res.error);
    }
  };

  const verifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    const res = await adminFetch<{ totp_enabled: boolean }>(
      "/api/admin/2fa/verify",
      {
        authHeaders: authHeaders(),
        method: "POST",
        body: JSON.stringify({ code: verifyCode }),
      }
    );
    
    setActionLoading(false);
    
    if (res.ok) {
      setTotpEnabled(true);
      setSetupState("idle");
      setSuccess("Two-factor authentication enabled successfully");
      setVerifyCode("");
      setSecret(null);
      setOtpAuthUrl(null);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.error);
    }
  };

  const disable2FA = async () => {
    if (verifyCode.length !== 6) {
      setError("Please enter a 6-digit code to disable 2FA");
      return;
    }
    
    setActionLoading(true);
    setError(null);
    
    const res = await adminFetch(
      "/api/admin/2fa/disable",
      {
        authHeaders: authHeaders(),
        method: "POST",
        body: JSON.stringify({ code: verifyCode }),
      }
    );
    
    setActionLoading(false);
    
    if (res.ok) {
      setTotpEnabled(false);
      setSetupState("idle");
      setSuccess("Two-factor authentication disabled");
      setVerifyCode("");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.error);
    }
  };

  if (loading) {
    return <p className="text-body text-ink/55">Loading security settings...</p>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-body text-moss">
          {success}
        </div>
      )}

      <div className="rounded-3xl border border-[var(--hairline)] bg-stone p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "size-12 rounded-2xl flex items-center justify-center flex-shrink-0",
            totpEnabled ? "bg-moss/10" : "bg-ink/5"
          )}>
            <svg
              className={cn("size-6", totpEnabled ? "text-moss" : "text-ink/45")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-h3 text-ink">Two-Factor Authentication</h3>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  totpEnabled
                    ? "bg-moss/10 text-moss"
                    : "bg-ink/10 text-ink/55"
                )}
              >
                {totpEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-body text-ink/65 mt-1">
              Add an extra layer of security by requiring a code from your authenticator app when signing in.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {setupState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-[var(--hairline)]"
            >
              {totpEnabled ? (
                <button
                  type="button"
                  onClick={() => setSetupState("disable")}
                  className="rounded-full border border-terracotta/30 text-terracotta px-5 py-2.5 text-label hover:bg-terracotta/5 transition-colors"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startSetup}
                  disabled={actionLoading}
                  className="rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? "Setting up..." : "Enable 2FA"}
                </button>
              )}
            </motion.div>
          )}

          {setupState === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-[var(--hairline)] space-y-6"
            >
              <div>
                <p className="text-label text-ink/55 mb-3">
                  1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="bg-white p-4 rounded-2xl inline-block">
                  <QRCode data={otpAuthUrl ?? ""} size={160} />
                </div>
              </div>

              <div>
                <p className="text-label text-ink/55 mb-2">
                  Or enter this secret manually:
                </p>
                <code className="block bg-ink/5 rounded-xl px-4 py-3 text-body font-mono text-ink break-all">
                  {formattedSecret}
                </code>
              </div>

              <div>
                <p className="text-label text-ink/55 mb-2">
                  2. Enter the 6-digit code from your authenticator app:
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-3 text-body text-ink text-center font-mono text-2xl tracking-[0.5em] placeholder:text-ink/25 focus:border-ink/40 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSetupState("idle");
                    setVerifyCode("");
                    setSecret(null);
                    setOtpAuthUrl(null);
                    setError(null);
                  }}
                  className="rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={verifyAndEnable}
                  disabled={actionLoading || verifyCode.length !== 6}
                  className="rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? "Verifying..." : "Verify and enable"}
                </button>
              </div>
            </motion.div>
          )}

          {setupState === "disable" && (
            <motion.div
              key="disable"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-[var(--hairline)] space-y-4"
            >
              <p className="text-body text-ink/65">
                Enter a code from your authenticator app to confirm disabling 2FA.
              </p>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-3 text-body text-ink text-center font-mono text-2xl tracking-[0.5em] placeholder:text-ink/25 focus:border-ink/40 focus:outline-none transition-colors"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSetupState("idle");
                    setVerifyCode("");
                    setError(null);
                  }}
                  className="rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={disable2FA}
                  disabled={actionLoading || verifyCode.length !== 6}
                  className="rounded-full bg-terracotta text-stone px-5 py-2.5 text-label hover:bg-terracotta/90 transition-colors disabled:opacity-60"
                >
                  {actionLoading ? "Disabling..." : "Disable 2FA"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-label text-ink/45 text-center">
        We recommend using apps like Google Authenticator, Authy, or 1Password for 2FA codes.
      </p>
    </div>
  );
}

function QRCode({ data, size = 160 }: { data: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      const id = window.setTimeout(() => setSvg(null), 0);
      return () => window.clearTimeout(id);
    }

    let cancelled = false;
    QRCodeGenerator.toString(data, {
      type: "svg",
      width: size,
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((nextSvg) => {
        if (!cancelled) setSvg(nextSvg);
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });

    return () => {
      cancelled = true;
    };
  }, [data, size]);

  if (!svg) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-ink/10 rounded animate-pulse"
      />
    );
  }

  return (
    <div
      aria-label="QR Code for 2FA setup"
      role="img"
      className="rounded"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
