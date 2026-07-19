import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getWeeklyCalories } from "../../services/dashboard.service";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl bg-white/95 px-4 py-2.5 shadow-lg ring-1 ring-gray-100 backdrop-blur-sm">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-gray-800">
        {payload[0].value}{" "}
        <span className="font-normal text-gray-400">kcal</span>
      </p>
    </div>
  );
}

export default function WeeklyChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function loadWeeklyCalories() {
      try {
        const weeklyData = await getWeeklyCalories();
        setData(weeklyData);
      } catch (error) {
        console.error(error);
      }
    }
    loadWeeklyCalories();
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-card p-8 h-[380px]">
      <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
        Weekly Calories
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Your calorie trend over the last 7 days.
      </p>

      <ResponsiveContainer width="100%" height="80%" className="mt-2">
        <AreaChart data={data} margin={{ top: 24, right: 16, left: 16, bottom: 0 }}>
          <defs>
            <linearGradient id="calorieFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="#F1F5F4"
            strokeWidth={1}
          />

          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12 }}
            dy={8}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#D1FAE5", strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="calories"
            stroke="#34D399"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="url(#calorieFill)"
            activeDot={{
              r: 7,
              fill: "#34D399",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}