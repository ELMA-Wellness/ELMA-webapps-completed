import { useQuery } from "@tanstack/react-query";
import { useAdminGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Section from "shared-ui/Section";
import StatCard from "shared-ui/StatCard";
import { inr } from "shared-core/money";
import { getMonthKey } from "shared-core/dates";
import { sumSessionsRevenueMonth, countCompletedSessions } from "shared-core/metrics";
import { collection, query, where, getDocs } from "firebase/firestore";

async function getAverageSessionPrice() {
  const q = query(
    collection(db, "bookings"),
    where("status", "==", "completed")
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.size === 0) return 0;
  
  let total = 0;
  snapshot.forEach((doc) => {
    total += doc.data().amount || 0;
  });
  
  return Math.round(total / snapshot.size);
}

export default function Revenue() {
  const { loading: authLoading } = useAdminGuard();

  const { data: sessionsRevenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ["revenue", "sessions", getMonthKey()],
    queryFn: () => sumSessionsRevenueMonth(getMonthKey()),
  });

  const { data: avgPrice, isLoading: loadingAvg } = useQuery({
    queryKey: ["revenue", "average"],
    queryFn: getAverageSessionPrice,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-elma-ink/60">Loading...</div>
      </div>
    );
  }

  const subscriptionsRevenue = 0; // Placeholder
  const totalRevenue = (sessionsRevenue || 0) + subscriptionsRevenue;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Revenue" />
        <main className="p-8">
          <Section title="Monthly Revenue Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={inr(totalRevenue)}
                loading={loadingRevenue}
                icon="💰"
              />
              <StatCard
                title="Sessions Revenue"
                value={inr(sessionsRevenue || 0)}
                loading={loadingRevenue}
                icon="📊"
              />
              <StatCard
                title="Subscriptions Revenue"
                value={inr(subscriptionsRevenue)}
                loading={false}
                icon="⭐"
              />
              <StatCard
                title="Avg Session Price"
                value={inr(avgPrice || 0)}
                loading={loadingAvg}
                icon="📈"
              />
            </div>
          </Section>

          <Section title="Revenue Breakdown">
            <div className="bg-elma-white rounded-xl2 shadow-soft p-8">
              <p className="text-elma-ink/60 text-center">
                Revenue chart placeholder - implement with charting library if needed
              </p>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
