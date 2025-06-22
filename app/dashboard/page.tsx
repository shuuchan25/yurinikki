import ClientDashboard from "../../components/AdminDashboard";

// Data selalu fresh, tidak butuh ISR di dashboard admin
export default function DashboardPage() {
  return <ClientDashboard />;
}
