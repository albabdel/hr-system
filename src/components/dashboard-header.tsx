
'use client';

import Link from 'next/link';
import {
  Bell,
  Search,
  Settings,
  Users,
  Briefcase,
  Calendar,
  Wallet,
  FileText,
  BarChart,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/employees', label: 'People' },
  { href: '/dashboard/recruiting', label: 'Hiring' },
  { href: '/dashboard/devices', label: 'Devices' },
  { href: '/dashboard/apps', label: 'Apps' },
  { href: '/dashboard/payroll', label: 'Salary' },
  { href: '/dashboard/calendar', label: 'Calendar' },
  { href: '/dashboard/reviews', label: 'Reviews' },
];

export function DashboardHeader() {
  return (
    <header className="flex h-20 items-center gap-8 px-4 md:px-8 sticky top-0 z-30 bg-background/80 backdrop-blur-sm">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Logo className="h-8 w-8" />
        <span className="text-lg">Crextio</span>
      </Link>

      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item, index) => (
          <Button
            key={item.href}
            asChild
            variant={index === 0 ? 'secondary' : 'ghost'}
            className="rounded-full"
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        ))}
      </nav>

      <div className="flex-1 flex justify-end items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
