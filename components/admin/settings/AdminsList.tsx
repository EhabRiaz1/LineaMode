"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { cn } from "@/lib/utils";
import type { AdminRow } from "@/app/api/admin/admins/route";

export function AdminsList() {
  const { authHeaders, status, email: currentEmail } = useAdminSession();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    
    const res = await adminFetch<{ admins: AdminRow[] }>("/api/admin/admins", {
      authHeaders: authHeaders(),
    });
    
    if (res.ok) {
      setAdmins(res.data.admins);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [authHeaders, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (data: { email: string; display_name: string; is_super_admin: boolean }) => {
    setActionLoading("create");
    
    const res = await adminFetch<{ admin: AdminRow; temp_password: string }>(
      "/api/admin/admins",
      {
        authHeaders: authHeaders(),
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    
    setActionLoading(null);
    
    if (res.ok) {
      setCreatedPassword(res.data.temp_password);
      void load();
    } else {
      setError(res.error);
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm("Reset this admin's password? They will need to use the new temporary password to sign in.")) return;
    
    setActionLoading(id);
    
    const res = await adminFetch<{ temp_password: string }>(
      `/api/admin/admins/${id}/reset-password`,
      {
        authHeaders: authHeaders(),
        method: "POST",
      }
    );
    
    setActionLoading(null);
    
    if (res.ok) {
      setCreatedPassword(res.data.temp_password);
      setSuccess("Password reset successfully");
      setTimeout(() => setSuccess(null), 3000);
      void load();
    } else {
      setError(res.error);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete admin account for ${email}? This cannot be undone.`)) return;
    
    setActionLoading(id);
    
    const res = await adminFetch(
      `/api/admin/admins/${id}`,
      {
        authHeaders: authHeaders(),
        method: "DELETE",
      }
    );
    
    setActionLoading(null);
    
    if (res.ok) {
      setSuccess("Admin deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
      void load();
    } else {
      setError(res.error);
    }
  };

  const handleToggleSuperAdmin = async (id: string, currentValue: boolean) => {
    setActionLoading(id);
    
    const res = await adminFetch(
      `/api/admin/admins/${id}`,
      {
        authHeaders: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ is_super_admin: !currentValue }),
      }
    );
    
    setActionLoading(null);
    
    if (res.ok) {
      void load();
    } else {
      setError(res.error);
    }
  };

  if (loading && admins.length === 0) {
    return <p className="text-body text-ink/55">Loading admin accounts...</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-body text-moss">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-label text-ink/55">
          {admins.length} admin{admins.length !== 1 ? "s" : ""}
        </p>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors"
        >
          + Add admin
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--hairline)]">
        <table className="w-full text-left">
          <thead className="bg-ink/[0.03] text-eyebrow text-ink/55">
            <tr>
              <th className="px-5 py-3 font-normal">Admin</th>
              <th className="px-5 py-3 font-normal">Role</th>
              <th className="px-5 py-3 font-normal">Security</th>
              <th className="px-5 py-3 font-normal">Created</th>
              <th className="px-5 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isCurrentUser = admin.email === currentEmail;
              return (
                <tr
                  key={admin.id}
                  className={cn(
                    "border-t border-[var(--hairline)]",
                    isCurrentUser && "bg-ink/[0.02]"
                  )}
                >
                  <td className="px-5 py-4">
                    <p className="text-body text-ink">
                      {admin.display_name || admin.email.split("@")[0]}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-ink/10 text-ink/60">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-label text-ink/55">{admin.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => !isCurrentUser && handleToggleSuperAdmin(admin.id, admin.is_super_admin)}
                      disabled={isCurrentUser || actionLoading === admin.id}
                      className={cn(
                        "text-xs px-2.5 py-1 rounded-full transition-colors",
                        admin.is_super_admin
                          ? "bg-terracotta/10 text-terracotta"
                          : "bg-ink/5 text-ink/60",
                        !isCurrentUser && "hover:opacity-75 cursor-pointer",
                        isCurrentUser && "cursor-default"
                      )}
                    >
                      {admin.is_super_admin ? "Super Admin" : "Admin"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {admin.totp_enabled && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-moss/10 text-moss">
                          2FA
                        </span>
                      )}
                      {admin.temp_password && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600">
                          Temp password
                        </span>
                      )}
                      {!admin.totp_enabled && !admin.temp_password && (
                        <span className="text-label text-ink/45">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-label text-ink/55">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    {!isCurrentUser && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(admin.id)}
                          disabled={actionLoading === admin.id}
                          className="text-label text-ink/55 hover:text-ink px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          Reset PW
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(admin.id, admin.email)}
                          disabled={actionLoading === admin.id}
                          className="text-label text-terracotta/75 hover:text-terracotta px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CreateAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        loading={actionLoading === "create"}
      />

      <PasswordRevealModal
        password={createdPassword}
        onClose={() => setCreatedPassword(null)}
      />
    </div>
  );
}

function CreateAdminModal({
  isOpen,
  onClose,
  onCreate,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { email: string; display_name: string; is_super_admin: boolean }) => void;
  loading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ email, display_name: displayName, is_super_admin: isSuperAdmin });
  };

  const handleClose = () => {
    setEmail("");
    setDisplayName("");
    setIsSuperAdmin(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-md overflow-y-auto rounded-3xl bg-stone border border-[var(--hairline)] shadow-2xl"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--hairline)]">
                <h2 className="text-h3 text-ink">Add new admin</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="size-8 inline-flex items-center justify-center rounded-full border border-[var(--hairline)] text-ink/55 hover:text-ink hover:bg-ink/5 transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-label text-ink/55 mb-2">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                    placeholder="admin@company.com"
                  />
                </div>

                <div>
                  <label className="block text-label text-ink/55 mb-2">Display name (optional)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--hairline)] bg-stone px-4 py-2.5 text-body text-ink placeholder:text-ink/35 focus:border-ink/40 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSuperAdmin}
                    onChange={(e) => setIsSuperAdmin(e.target.checked)}
                    className="rounded border-ink/30"
                  />
                  <span className="text-label text-ink/75">
                    Grant super admin privileges
                  </span>
                </label>

                <p className="text-label text-ink/55 bg-ink/5 rounded-xl px-4 py-3">
                  A temporary password will be generated. Share it securely with the new admin.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--hairline)]">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-full border border-[var(--hairline)] px-5 py-2.5 text-label text-ink/75 hover:bg-ink/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create admin"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PasswordRevealModal({
  password,
  onClose,
}: {
  password: string | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {password && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-full md:max-w-sm overflow-y-auto rounded-3xl bg-stone border border-[var(--hairline)] shadow-2xl"
          >
            <div className="p-6 text-center space-y-4">
              <div className="size-12 mx-auto rounded-full bg-moss/10 flex items-center justify-center">
                <svg className="size-6 text-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <h3 className="text-h3 text-ink">Temporary password</h3>
              <p className="text-label text-ink/55">
                Share this password securely. It will only be shown once.
              </p>
              <div className="bg-ink/5 rounded-xl px-4 py-3 font-mono text-body text-ink select-all">
                {password}
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors"
                >
                  {copied ? "Copied!" : "Copy password"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
