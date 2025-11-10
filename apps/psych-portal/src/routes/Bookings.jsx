import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTherapistGuard } from "../lib/guards";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Section from "shared-ui/Section";
import Button from "shared-ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "shared-ui/Table";
import { formatDate, formatTime } from "shared-core/dates";
import { getTherapistBookings } from "shared-core/metrics";
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

export default function Bookings() {
  const { loading: authLoading, user } = useTherapistGuard();
  const [filter, setFilter] = useState("today");

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", user?.uid, filter],
    queryFn: () => getTherapistBookings(user.uid, filter),
    enabled: !!user,
  });

  const { data: enrichedBookings } = useQuery({
    queryKey: ["bookings", "enriched", bookings],
    queryFn: async () => {
      if (!bookings) return [];
      const sessions = await Promise.all(
        bookings.map(async (booking) => ({
          ...booking,
          userName: await getUserName(booking.userId),
        }))
      );
      return sessions;
    },
    enabled: !!bookings && bookings.length > 0,
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
        <Topbar title="Bookings" />
        <main className="p-8">
          <Section>
            <div className="flex gap-2 mb-6">
              <Button
                variant={filter === "today" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("today")}
              >
                Today
              </Button>
              <Button
                variant={filter === "week" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("week")}
              >
                This Week
              </Button>
              <Button
                variant={filter === "month" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("month")}
              >
                This Month
              </Button>
              <Button
                variant={filter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
            </div>

            <div className="bg-elma-white rounded-xl2 shadow-soft overflow-hidden">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-elma-ink/5 rounded animate-pulse" />
                  ))}
                </div>
              ) : enrichedBookings && enrichedBookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Meet Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.userName}
                        </TableCell>
                        <TableCell>
                          {formatDate(booking.startAt.toDate())}
                        </TableCell>
                        <TableCell>
                          {formatTime(booking.startAt.toDate())}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === "scheduled"
                                ? "bg-elma-sky/20 text-elma-ink"
                                : booking.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {booking.meetLink ? (
                            <div className="flex gap-2">
                              <a
                                href={booking.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-elma-purple hover:underline"
                              >
                                Join
                              </a>
                              <button
                                onClick={() => navigator.clipboard.writeText(booking.meetLink)}
                                className="text-elma-ink/60 hover:text-elma-ink text-xs"
                              >
                                Copy
                              </button>
                            </div>
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
                  No bookings found for this period
                </div>
              )}
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}
