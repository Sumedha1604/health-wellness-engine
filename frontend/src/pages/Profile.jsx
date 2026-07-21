import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  ShieldCheck,
  Target,
  Activity,
  Salad,
  Ruler,
  Weight,
  Moon,
  Gauge,
  Loader2,
} from "lucide-react";

const EMPTY_FORM = {
  fitness_goal: "",
  activity_level: "",
  diet_type: "",
  height_cm: "",
  weight_kg: "",
  sleep_hours: "",
  stress_level: "",
};

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        required
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function NumberField({ label, name, value, onChange, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
        {...rest}
      />
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();

  const [preferences, setPreferences] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [savedData, setSavedData] = useState(null);

  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/preferences");
      const data = response.data.data;

      const normalized = {
        fitness_goal: data?.fitness_goal || "",
        activity_level: data?.activity_level || "",
        diet_type: data?.diet_type || "",
        height_cm: data?.height_cm || "",
        weight_kg: data?.weight_kg || "",
        sleep_hours: data?.sleep_hours || "",
        stress_level: data?.stress_level || "",
      };

      setPreferences(normalized);
      setForm(normalized);
      setSavedData(normalized);
    } catch (err) {
      console.error(err);
      setError("Unable to load your health preferences.");
    } finally {
      setLoading(false);
    }
  }

  function formatValue(value, suffix = "") {
    if (value === null || value === undefined || value === "") {
      return "Not set";
    }
    return `${value}${suffix}`;
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleEditClick() {
    setMode("edit");
  }

  function handleCancel() {
    if (savedData) {
      setForm(savedData);
    }
    setMode("view");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.post("/preferences", form);

      toast.success("Preferences updated successfully!");

      setPreferences(form);
      setSavedData(form);
      setMode("view");
    } catch (err) {
      if (err.response?.data?.errors) {
        toast.error(
          err.response.data.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(", ")
        );
      } else {
        toast.error(
          err.response?.data?.message || "Failed to save preferences."
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  const healthSummary = [
    {
      label: "Fitness Goal",
      value: formatValue(preferences?.fitness_goal),
      icon: Target,
    },
    {
      label: "Activity Level",
      value: formatValue(preferences?.activity_level),
      icon: Activity,
    },
    {
      label: "Diet Preference",
      value: formatValue(preferences?.diet_type),
      icon: Salad,
    },
    {
      label: "Height",
      value: formatValue(preferences?.height_cm, " cm"),
      icon: Ruler,
    },
    {
      label: "Weight",
      value: formatValue(preferences?.weight_kg, " kg"),
      icon: Weight,
    },
    {
      label: "Sleep",
      value: formatValue(preferences?.sleep_hours, " hrs/night"),
      icon: Moon,
    },
    {
      label: "Stress Level",
      value: formatValue(preferences?.stress_level, "/10"),
      icon: Gauge,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-card p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl font-bold text-green-700">
            {user?.first_name?.charAt(0)}
          </span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {user?.email}
            </p>
            <p className="mt-3 text-sm font-medium text-green-600">
              Your wellness journey overview
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white rounded-3xl shadow-card p-8">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Personal Information
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Your basic account details
        </p>

        <div className="mt-6 divide-y divide-gray-100">
          <div className="flex items-center gap-4 py-4 first:pt-0">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
              <User className="h-5 w-5 text-green-600" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
              <Mail className="h-5 w-5 text-green-600" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-gray-900">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-4 last:pb-0">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
              <ShieldCheck className="h-5 w-5 text-green-600" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm text-gray-500">Account Status</p>
              <p className="font-semibold text-gray-900">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Summary Section */}
      <div className="bg-white rounded-3xl shadow-card p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Health Summary
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              A quick look at your current health profile
            </p>
          </div>

          {mode === "view" && !loading && !error && (
            <button
              type="button"
              onClick={handleEditClick}
              className="rounded-xl px-5 py-2.5 font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-sm"
            >
              Edit Preferences
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 text-green-600 animate-spin" strokeWidth={2} />
              <p className="text-sm text-gray-500">Loading your preferences...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button
              type="button"
              onClick={loadPreferences}
              className="mt-3 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : mode === "view" ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {healthSummary.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="
                  flex items-center gap-4
                  rounded-2xl
                  border border-gray-100
                  p-5
                  transition-all duration-200
                  hover:bg-green-50 hover:-translate-y-0.5 hover:shadow-sm
                "
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <Icon className="h-5 w-5 text-green-600" strokeWidth={2} />
                </span>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6"
          >
            <SelectField
              label="Fitness Goal"
              name="fitness_goal"
              value={form.fitness_goal}
              onChange={handleChange}
              options={[
                "Weight Loss",
                "Muscle Gain",
                "Maintain Weight",
                "Improve Endurance",
              ]}
            />

            <SelectField
              label="Activity Level"
              name="activity_level"
              value={form.activity_level}
              onChange={handleChange}
              options={["Beginner", "Intermediate", "Advanced"]}
            />

            <SelectField
              label="Diet Type"
              name="diet_type"
              value={form.diet_type}
              onChange={handleChange}
              options={["Balanced", "High Protein", "Vegetarian", "Vegan", "Keto"]}
            />

            <div className="grid grid-cols-2 gap-6">
              <NumberField
                label="Height (cm)"
                name="height_cm"
                value={form.height_cm}
                onChange={handleChange}
              />
              <NumberField
                label="Weight (kg)"
                name="weight_kg"
                value={form.weight_kg}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <NumberField
                label="Sleep Hours"
                name="sleep_hours"
                value={form.sleep_hours}
                onChange={handleChange}
                step="0.5"
              />
              <NumberField
                label="Stress Level (1–10)"
                name="stress_level"
                value={form.stress_level}
                onChange={handleChange}
                min="1"
                max="10"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 rounded-xl py-3 font-semibold text-white transition ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 rounded-xl py-3 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}