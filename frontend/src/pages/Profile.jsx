import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getPreferences } from "../services/preference.service";
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

export default function Profile() {
  const { user } = useAuth();

  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPreferences();
      setPreferences(data);
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
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Health Summary
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          A quick look at your current health profile
        </p>

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
        ) : (
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
        )}
      </div>
    </div>
  );
}