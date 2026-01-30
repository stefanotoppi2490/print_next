import UsersClient from "@/app/users/users-client";

type SP = { q?: string; pageSize?: string; currentPage?: string };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const q = sp.q ?? "";
  const pageSize = Number(sp.pageSize ?? "10");
  const currentPage = Number(sp.currentPage ?? "1");

  return (
    <div style={{ padding: 24 }}>
      <h1>Users</h1>
      <UsersClient q={q} pageSize={pageSize} currentPage={currentPage} />
    </div>
  );
}
