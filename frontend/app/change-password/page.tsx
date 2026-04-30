"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingButton } from "@/components/Loading";
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
    <Card title="Change Password">
      <form onSubmit={submit} className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Current Password</label>
          <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} className="form-control" required />
        </div>
        <div className="col-md-4">
          <label className="form-label">New Password</label>
          <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} className="form-control" required minLength={6} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Confirm Password</label>
          <input type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} className="form-control" required minLength={6} />
        </div>
        {message && <div className="col-12"><div className="alert alert-success py-2">{message}</div></div>}
        {error && <div className="col-12"><div className="alert alert-danger py-2">{error}</div></div>}
        <div className="col-12">
          <LoadingButton loading={saving} type="submit">Change Password</LoadingButton>
        </div>
      </form>
      <ConfirmModal open={confirm} message="Are you sure you want to update your password?" confirmText="Update Password" loading={saving} onConfirm={save} onCancel={() => setConfirm(false)} />
    </Card>
  );
}
