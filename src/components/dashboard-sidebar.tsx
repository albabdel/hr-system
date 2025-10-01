
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  UploadCloud,
  UserPlus,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

const navItems = [
  { href: '/dashboard/employees', icon: Users, label: 'Employees' },
  { href: '/dashboard/employees/import', icon: UploadCloud, label: 'Import Employees'},
  { href: '/dashboard/org', icon: Network, label: 'Org Chart' },
  { href: '/dashboard/recruiting', icon: Briefcase, label: 'Recruiting' },
  { href: '/dashboard/recruiting/candidates', icon: UserPlus, label: 'Candidates' },
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
  { href: '/dashboard/settings/brand', icon: Settings, label: 'Brand Settings' },
  { href: '/dashboard/admin', icon: Settings, label: 'Admin' },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r fixed h-full">
      <div className="flex items-center gap-4 h-20 px-6 border-b">
        <Logo className="h-10 w-10" />
        <h1 className="text-lg font-bold text-foreground">VRS Platform</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          );
        })}
        <div className="pt-2">
             <Button
              asChild
              variant={pathname.startsWith('/dashboard/recruiting/job-description-generator') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Link href="/dashboard/recruiting/job-description-generator">
                <FileText className="mr-3 h-5 w-5 text-purple-500" />
                Job Description AI
              </Link>
            </Button>
        </div>
      </nav>
    </aside>
  );
}
