import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function LineChart({ data = [], xKey = "name", lines = [], height = 200 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3A" />
        <XAxis dataKey={xKey} tick={{ fill: "#6B6B8A", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#6B6B8A", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "#16161F", border: "1px solid #2A2A3A", borderRadius: 12, fontSize: 12 }}
          labelStyle={{ color: "#E8E8F0" }}
        />
        {lines.map(({ key, color = "#818CF8", name }) => (
          <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2}
            dot={false} name={name || key} />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  );
}
