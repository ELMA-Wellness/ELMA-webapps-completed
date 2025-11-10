import { useQuery } from "@tanstack/react-query";
import { useAdminGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Section from "shared-ui/Section";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "shared-ui/Table";
import { inr } from "shared-core/money";
import { getMonthKey } from "shared-core/dates";
import { therapistStatsForMonth } from "shared-core/metrics";

export default function Payouts() {
  const { loading: authLoading } = useAdminGuard();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["payouts", getMonthKey()],
    queryFn: () => therapistStatsForMonth(getMonthKey()),
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
        <Topbar title="Payouts Tracker" />
        <main className="p-8">
          <Section title="Therapist Payouts">
            <div className="bg-elma-white rounded-xl2 shadow-soft overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-elma-ink/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : stats && stats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Therapist Name</TableHead>
                      <TableHead>Sessions (Month)</TableHead>
                      <TableHead>Sessions (Lifetime)</TableHead>
                      <TableHead>Owed This Month</TableHead>
                      <TableHead>Lifetime Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.map((therapist) => (
                      <TableRow key={therapist.therapistId}>
                        <TableCell className="font-medium">{therapist.name}</TableCell>
                        <TableCell>{therapist.monthSessions}</TableCell>
                        <TableCell>{therapist.lifetimeSessions}</TableCell>
                        <TableCell className="font-semibold text-elma-purple">
                          {inr(therapist.monthPayout)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {inr(therapist.lifetimePayout)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-elma-ink/60">
                  No payout data available
                </div>
              )}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
