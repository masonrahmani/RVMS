// src/components/dashboard/risk-breakdown-chart.tsx
"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";


const riskData = [
  { name: 'Low', value: 30, fill: 'hsl(var(--status-low))' },
  { name: 'Medium', value: 25, fill: 'hsl(var(--status-medium))' },
  { name: 'High', value: 20, fill: 'hsl(var(--status-high))' },
  { name: 'Critical', value: 25, fill: 'hsl(var(--status-critical))' },
];

const chartConfig = {
  vulnerabilities: {
    label: "Vulnerabilities",
  },
  Low: {
    label: "Low",
    color: "hsl(var(--status-low))",
  },
  Medium: {
    label: "Medium",
    color: "hsl(var(--status-medium))",
  },
  High: {
    label: "High",
    color: "hsl(var(--status-high))",
  },
  Critical: {
    label: "Critical",
    color: "hsl(var(--status-critical))",
  },
} satisfies ChartConfig;

const RiskBreakdownChart = () => {
  return (
    <Card className="md:col-span-2 lg:col-span-1 flex flex-col">
      <CardHeader>
        <CardTitle>Risk Level Breakdown</CardTitle>
        <CardDescription>Distribution of vulnerabilities by risk</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={riskData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                outerRadius={80}
              >
                 {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
       <CardContent className="flex items-center justify-center gap-4 p-4">
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </CardContent>
    </Card>
  );
};

export default RiskBreakdownChart;