import { useQuery } from "@tanstack/react-query";
import { useAdminGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatCard from "shared-ui/StatCard";
import Section from "shared-ui/Section";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "shared-ui/Table";
import { inr } from "shared-core/money";
import { getMonthKey } from "shared-core/dates";
import {
  countUsers,
  countDAU,
  countNewUsersToday,
  countTherapists,
  countCompletedSessions,
  sumSessionsRevenueMonth,
  countUsersByPlus,
  topTherapistsBySessions,
  getSessionCompletionRate,
  countNewUsers7d,
  countNewUsers30d,
  countWAU,
  countMAU,
} from "shared-core/metrics";

export default function Dashboard() {
  const { loading: authLoading } = useAdminGuard();

  const { data: totalUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ["users", "total"],
    queryFn: countUsers,
  });

  const { data: dau, isLoading: loadingDAU } = useQuery({
    queryKey: ["users", "dau"],
    queryFn: countDAU,
  });

  const { data: newUsersToday, isLoading: loadingNewToday } = useQuery({
    queryKey: ["users", "new-today"],
    queryFn: countNewUsersToday,
  });

  const { data: totalTherapists, isLoading: loadingTherapists } = useQuery({
    queryKey: ["therapists", "total"],
    queryFn: countTherapists,
  });

  const { data: completedSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ["sessions", "completed"],
    queryFn: countCompletedSessions,
  });

  const { data: monthRevenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ["revenue", "month", getMonthKey()],
    queryFn: () => sumSessionsRevenueMonth(getMonthKey()),
  });

  const { data: usersByPlus, isLoading: loadingByPlus } = useQuery({
    queryKey: ["users", "by-plus"],
    queryFn: countUsersByPlus,
  });

  const { data: topTherapists, isLoading: loadingTop } = useQuery({
    queryKey: ["therapists", "top", getMonthKey()],
    queryFn: () => topTherapistsBySessions(getMonthKey(), 5),
  });

  const { data: completionRate, isLoading: loadingCompletionRate } = useQuery({
    queryKey: ["sessions", "completion-rate"],
    queryFn: getSessionCompletionRate,
  });

  const { data: newUsers7d } = useQuery({
    queryKey: ["users", "new-7d"],
    queryFn: countNewUsers7d,
  });

  const { data: newUsers30d } = useQuery({
    queryKey: ["users", "new-30d"],
    queryFn: countNewUsers30d,
  });

  const { data: wau } = useQuery({
    queryKey: ["users", "wau"],
    queryFn: countWAU,
  });

  const { data: mau } = useQuery({
    queryKey: ["users", "mau"],
    queryFn: countMAU,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-elma-ink/60">Loading...</div>
      </div>
    );
  }

  const subscriptionsRevenue = 0; // Placeholder

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Dashboard" />
        <main className="p-8">
          <Section title="Key Metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Users"
                value={totalUsers?.toLocaleString() || "0"}
                loading={loadingUsers}
                icon="👥"
              />
              <StatCard
                title="DAU (Today)"
                value={dau?.toLocaleString() || "0"}
                loading={loadingDAU}
                icon="📱"
              />
              <StatCard
                title="New Users Today"
                value={newUsersToday?.toLocaleString() || "0"}
                loading={loadingNewToday}
                icon="✨"
              />
              <StatCard
                title="Psychologists"
                value={totalTherapists?.toLocaleString() || "0"}
                loading={loadingTherapists}
                icon="👨‍⚕️"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Completed Sessions"
                value={completedSessions?.toLocaleString() || "0"}
                loading={loadingSessions}
                icon="✅"
              />
              <StatCard
                title="Monthly Revenue"
                value={inr(monthRevenue || 0)}
                loading={loadingRevenue}
                icon="💰"
              />
              <StatCard
                title="Free Users"
                value={usersByPlus?.free?.toLocaleString() || "0"}
                loading={loadingByPlus}
                icon="🆓"
              />
              <StatCard
                title="Plus Users"
                value={usersByPlus?.plus?.toLocaleString() || "0"}
                loading={loadingByPlus}
                icon="⭐"
              />
            </div>
          </Section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Section title="Top Therapists (This Month)">
              <div className="bg-elma-white rounded-xl2 shadow-soft p-6">
                {loadingTop ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-elma-ink/5 rounded animate-pulse" />
                    ))}
                  </div>
                ) : topTherapists && topTherapists.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Sessions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topTherapists.map((t) => (
                        <TableRow key={t.therapistId}>
                          <TableCell>{t.name}</TableCell>
                          <TableCell>{t.monthSessions}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-elma-ink/60 text-center py-8">No data yet</p>
                )}
              </div>
            </Section>

            <Section title="Additional Stats">
              <div className="bg-elma-white rounded-xl2 shadow-soft p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-elma-ink/60">Session Completion Rate</span>
                  <span className="font-bold text-elma-ink">
                    {loadingCompletionRate ? "..." : `${completionRate}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-elma-ink/60">New Users (7 days)</span>
                  <span className="font-bold text-elma-ink">
                    {newUsers7d?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-elma-ink/60">New Users (30 days)</span>
                  <span className="font-bold text-elma-ink">
                    {newUsers30d?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-elma-ink/60">WAU (7 days)</span>
                  <span className="font-bold text-elma-ink">
                    {wau?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-elma-ink/60">MAU (30 days)</span>
                  <span className="font-bold text-elma-ink">
                    {mau?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
}
