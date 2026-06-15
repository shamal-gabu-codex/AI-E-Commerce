"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingButton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { authService } from "@/services/authService";

export default function ProfilePage() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    authService.me()
      .then((r) => setForm({ name: r.data.name, email: r.data.email }))
      .catch(() => setError("Unable to load profile. Please login again."))
      .finally(() => setLoading(false));
  }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!form.name.trim() || !form.email.includes("@")) {
      setError("Please enter a valid name and email.");
      return;
    }
    setConfirm(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await authService.updateProfile(form);
      setForm({ name: res.data.name, email: res.data.email });
      setMessage("Profile updated successfully.");
      setConfirm(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Profile update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Profile" subtitle="Manage your account details" />
      <Card title="Update Profile">
        {loading ? <div className="placeholder-glow"><span className="placeholder col-6 mb-3" /><span className="placeholder col-12 mb-3" /><span className="placeholder col-12" /></div> : (
          <form onSubmit={submit} className="space-y-4">
            <div className="theme-form-grid">
            <div className="theme-field">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-control" required minLength={2} />
            </div>
            <div className="theme-field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-control" required />
            </div>
            </div>
            {message && <div className="theme-alert success py-2">{message}</div>}
            {error && <div className="theme-alert danger py-2">{error}</div>}
            <div className="border-t border-line pt-4">
              <LoadingButton loading={saving} type="submit">Update Profile</LoadingButton>
            </div>
          </form>
        )}
        <ConfirmModal open={confirm} message="Are you sure you want to update this record?" confirmText="Update" loading={saving} onConfirm={save} onCancel={() => setConfirm(false)} />
      </Card>
    </div>
  );
}
