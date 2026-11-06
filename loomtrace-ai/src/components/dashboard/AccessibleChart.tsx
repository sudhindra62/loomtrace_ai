"use client";

import { useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DataPoint {
  label: string;
  value: number;
}

interface AccessibleChartProps {
  title: string;
  data: DataPoint[];
  valueLabel: string;
  type?: "line" | "bar";
}

/**
 * Every chart in NHIC and Market Intelligence goes through this
 * component, never raw recharts — this is what makes the "synchronized
 * accessible data table view" commitment from Phase 1 Rev 3 §3 an actual
 * enforced pattern instead of a promise that only holds for whichever
 * chart someone remembered to add it to.
 */
export function AccessibleChart({ title, data, valueLabel, type = "line" }: AccessibleChartProps) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-soft dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{title}</h3>
        <div role="tablist" aria-label={`View ${title} as chart or table`} className="flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800">
          <button
            role="tab"
            aria-selected={view === "chart"}
            onClick={() => setView("chart")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
              view === "chart" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500"
            )}
          >
            <TrendingUp className="h-3 w-3" />
            Chart
          </button>
          <button
            role="tab"
            aria-selected={view === "table"}
            onClick={() => setView("table")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
              view === "table" ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900" : "text-neutral-500"
            )}
          >
            <Table2 className="h-3 w-3" />
            Table
          </button>
        </div>
      </div>

      {view === "chart" ? (
        <div role="img" aria-label={`${title} chart, ${data.length} data points. Switch to table view for exact values.`} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="currentColor" className="text-neutral-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-neutral-400" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="#ee7b35" strokeWidth={2} dot={false} name={valueLabel} />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="currentColor" className="text-neutral-400" />
                <YAxis tick={{ fontSize: 12 }} stroke="currentColor" className="text-neutral-400" />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#ee7b35" radius={[4, 4, 0, 0]} name={valueLabel} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <table className="w-full text-sm">
          <caption className="sr-only">{title}, tabular data</caption>
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
              <th scope="col" className="py-2 font-medium">Period</th>
              <th scope="col" className="py-2 font-medium">{valueLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.label} className="border-b border-neutral-100 dark:border-neutral-800/60">
                <td className="py-2">{point.label}</td>
                <td className="py-2">{point.value.toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
