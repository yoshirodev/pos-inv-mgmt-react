import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import {
    getDashboard,
    getDailySales,
    getWeeklySales,
    getMonthlySales,
} from "../services/api";

async function syncSalesFromLogs() {
    const res = await fetch("/api/sales/sync", { method: "POST" });
    if (!res.ok) throw new Error("Sync failed");
    return res.json();
}

export default function Sales() {
    const [data, setData]         = useState(null);
    const [daily, setDaily]       = useState([]);
    const [weekly, setWeekly]     = useState([]);
    const [monthly, setMonthly]   = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);
    const [syncing, setSyncing]   = useState(false);
    const [syncMsg, setSyncMsg]   = useState("");

    const role   = localStorage.getItem("role");
    const userID = localStorage.getItem("user_id");

    // Fetch all sales data from the backend
    const fetchSales = () => {
        getDailySales().then(res => setDaily(res.data));
        getWeeklySales().then(res => setWeekly(res.data));
        getMonthlySales().then(res => setMonthly(res.data));
    };

    useEffect(() => {
        getDashboard(userID).then(res => setData(res.data));
        fetchSales();
    }, []);

    if (!data) return null;

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    const handleSync = async () => {
        setSyncing(true);
        setSyncMsg("");
        try {
            const result = await syncSalesFromLogs();
            setSyncMsg(
                `Sync complete — ${result.synced.days} day(s), ` +
                `${result.synced.weeks} week(s), ` +
                `${result.synced.months} month(s) updated.`
            );
            // Re-fetch all three tables so the UI reflects the DB
            fetchSales();
        } catch (err) {
            setSyncMsg("Sync failed. Check the console.");
            console.error(err);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div>
            <Sidebar today={today} />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />

            <div className="main">

                <section className="main-section">
                    <h1>
                        Sales Overview <i className="fa-solid fa-chart-line"></i>
                    </h1>
                </section>

                {role === "Manager" ? (
                    <section className="role-section">

                        {/* ── Sync button ──────────────────────────────── */}
                        <div className="role-box" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                style={{
                                    background: syncing ? "#94a3b8" : "#2563eb",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "9px 20px",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    cursor: syncing ? "not-allowed" : "pointer",
                                    transition: "background 0.2s",
                                }}
                            >
                                {syncing ? "Syncing…" : "Update Tables"}
                            </button>
                            {syncMsg && (
                                <span style={{ fontSize: "13px", color: "#10b981", fontWeight: 500 }}>
                                    
                                </span>
                            )}
                        </div>

                        {/* ── Daily Sales ──────────────────────────────── */}
                        <div className="role-box">
                            <h2>Daily Sales</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Date</th>
                                        <th>Total Transactions</th>
                                        <th>Total Items Sold</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {daily.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>
                                                No data — click Sync to populate.
                                            </td>
                                        </tr>
                                    ) : (
                                        daily.map(d => (
                                            <tr key={d.daily_id}>
                                                <td>{d.daily_id}</td>
                                                <td>{d.sales_date}</td>
                                                <td>{d.total_transactions}</td>
                                                <td>{d.total_items_sold}</td>
                                                <td>₱{parseFloat(d.total_revenue).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Weekly Sales ─────────────────────────────── */}
                        <div className="role-box">
                            <h2>Weekly Sales</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Week No.</th>
                                        <th>Year</th>
                                        <th>Total Transactions</th>
                                        <th>Total Items Sold</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weekly.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>
                                                No data — click Sync to populate.
                                            </td>
                                        </tr>
                                    ) : (
                                        weekly.map(w => (
                                            <tr key={w.weekly_id}>
                                                <td>{w.weekly_id}</td>
                                                <td>Week {w.week_number}</td>
                                                <td>{w.year}</td>
                                                <td>{w.total_transactions}</td>
                                                <td>{w.total_items_sold}</td>
                                                <td>₱{parseFloat(w.total_revenue).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Monthly Sales ────────────────────────────── */}
                        <div className="role-box">
                            <h2>Monthly Sales</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Month</th>
                                        <th>Year</th>
                                        <th>Total Transactions</th>
                                        <th>Total Items Sold</th>
                                        <th>Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthly.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>
                                                No data — click Sync to populate.
                                            </td>
                                        </tr>
                                    ) : (
                                        monthly.map(m => (
                                            <tr key={m.monthly_id}>
                                                <td>{m.monthly_id}</td>
                                                <td>{new Date(m.year, m.month - 1).toLocaleString("en-US", { month: "long" })}</td>
                                                <td>{m.year}</td>
                                                <td>{m.total_transactions}</td>
                                                <td>{m.total_items_sold}</td>
                                                <td>₱{parseFloat(m.total_revenue).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </section>
                ) : (
                    <div style={{ padding: "20px", color: "red", fontSize: "20px" }}>
                        No Access
                    </div>
                )}
            </div>
        </div>
    );
}