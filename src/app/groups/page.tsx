import GroupsClient from "@/app/groups/groups-client";

type SP = { domain?: string };

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const domain = sp.domain ?? "wtgprint.com";

  return (
    <div style={{ padding: 24 }}>
      <h1>Gruppi utenti</h1>
      <GroupsClient domain={domain} />
    </div>
  );
}
