import { useQuery } from "@tanstack/react-query";
import { useTherapistGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatCard from "shared-ui/StatCard";
import Section from "shared-ui/Section";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "shared-ui/Table";
import { inr } from "shared-core/money";
import { formatDate, formatTime } from "shared-core/dates";
import {
  getTherapistTodaySessions,
  getTherapistCompletedCount,
  getTherapistEarnings,
} from "shared-core/metrics";
import { doc, getDoc } from "firebase/firestore";
import { db } from "shared-core/firebase";

async function getUserName(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data().name : "Unknown";
  } catch {
    return "Unknown";
  }
}

export default function Dashboard() {
  const { loading: authLoading, user } = useTherapistGuard();

  const { data: todaySessions, isLoading: loadingToday } = useQuery({
    queryKey: ["sessions", "today", user?.uid],
    queryFn: () => getTherapistTodaySessions(user.uid),
    enabled: !!user,
  });

  const { data: completedCount, isLoading: loadingCompleted } = useQuery({
    queryKey: ["sessions", "completed", user?.uid],
    queryFn: () => getTherapistCompletedCount(user.uid),
    enabled: !!user,
  });

  const { data: earnings, isLoading: loadingEarnings } = useQuery({
    queryKey: ["earnings", user?.uid],
    queryFn: () => getTherapistEarnings(user.uid),
    enabled: !!user,
  });

  // Enrich today's sessions with user names
  const { data: enrichedSessions } = useQuery({
    queryKey: ["sessions", "today-enriched", todaySessions],
    queryFn: async () => {
      if (!todaySessions) return [];
      const sessions = await Promise.all(
        todaySessions.map(async (session) => ({
          ...session,
          userName: await getUserName(session.userId),
        }))
      );
      return sessions;
    },
    enabled: !!todaySessions && todaySessions.length > 0,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-elma-ink/60">Loading...</div>
      </div>
    );
  }

  const upcomingCount = todaySessions?.filter(s => s.status === "scheduled").length || 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar title="Dashboard" />
        <main className="p-8">
          <Section title="Overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Today's Upcoming"
                value={upcomingCount.toString()}
                loading={loadingToday}
                icon="📅"
              />
              <StatCard
                title="Completed Sessions"
                value={completedCount?.toLocaleString() || "0"}
                loading={loadingCompleted}
                icon="✅"
              />
              <StatCard
                title="Monthly Earnings"
                value={inr(earnings?.monthly || 0)}
                loading={loadingEarnings}
                icon="💰"
              />
              <StatCard
                title="Lifetime Earnings"
                value={inr(earnings?.lifetime || 0)}
                loading={loadingEarnings}
                icon="⭐"
              />
            </div>
          </Section>

          <Section title="Today's Sessions">
            <div className="bg-elma-white rounded-xl2 shadow-soft overflow-hidden">
              {loadingToday ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-elma-ink/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : enrichedSessions && enrichedSessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Meet Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {formatTime(session.startAt.toDate())}
                        </TableCell>
                        <TableCell>{session.userName}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === "scheduled"
                                ? "bg-elma-sky/20 text-elma-ink"
                                : session.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {session.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {session.meetLink ? (
                            <a
                              href={session.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-elma-purple hover:underline"
                            >
                              Join
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-elma-ink/60">
                  No sessions scheduled for today
                </div>
              )}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
