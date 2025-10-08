
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  ArrowRight,
  BarChart,
  Calendar,
  CheckCircle,
  ChevronDown,
  Circle,
  Link,
  MoreHorizontal,
  Settings,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

const progressData = [
  { day: 'S', value: 4.5 },
  { day: 'M', value: 3 },
  { day: 'T', value: 6 },
  { day: 'W', value: 5 },
  { day: 'T', value: 7.5 },
  { day: 'F', value: 8 },
  { day: 'S', value: 2 },
];

const onboardingTasks = [
  { title: 'Interview', time: 'Sep 13, 08:30', done: true },
  { title: 'Team Meeting', time: 'Sep 13, 10:30', done: true },
  { title: 'Project Update', time: 'Sep 13, 13:00', done: false },
  { title: 'Discuss Q3 Goals', time: 'Sep 13, 14:45', done: false },
  { title: 'HR Policy Review', time: 'Sep 13, 16:30', done: false },
];

export default function DashboardPage() {
  const loraImage = PlaceHolderImages.find((p) => p.id === '1');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-medium">Welcome in, Nixtio</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Interviews</span>
              <Progress value={15} />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Hired</span>
              <Progress value={15} />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Project time</span>
              <Progress value={60} />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Output</span>
              <Progress value={10} />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="relative rounded-3xl xl:col-span-1">
          {loraImage && (
            <Image
              src={loraImage.imageUrl}
              alt={loraImage.description}
              fill
              className="object-cover rounded-3xl"
              data-ai-hint={loraImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
          <CardContent className="relative flex flex-col justify-end h-full p-6 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-semibold">Lora Piterson</h3>
                <p className="text-sm opacity-80">UX/UI Designer</p>
              </div>
              <div className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                $1,200
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Progress</CardTitle>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">6.1h</p>
              <p className="text-sm text-muted-foreground">Work Time this week</p>
            </div>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={progressData}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis hide={true} />
                  <RechartsBar
                    dataKey="value"
                    radius={[10, 10, 10, 10]}
                    className="fill-primary"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Time tracker</CardTitle>
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="relative h-40 w-40">
              <svg
                className="absolute inset-0"
                viewBox="0 0 100 100"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="5"
                  strokeDasharray="282.6"
                  strokeDashoffset={282.6 * (1 - 0.7)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">02:35</span>
                <span className="text-sm text-muted-foreground">Work Time</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Button size="icon" variant="secondary" className="rounded-full">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 12.5V2.5L12 7.5L3 12.5Z"
                    fill="hsl(var(--foreground))"
                  />
                </svg>
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.5 3C4.22386 3 4 3.22386 4 3.5V11.5C4 11.7761 4.22386 12 4.5 12H5.5C5.77614 12 6 11.7761 6 11.5V3.5C6 3.22386 5.77614 3 5.5 3H4.5ZM9.5 3C9.22386 3 9 3.22386 9 3.5V11.5C9 11.7761 9.22386 12 9.5 12H10.5C10.7761 12 11 11.7761 11 11.5V3.5C11 3.22386 10.7761 3 10.5 3H9.5Z"
                    fill="hsl(var(--foreground))"
                  />
                </svg>
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full">
                 <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.85355 3.14645C7.04882 2.95118 7.36539 2.95118 7.56066 3.14645L11.0607 6.64645C11.2559 6.84171 11.2559 7.15829 11.0607 7.35355L7.56066 10.8536C7.36539 11.0488 7.04882 11.0488 6.85355 10.8536C6.65829 10.6583 6.65829 10.3417 6.85355 10.1464L9.5 7.5H3.5C3.22386 7.5 3 7.27614 3 7C3 6.72386 3.22386 6.5 3.5 6.5H9.5L6.85355 3.85355C6.65829 3.65829 6.65829 3.34171 6.85355 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl row-span-1 lg:row-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Onboarding</CardTitle>
            <p className="text-3xl font-bold">18%</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Task</span>
                <span>30%</span>
              </div>
              <Progress value={30} />
            </div>
             <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span></span>
                <span>25%</span>
              </div>
              <Progress value={25} className="[&>div]:bg-foreground" />
            </div>
             <div className="space-y-2">
               <div className="flex justify-between items-center text-sm">
                <span></span>
                <span>0%</span>
              </div>
              <Progress value={0} className="[&>div]:bg-muted-foreground/50"/>
            </div>
            
            <Card className="bg-foreground text-background rounded-2xl -mx-2">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-base">Onboarding Task</CardTitle>
                    <p className="font-bold">2/8</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {onboardingTasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <div className="bg-background/10 p-2 rounded-full">
                                <Users className="h-4 w-4 text-background"/>
                           </div>
                            <div className="flex-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-xs text-background/70">{task.time}</p>
                            </div>
                            {task.done ? <CheckCircle className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-background/30" />}
                        </div>
                    ))}
                </CardContent>
            </Card>

          </CardContent>
        </Card>

        <Card className="rounded-3xl lg:col-span-2 xl:col-span-3">
          <CardHeader>
             <div className="flex items-center justify-between">
                 <div className="flex gap-4">
                    <Button variant="ghost">August</Button>
                    <Button variant="secondary" className="rounded-full">September 2024</Button>
                    <Button variant="ghost">October</Button>
                 </div>
                 <div>
                    <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2"/> Weekly</Button>
                 </div>
             </div>
          </CardHeader>
          <CardContent className="grid grid-cols-7 gap-px bg-border -mx-6 px-px">
            {['Mon 22', 'Tue 23', 'Wed 24', 'Thu 25', 'Fri 26', 'Sat 27', 'Sun 28'].map(day => (
                <div key={day} className="bg-card p-2 text-sm text-center font-medium">{day}</div>
            ))}
            <div className="bg-card p-2 col-start-3 col-span-2 row-start-2 rounded-xl relative -m-px z-10 border-2 border-primary shadow-lg">
                <p className="font-semibold">Weekly Team Sync</p>
                <p className="text-xs text-muted-foreground">Discuss progress on projects</p>
            </div>
             <div className="bg-card p-2 col-start-5 col-span-2 row-start-4 rounded-xl relative -m-px z-10 border-2 border-primary shadow-lg">
                <p className="font-semibold">Onboarding Session</p>
                <p className="text-xs text-muted-foreground">Introduction for new hires</p>
            </div>
             {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="bg-card h-24"></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
