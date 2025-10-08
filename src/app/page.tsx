import { redirect } from 'next/navigation';

export default function HomePage() {
  // The middleware will handle redirection based on auth status.
  // This page can be a marketing page or redirect to login/dashboard.
  redirect('/login');
}
