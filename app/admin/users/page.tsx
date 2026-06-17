// app/admin/users/page.tsx
import UsersLiveTable from "@/components/admin/UsersLiveTable";

export default async function UsersPage() {
  // Server can still provide an initial dataset if desired — for now we'll
  // render the client live table which fetches data itself.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          User Management
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Manage all platform users
        </p>
      </div>

      <UsersLiveTable />
    </div>
  );
}
