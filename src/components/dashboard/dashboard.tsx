"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ApplicationList } from "@/components/applications/application-list";
import { VulnerabilityList } from "@/components/vulnerabilities/vulnerability-list";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ThemeToggle } from "@/components/theme-toggle";

const riskData = [
  { name: 'Low', value: 30 },
  { name: 'Medium', value: 25 },
  { name: 'High', value: 20 },
  { name: 'Critical', value: 25 },
];

const COLORS = ['hsl(var(--status-low))', 'hsl(var(--status-medium))', 'hsl(var(--status-high))', 'hsl(var(--status-critical))'];

const RecentVulnerabilities = () => {
  const vulnerabilities = [
    { title: 'XSS Vulnerability', risk: 'High', application: 'App1' },
    { title: 'SQL Injection', risk: 'Critical', application: 'App2' },
    { title: 'CSRF Vulnerability', risk: 'Medium', application: 'App3' },
  ];

  return (
    <ul>
      {vulnerabilities.map((vulnerability, index) => (
        <li key={index} className="py-2">
          {vulnerability.title} - {vulnerability.risk} - {vulnerability.application}
        </li>
      ))}
    </ul>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-md shadow-md border border-gray-200">
        <p className="font-semibold text-gray-800">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const DashboardContent = () => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Vulnerabilities</CardTitle>
          <CardDescription>Across all applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">125</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Risk Level Breakdown</CardTitle>
          <CardDescription>Distribution of vulnerabilities by risk</CardDescription>
        </CardHeader>
        <CardContent>
          <PieChart width={400} height={200}>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="value"
              nameKey="name"
              label
            >
              {riskData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
            <Legend />
          </PieChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Applications</CardTitle>
          <CardDescription>Number of applications being monitored</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">32</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recently Added Vulnerabilities</CardTitle>
          <CardDescription>List of the latest vulnerabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentVulnerabilities />
        </CardContent>
      </Card>
    </div>
  );
};

const Header = () => {
  return (
    <div className="flex justify-end items-center p-4">
      <ThemeToggle />
    </div>
  );
};

const Dashboard = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "applications" | "vulnerabilities">("dashboard");

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="w-64 border-r flex-shrink-0">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveView("dashboard")} isActive={activeView === "dashboard"}>
                  <Icons.dashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveView("applications")} isActive={activeView === "applications"}>
                  <Icons.applications className="mr-2 h-4 w-4" />
                  <span>Applications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveView("vulnerabilities")} isActive={activeView === "vulnerabilities"}>
                  <Icons.vulnerabilities className="mr-2 h-4 w-4" />
                  <span>Vulnerabilities</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col overflow-y-auto">
          <Header />
          <div className="p-4">
            {activeView === "dashboard" && <DashboardContent />}
            {activeView === "applications" && <ApplicationList />}
            {activeView === "vulnerabilities" && <VulnerabilityList />}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
