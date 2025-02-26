// src/app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await requireAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user.user_metadata?.name || user.email}</p>
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="text-red-500">Sign out</button>
      </form>
    </div>
  );
}