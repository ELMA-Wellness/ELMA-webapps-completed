import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    query,
    orderBy,
} from "firebase/firestore";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { db } from "../firebase/config";

const COLORS = ["#07112E", "#2a4bff", "#ff9f40"];

const AnalyticsDashboard = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScans = async () => {
            try {
                const qRef = query(
                    collection(db, "qrScans"),
                    orderBy("createdAt", "asc")
                );
                const snap = await getDocs(qRef);
                const data = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                }));
                console.log("scans data",data)
                setScans(data);
            } catch (err) {
                console.error("Error fetching scans", err);
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, []);

    const totalScans = scans.length;

    const deviceCounts = scans.reduce((acc, s) => {
        const d = s.device || "unknown";
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {});

    const deviceData = Object.entries(deviceCounts).map(
        ([device, count]) => ({ name: device, value: count })
    );

    // Group by day
    const scansPerDayMap = scans.reduce((acc, s) => {
        const ts = s.createdAt?.toDate?.() || new Date();
        const key = ts.toISOString().slice(0, 10); // YYYY-MM-DD
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const scansPerDay = Object.entries(scansPerDayMap)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, count]) => ({ date, count }));

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h1 style={styles.title}>ELMA QR Analytics</h1>
                <p style={styles.subtitle}>
                    Basic view of QR scans and device breakdown.
                </p>

                {loading ? (
                    <p>Loading…</p>
                ) : (
                    <>
                        <div style={styles.metricsRow}>
                            <div style={styles.metricBox}>
                                <p style={styles.metricLabel}>Total Scans</p>
                                <p style={styles.metricValue}>{totalScans}</p>
                            </div>
                            <div style={styles.metricBox}>
                                <p style={styles.metricLabel}>Unique Devices (types)</p>
                                <p style={styles.metricValue}>
                                    {Object.keys(deviceCounts).length}
                                </p>
                            </div>
                        </div>

                        <div style={styles.chartsRow}>
                            <div style={styles.chartCard}>
                                <h3 style={styles.chartTitle}>Scans per Day</h3>
                                {scansPerDay.length === 0 ? (
                                    <p style={styles.emptyText}>No data yet.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <LineChart data={scansPerDay}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#07112E"
                                                strokeWidth={2}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div style={styles.chartCard}>
                                <h3 style={styles.chartTitle}>Device Breakdown</h3>
                                {deviceData.length === 0 ? (
                                    <p style={styles.emptyText}>No data yet.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={deviceData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {deviceData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f4f6fb",
        padding: 24,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI'",
    },
    card: {
        maxWidth: 1100,
        margin: "0 auto",
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 18px 40px rgba(7,17,46,0.08)",
        padding: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: 700,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#7f879f",
        marginBottom: 20,
    },
    metricsRow: {
        display: "flex",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap",
    },
    metricBox: {
        flex: 1,
        minWidth: 180,
        background: "#f6f7ff",
        borderRadius: 16,
        padding: 16,
    },
    metricLabel: {
        fontSize: 12,
        textTransform: "uppercase",
        color: "#9aa1b8",
        marginBottom: 6,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 700,
    },
    chartsRow: {
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
    },
    chartCard: {
        flex: 1,
        minWidth: 320,
        background: "#fdfdff",
        borderRadius: 16,
        padding: 16,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: "#9aa1b8",
    },
};

export default AnalyticsDashboard;