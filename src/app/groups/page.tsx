import GroupsClient from "@/app/groups/groups-client";

export default function GroupsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Gruppi utenti</h1>
      <GroupsClient />
    </div>
  );
}
