"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Card } from "@/components/Card";
import { ConfirmModal } from "@/components/ConfirmModal";
import { LoadingButton } from "@/components/Loading";
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
    <Card title="Update Profile">
      {loading ? <div className="placeholder-glow"><span className="placeholder col-6 mb-3" /><span className="placeholder col-12 mb-3" /><span className="placeholder col-12" /></div> : (
        <form onSubmit={submit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-control" required minLength={2} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-control" required />
          </div>
          {message && <div className="col-12"><div className="alert alert-success py-2">{message}</div></div>}
          {error && <div className="col-12"><div className="alert alert-danger py-2">{error}</div></div>}
          <div className="col-12">
            <LoadingButton loading={saving} type="submit">Update Profile</LoadingButton>
          </div>
        </form>
      )}
      <ConfirmModal open={confirm} message="Are you sure you want to update this record?" confirmText="Update" loading={saving} onConfirm={save} onCancel={() => setConfirm(false)} />
    </Card>
  );
}
