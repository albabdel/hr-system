import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin</CardTitle>
        <CardDescription>Manage your tenant settings, roles, and integrations.</CardDescription>
      </CardHeader>
    </Card>
  );
}
