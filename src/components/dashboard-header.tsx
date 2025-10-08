'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Menu,
  Users,
  Briefcase,
  ClipboardList,
  Clock,
  CreditCard,
  Wallet,
  Activity,
  Award,
  BookOpen,
  HeartHandshake,
  BarChart,
  Settings,
  FileText,
  Network,
  CalendarCheck,
} from 'lucide-react';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';

const navItems = [
    { href: '/dashboard/employees', icon: Users, label: 'Employees' },
    { href: '/dashboard/org', icon: Network, label: 'Org Chart' },
    { href: '/dashboard/recruiting', icon: Briefcase, label: 'Recruiting' },
    { href: '/dashboard/onboarding', icon: ClipboardList, label: 'Onboarding' },
    { href: '/dashboard/time', icon: Clock, label: 'Time' },
    { href: '/dashboard/leave', icon: CalendarCheck, label: 'Leave' },
    { href: '/dashboard/payroll', icon: CreditCard, label: 'Payroll' },
    { href: '/dashboard/benefits', icon: Wallet, label: 'Benefits' },
    { href: '/dashboard/performance', icon: Activity, label: 'Performance' },
    { href: '/dashboard/talent', icon: Award, label: 'Talent' },
    { href: '/dashboard/lms', icon: BookOpen, label: 'LMS' },
    { href: '/dashboard/engagement', icon: HeartHandshake, label: 'Engagement' },
    { href: '/dashboard/analytics', icon: BarChart, label: 'Analytics' },
    { href: '/dashboard/admin', icon: Settings, label: 'Admin' },
    { href: '/dashboard/recruiting/job-description-generator', icon: FileText, label: 'Job Description AI' },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const pageTitle = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard';

  return (
    <header className="flex h-20 items-center gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
           <nav className="grid gap-2 text-lg font-medium">
             <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
               <Logo className="h-8 w-8" />
               <span className="">VRS</span>
             </Link>
             {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
           </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-lg font-semibold capitalize">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9"
          />
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </div>
    </header>
  );
}
