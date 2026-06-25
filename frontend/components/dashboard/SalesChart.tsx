"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SalesTrendChart({ data }: { data: unknown[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2196f3" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2196f3" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#edf0f4" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8492a6" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8492a6" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e6e9ef", boxShadow: "0 10px 25px rgba(31,45,61,.1)" }} />
          <Area type="monotone" dataKey="revenue" stroke="#2196f3" strokeWidth={3} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsChart({ data }: { data: unknown[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#edf0f4" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8492a6" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8492a6" }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "#f5f8fb" }} contentStyle={{ borderRadius: 10, border: "1px solid #e6e9ef", boxShadow: "0 10px 25px rgba(31,45,61,.1)" }} />
          <Bar dataKey="revenue" fill="#673ab7" radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
