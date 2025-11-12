import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../pic/aramco_digital_logo_transparent-removebg-preview.png";
import useCurrentUser from "@/hooks/useCurrentUser";
import { updateActiveUser } from "@/lib/usersStore";

const initialFormState = {
  name: "",
  email: "",
  department: "",
  role: "",
  employeeId: ""
};

const dotPlaceholder = "...........";

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = useCurrentUser();
  const [form, setForm] = useState(initialFormState);
  const [avatar, setAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const placeholderInitial = (form.name?.trim()?.[0] ?? "A").toUpperCase();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        department: user.department ?? "",
        role: user.role ?? "",
        employeeId: user.employeeId ?? ""
      });
      setAvatar(user.avatarUrl ?? "");
    }
  }, [user]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (isSaving) {
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      updateActiveUser({
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim(),
        role: form.role.trim(),
        employeeId: form.employeeId.trim(),
        avatarUrl: avatar
      });
      setIsSaving(false);
      navigate("/profile", { replace: true });
    }, 200);
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <section
      className="min-h-[88vh] w-full flex justify-center items-center px-6 py-10 font-[Inter,ui-sans-serif]"
      style={{ background: "#FFFFFF" }}
    >
      <div className="relative w-full max-w-[1200px] overflow-hidden rounded-[28px] min-h-[520px]">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(135% 100% at 72% 45%, #FFFFFF 0%, #F4F6FF 18%, #DDE6FB 36%, #A9C1F4 56%, #6FA1E6 76%, #3C76C9 92%, #29A366 100%)"
          }}
        />

        <div className="relative z-10 flex h-full flex-col px-10 pt-8 pb-12">
          <header className="flex items-center justify-between">
            <img src={logo} alt="Aramco Digital" className="h-14 md:h-16 w-auto" />
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-[#1F2937] shadow-sm transition hover:bg-white"
            >
              <span aria-hidden="true">‹</span>
              Back
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center py-10">
            <div className="w-full max-w-[640px]">
              <section className="rounded-[26px] border border-white/70 bg-white/85 backdrop-blur-sm px-10 py-10 shadow-[0_20px_45px_rgba(31,41,55,0.08)]">
                <div className="flex flex-col items-center gap-8 text-center">
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/70 shadow-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] focus:ring-offset-transparent"
                  >
                    {avatar ? (
                      <img src={avatar} alt="Profile avatar preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white text-3xl font-semibold text-[#1A1A1A]">
                        {placeholderInitial}
                      </div>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white text-sm opacity-0 group-hover:opacity-100 transition">
                      Change Photo
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />

                  <div className="w-full space-y-5 text-left">
                    <Field
                      label="Name"
                      value={form.name}
                      placeholder={dotPlaceholder}
                      onChange={handleInputChange("name")}
                    />
                    <Field
                      label="Email"
                      value={form.email}
                      placeholder={dotPlaceholder}
                      onChange={handleInputChange("email")}
                    />
                    <Field
                      label="Department"
                      value={form.department}
                      placeholder={dotPlaceholder}
                      onChange={handleInputChange("department")}
                    />
                    <Field
                      label="Role"
                      value={form.role}
                      placeholder={dotPlaceholder}
                      onChange={handleInputChange("role")}
                    />
                    <Field
                      label="Employee ID"
                      value={form.employeeId}
                      placeholder={dotPlaceholder}
                      onChange={handleInputChange("employeeId")}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full sm:w-40 rounded-full border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-semibold text-[#374151] shadow-sm transition hover:bg-[#F3F4F6]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full sm:w-40 rounded-full bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#1D4ED8] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-70"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-12 rounded-full border border-[#E5E7EB] bg-white px-5 text-base text-[#111827] shadow-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition"
      />
    </label>
  );
}


