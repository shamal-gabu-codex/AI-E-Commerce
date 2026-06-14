"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingButton } from "@/components/Loading";
import { PageHeader } from "@/components/PageHeader";
import { authService } from "@/services/authService";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [confirm, setConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (form.new_password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError("New password and confirm password do not match.");
      return;
    }
    setConfirm(true);
  }

  async function save() {
    setSaving(true);
    try {
      await authService.changePassword(form);
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      setMessage("Password changed successfully.");
      setConfirm(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Password update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Password" subtitle="Update your account password" />
      <Card title="Change Password">
        <form onSubmit={submit} className="space-y-4">
        <div className="theme-form-grid">
        <div className="theme-field">
          <label>Current Password</label>
          <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} className="form-control" required />
        </div>
        <div className="theme-field">
          <label>New Password</label>
          <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} className="form-control" required minLength={6} />
        </div>
        <div className="theme-field">
          <label>Confirm Password</label>
          <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} className="form-control" required minLength={6} />
        </div>
        </div>
        {message && <div className="theme-alert success py-2">{message}</div>}
        {error && <div className="theme-alert danger py-2">{error}</div>}
        <div className="border-t border-line pt-4">
          <LoadingButton loading={saving} type="submit">Change Password</LoadingButton>
        </div>
        </form>
        <ConfirmModal open={confirm} message="Are you sure you want to update your password?" confirmText="Update Password" loading={saving} onConfirm={save} onCancel={() => setConfirm(false)} />
      </Card>
    </div>
  );
}
