
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const chartData = [
  { name: "Jan", hires: 4, departures: 1 },
  { name: "Feb", hires: 3, departures: 2 },
  { name: "Mar", hires: 5, departures: 1 },
  { name: "Apr", hires: 6, departures: 0 },
  { name: "May", hires: 4, departures: 2 },
  { name: "Jun", hires: 7, departures: 1 },
];

export default function DashboardPage() {

  return (
    <div className="grid gap-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,254</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clocked In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
             <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leave</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Requests needing review</p>
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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/1/40/40" alt="Alex Chen" data-ai-hint={'person face'} />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Alex Chen</p>
                    <p className="text-sm text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
                 <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/2/40/40" alt="Maria Garcia" data-ai-hint={'person face'} />
                    <AvatarFallback>MG</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">Maria Garcia</p>
                    <p className="text-sm text-muted-foreground">UX/UI Designer</p>
                  </div>
                </div>
                 <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="https://picsum.photos/seed/3/40/40" alt="David Lee" data-ai-hint={'person face'} />
                    <AvatarFallback>DL</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">David Lee</p>
                    <p className="text-sm text-muted-foreground">Marketing Specialist</p>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
