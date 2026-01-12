import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import Section from "shared-ui/Section";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared-ui/Table.jsx";
import { getAllTherapistInformation } from "../services/payout";
import LoaderModal from "../components/Loader";

const INR = (x = 0) => {
  try {
    return "₹" + Math.round(x).toLocaleString("en-IN");
  } catch {
    return "₹0";
  }
};

export default function Payouts() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await getAllTherapistInformation();
        setStats(data || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FAFAFF]">
      <Sidebar />

      <div className="flex-1">
        <Topbar title="Payouts Tracker" />

        <main style={{ padding: "32px 24px" }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#3A116D",
              marginBottom: 12,
            }}
          >
            Therapist Payouts
          </h2>

          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            {isLoading ? (
             <LoaderModal text="Loading Payouts..." visible={isLoading} />
            ) : stats.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Therapist</TableHead>
                    <TableHead align="right">Sessions (Month)</TableHead>
                    <TableHead align="right">Sessions (Lifetime)</TableHead>
                    <TableHead align="right">Owed (Month)</TableHead>
                    <TableHead align="right">Lifetime Earnings</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {stats.map((t) => (
                    <TableRow key={t.therapistId}>
                      <TableCell style={{ fontWeight: 600 }}>
                        {t.name}
                      </TableCell>
                      <TableCell align="right">
                        {t.monthSessions}
                      </TableCell>
                      <TableCell align="right">
                        {t.lifetimeSessions}
                      </TableCell>
                      <TableCell align="right">
                        {INR(t.monthPayout)}
                      </TableCell>
                      <TableCell align="right" style={{ fontWeight: 600 }}>
                        {INR(t.lifetimePayout)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div style={{ padding: 24, color: "#777" }}>
                No payout data available.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
