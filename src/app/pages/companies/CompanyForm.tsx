// CompanyForm.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Building2, Save, User, MapPin } from "lucide-react";
import { useStore } from "../../data/store";
import { registerCompany } from "../../../services/companyService";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
];

export function CompanyForm() {
  const navigate   = useNavigate();
  const addCompany = useStore((state) => state.addCompany); // ✅ Zustand selector
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const [form, setForm] = useState({
    name:               "",
    email:              "",
    phone:              "",
    address:            "",
    city:               "",
    state:              "",
    country:            "India",
    pincode:            "",
    gstNumber:          "",
    contactPerson:      "",
    contactPersonPhone: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  const payload = {
    companyName:        form.name,
    email:              form.email,
    phone:              form.phone,
    address:            form.address,
    city:               form.city,
    state:              form.state,
    country:            form.country,
    pincode:            form.pincode,
    gstNumber:          form.gstNumber,
    contactPersonName:  form.contactPerson,
    contactPersonPhone: form.contactPersonPhone,
  };

  console.log("🚀 STEP 1: Submit clicked, payload ready:", payload);

  try {
    console.log("🌐 STEP 2: Sending request to backend...");
    
    const response = await registerCompany(payload);
    
    console.log("✅ STEP 3: Response received from backend:", response);
    console.log("✅ Success flag:", response.success);
    console.log("✅ Company data returned:", response.data);

    if (response.success) {
      addCompany(response.data);
      console.log("✅ STEP 4: Company added to store, navigating...");
      navigate("/companies");
    } else {
      console.error("❌ Backend returned success: false →", response.message);
      setError(response.message);
    }
  } catch (err: any) {
    console.error("❌ STEP 3 FAILED: Request did not reach backend or backend threw error");
    console.error("❌ Error message:", err.message);
    console.error("❌ Full error:", err);
    setError(err.message || "Registration failed. Is the backend running?");
  } finally {
    setSaving(false);
  }
};

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/companies")} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Register New Company</h2>
      </div>

      {/* ✅ Shows real backend error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold">
            <Building2 size={18} /> Company Info
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1">Company Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
                placeholder="Enter company name"
              />
            </div>
            <input
              required type="email" placeholder="Email *"
              value={form.email} onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
            <input
              required placeholder="Phone *"
              value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="GST Number"
              value={form.gstNumber}
              onChange={(e) => set("gstNumber", e.target.value.toUpperCase())}
              className={inputClass}
            />
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold">
            <MapPin size={18} /> Address
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              required placeholder="Address *"
              value={form.address} onChange={(e) => set("address", e.target.value)}
              className={`${inputClass} col-span-2`}
            />
            <input
              required placeholder="City *"
              value={form.city} onChange={(e) => set("city", e.target.value)}
              className={inputClass}
            />
            <select
              required value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className={inputClass}
            >
              <option value="">Select State *</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              required placeholder="Pincode *"
              value={form.pincode} onChange={(e) => set("pincode", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Contact Person */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold">
            <User size={18} /> Contact Person
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              required placeholder="Name *"
              value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)}
              className={inputClass}
            />
            <input
              required placeholder="Phone *"
              value={form.contactPersonPhone}
              onChange={(e) => set("contactPersonPhone", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/companies")} className="px-6 py-2 border rounded-lg">
            Cancel
          </button>
          <button
            type="submit" disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? "Saving..." : <><Save size={16} /> Register</>}
          </button>
        </div>
      </form>
    </div>
  );
}