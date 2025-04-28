// src/components/dashboard/dashboard.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ApplicationList } from "@/components/applications/application-list";
import { VulnerabilityList } from "@/components/vulnerabilities/vulnerability-list";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from '@/components/logo'; // Import the new Logo component
import dynamic from 'next/dynamic';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Dynamically import the chart component with ssr disabled
const RiskBreakdownChart = dynamic(() => import('./risk-breakdown-chart'), { ssr: false });

const RecentVulnerabilities = () => {
  // Placeholder data, replace with actual data fetching later
  const vulnerabilities = [
    { title: 'XSS Vulnerability', risk: 'High', application: 'App1' },
    { title: 'SQL Injection', risk: 'Critical', application: 'App2' },
    { title: 'CSRF Vulnerability', risk: 'Medium', application: 'App3' },
  ];

  return (
    <ul className="space-y-2">
      {vulnerabilities.map((vulnerability, index) => (
        <li key={index} className="text-sm">
          <span className="font-medium">{vulnerability.title}</span> -{' '}
          <span className={`font-semibold ${
              vulnerability.risk === 'Critical' ? 'text-[hsl(var(--status-critical))]' :
              vulnerability.risk === 'High' ? 'text-red-700' : // Using specific color for High
              vulnerability.risk === 'Medium' ? 'text-[hsl(var(--status-medium))]' :
              'text-[hsl(var(--status-low))]'
            }`}>{vulnerability.risk}</span> -{' '}
          <span className="text-muted-foreground">{vulnerability.application}</span>
        </li>
      ))}
    </ul>
  );
};


const DashboardContent = () => {
    // Placeholder counts, replace with actual data fetching later
    const totalVulnerabilities = 100;
    const totalApplications = 15;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Total Vulnerabilities</CardTitle>
          <CardDescription>Across all applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalVulnerabilities}</div>
        </CardContent>
      </Card>

      {/* Use the dynamically imported chart component */}
      <RiskBreakdownChart />

      <Card>
        <CardHeader>
          <CardTitle>Total Applications</CardTitle>
          <CardDescription>Number of applications being monitored</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalApplications}</div>
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
    <div className="flex justify-end items-center p-4 border-b">
      <ThemeToggle />
    </div>
  );
};

const Dashboard = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "applications" | "vulnerabilities">("dashboard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
      setMounted(true);
  }, []);

  // Render placeholder or null until mounted to avoid hydration issues
  if (!mounted) {
      return null; // Or a loading spinner
  }


  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar className="w-64 border-r flex-shrink-0">
          <SidebarContent>
             <div className="p-4 flex items-center justify-start border-b"> {/* Changed justify-center to justify-start */}
               <Logo className="h-10" /> {/* Use the Logo component */}
            </div>
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

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {activeView === "dashboard" && <DashboardContent />}
            {activeView === "applications" && <ApplicationList />}
            {activeView === "vulnerabilities" && <VulnerabilityList />}
          </main>
           <Toaster /> {/* Add Toaster here */}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
