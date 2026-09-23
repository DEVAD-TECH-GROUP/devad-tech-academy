import { AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AreaChart({ data = [], xKey = "name", areas = [], height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data}>
        <defs>
          {areas.map(({ key, color = "#818CF8" }) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
        <XAxis dataKey={xKey} tick={{ fill: "#6B6B8A", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6B6B8A", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#16161F", border: "1px solid #2A2A3A", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#E8E8F0" }}
        />
        {areas.map(({ key, color = "#818CF8", name }) => (
          <Area key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2}
            fill={`url(#grad-${key})`} name={name || key} />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  );
}