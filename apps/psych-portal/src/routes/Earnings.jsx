import { useQuery } from "@tanstack/react-query";
import { useTherapistGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Section from "shared-ui/Section";
import StatCard from "shared-ui/StatCard";
import { inr } from "shared-core/money";
import { getTherapistEarnings } from "shared-core/metrics";

export default function Earnings() {
  const { loading: authLoading, user } = useTherapistGuard();

  const { data: earnings, isLoading } = useQuery({
    queryKey: ["earnings", user?.uid],
    queryFn: () => getTherapistEarnings(user.uid),
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-elma-ink/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Earnings" />
        <main className="p-8">
          <Section title="Earnings Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="This Month"
                value={inr(earnings?.monthly || 0)}
                loading={isLoading}
                icon="💰"
              />
              <StatCard
                title="Lifetime"
                value={inr(earnings?.lifetime || 0)}
                loading={isLoading}
                icon="⭐"
              />
            </div>
          </Section>

          <Section title="Earnings Chart">
            <div className="bg-elma-white rounded-xl2 shadow-soft p-8">
              <p className="text-elma-ink/60 text-center">
                Chart placeholder - implement with charting library if needed
              </p>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
