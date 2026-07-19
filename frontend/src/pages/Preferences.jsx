import { useEffect, useState } from "react";
import {
  Target,
  Activity,
  UtensilsCrossed,
  Ruler,
  Scale,
  Moon,
  HeartPulse,
} from "lucide-react";
import api from "../services/api";

const FIELD_CONFIG = [
  { key: "fitness_goal", label: "Fitness Goal", icon: Target },
  { key: "activity_level", label: "Activity Level", icon: Activity },
  { key: "diet_type", label: "Diet Type", icon: UtensilsCrossed },
  { key: "height_cm", label: "Height", icon: Ruler, unit: "cm" },
  { key: "weight_kg", label: "Weight", icon: Scale, unit: "kg" },
  { key: "sleep_hours", label: "Sleep", icon: Moon, unit: "hrs/night" },
  { key: "stress_level", label: "Stress Level", icon: HeartPulse, unit: "/10" },
];

const EMPTY_FORM = {
  fitness_goal: "",
  activity_level: "",
  diet_type: "",
  height_cm: "",
  weight_kg: "",
  sleep_hours: "",
  stress_level: "",
};

function formatValue(value, unit) {
  if (value === "" || value === null || value === undefined) {
    return "Not set";
  }
  return unit ? `${value} ${unit}` : value;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl animate-pulse">
      <div className="h-10 w-64 bg-gray-200 rounded-lg mb-3" />
      <div className="h-4 w-80 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ Icon, label, value }) {
  const isUnset = value === "Not set";
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex items-start gap-4">
      <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
        <Icon className="h-6 w-6 text-green-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
          {label}
        </p>
        <p
          className={`text-lg font-semibold truncate ${
            isUnset ? "text-gray-300" : "text-gray-800"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

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

export default function Preferences() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [savedData, setSavedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    setIsLoading(true);
    try {
      const response = await api.get("/preferences");
      const data = response.data.data;

      if (data) {
        const normalized = {
          fitness_goal: data.fitness_goal || "",
          activity_level: data.activity_level || "",
          diet_type: data.diet_type || "",
          height_cm: data.height_cm || "",
          weight_kg: data.weight_kg || "",
          sleep_hours: data.sleep_hours || "",
          stress_level: data.stress_level || "",
        };
        setForm(normalized);
        setSavedData(normalized);
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  }

  function handleCancel() {
    if (savedData) {
      setForm(savedData);
    }
    setStatus({ type: "", message: "" });
    setMode("view");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await api.post("/preferences", form);

      setStatus({
        type: "success",
        message: response.data.data?.message || response.data.message,
      });
      setSavedData(form);
      setMode("view");
    } catch (error) {
      if (error.response?.data?.errors) {
        setStatus({
          type: "error",
          message: error.response.data.errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(", "),
        });
      } else {
        setStatus({
          type: "error",
          message:
            error.response?.data?.message || "Failed to save preferences.",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Health Profile
          </h1>
          <p className="text-gray-500">
            Your goals and stats, all in one place.
          </p>
        </div>

        {mode === "view" && (
          <button
            onClick={() => setMode("edit")}
            className="rounded-xl px-5 py-2.5 font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition shadow-sm"
          >
            Edit Preferences
          </button>
        )}
      </div>

      {status.message && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 ${
            status.type === "success"
              ? "border-green-300 bg-green-100 text-green-700"
              : "border-red-300 bg-red-100 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      {mode === "view" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FIELD_CONFIG.map(({ key, label, icon, unit }) => (
            <StatCard
              key={key}
              Icon={icon}
              label={label}
              value={formatValue(form[key], unit)}
            />
          ))}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 space-y-6"
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
  );
}
