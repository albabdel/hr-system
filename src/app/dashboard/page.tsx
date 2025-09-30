"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiEmployee {
  _id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string; // assuming API might provide this
  imageHint?: string;
  position: string;
}

const chartData = [
  { name: "Jan", hires: 4, departures: 1 },
  { name: "Feb", hires: 3, departures: 2 },
  { name: "Mar", hires: 5, departures: 1 },
  { name: "Apr", hires: 6, departures: 0 },
  { name: "May", hires: 4, departures: 2 },
  { name: "Jun", hires: 7, departures: 1 },
];

export default function DashboardPage() {
  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeEmployees = employees.length; // Simplified for now
  
  return (
    <div className="grid gap-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{employees.length}</div>}
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{activeEmployees}</div>}
            <p className="text-xs text-muted-foreground">0 on leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">2 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Tenure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8 yrs</div>
            <p className="text-xs text-muted-foreground">Up from 2.5 yrs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hiring Overview</CardTitle>
            <CardDescription>Hires vs. Departures - Last 6 Months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="hires" fill="hsl(var(--primary))" name="Hires" radius={[4, 4, 0, 0]} />
                <Bar dataKey="departures" fill="hsl(var(--foreground))" name="Departures" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>New Hires</CardTitle>
             <CardDescription>Recently joined employees.</CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
            <div className="space-y-4">
              {employees.slice(0, 4).map((employee) => (
                <div key={employee._id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${employee._id}/40/40`} alt={`${employee.firstName} ${employee.lastName}`} data-ai-hint={'person face'} />
                    <AvatarFallback>{employee.firstName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{`${employee.firstName} ${employee.lastName}`}</p>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
