"use client";

import { Bar, BarChart, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface Day { day: string; traces: number; errors: number; p95: number }

export function VolumeChart({ data }: { data: Day[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <figure className="panel p-4">
        <figcaption className="eyebrow mb-3">Traces & errors per day</figcaption>
        <div className="h-56" role="img" aria-label="Bar chart of traces and errors per day">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="#1B2A4A" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8CA6C4" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#8CA6C4" }} />
              <Tooltip contentStyle={{ background: "#0A1224", border: "1px solid #1B2A4A", borderRadius: 6, color: "#D4E8FA" }} cursor={{ fill: "#0F1B35" }} />
              <Bar dataKey="traces" fill="#19C7CC" name="Traces" />
              <Bar dataKey="errors" fill="#FF7A7A" name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
      <figure className="panel p-4">
        <figcaption className="eyebrow mb-3">p95 latency (ms)</figcaption>
        <div className="h-56" role="img" aria-label="Line chart of p95 latency per day">
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <CartesianGrid stroke="#1B2A4A" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8CA6C4" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8CA6C4" }} />
              <Tooltip contentStyle={{ background: "#0A1224", border: "1px solid #1B2A4A", borderRadius: 6, color: "#D4E8FA" }} cursor={{ fill: "#0F1B35" }} />
              <Line type="monotone" dataKey="p95" stroke="#86C9F5" strokeWidth={2} dot={false} name="p95 ms" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
