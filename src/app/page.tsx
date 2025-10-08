import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect directly to the dashboard since auth is removed.
  redirect('/dashboard');
}
