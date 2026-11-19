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
              <CartesianGrid stroke="#DAD6C8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="traces" fill="#12372C" name="Traces" />
              <Bar dataKey="errors" fill="#B3341F" name="Errors" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
      <figure className="panel p-4">
        <figcaption className="eyebrow mb-3">p95 latency (ms)</figcaption>
        <div className="h-56" role="img" aria-label="Line chart of p95 latency per day">
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <CartesianGrid stroke="#DAD6C8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="p95" stroke="#12372C" strokeWidth={2} dot={false} name="p95 ms" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
