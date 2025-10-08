import { DashboardHeader } from '@/components/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
    </div>
  );
}
