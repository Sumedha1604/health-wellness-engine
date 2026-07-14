import {
    LineChart,
    Line,
    ResponsiveContainer,
    XAxis,
    Tooltip,
  } from "recharts";
  
  const data = [
    { day: "Mon", calories: 1650 },
    { day: "Tue", calories: 1850 },
    { day: "Wed", calories: 1750 },
    { day: "Thu", calories: 2000 },
    { day: "Fri", calories: 1920 },
    { day: "Sat", calories: 1780 },
    { day: "Sun", calories: 1820 },
  ];
  
  export default function WeeklyChart() {
    return (
      <div className="bg-white rounded-3xl shadow-card p-6 h-[340px]">
  
        <h2 className="text-xl font-semibold mb-6">
          Weekly Calories
        </h2>
  
        <ResponsiveContainer width="100%" height="85%">
  
          <LineChart data={data}>
  
            <XAxis dataKey="day" />
  
            <Tooltip />
  
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#A1E8CC"
              strokeWidth={3}
            />
  
          </LineChart>
  
        </ResponsiveContainer>
  
      </div>
    );
  }