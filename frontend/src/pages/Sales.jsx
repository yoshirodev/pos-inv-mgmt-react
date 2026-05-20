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

export default function Sales() {
    const [data, setData]       = useState(null);
    const [daily, setDaily]     = useState([]);
    const [weekly, setWeekly]   = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);
    const [refreshing, setRefreshing]   = useState(false);

    const role   = localStorage.getItem("role");
    const userID = localStorage.getItem("user_id");

    const fetchSales = async () => {
        const [d, w, m] = await Promise.all([
            getDailySales(),
            getWeeklySales(),
            getMonthlySales(),
        ]);
        setDaily(d.data);
        setWeekly(w.data);
        setMonthly(m.data);
    };

    useEffect(() => {
        getDashboard(userID).then(res => setData(res.data));
        fetchSales();
    }, []);

    if (!data) return null;

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchSales();
        } finally {
            setRefreshing(false);
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

                        {/* ── Refresh button ── */}
                        <div className="role-box">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                style={{
                                    background: refreshing ? "#94a3b8" : "#2563eb",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "9px 20px",
                                    fontWeight: 600,
                                    fontSize: "14px",
                                    cursor: refreshing ? "not-allowed" : "pointer",
                                    transition: "background 0.2s",
                                }}
                            >
                                {refreshing ? "Refreshing…" : "Refresh"}
                            </button>
                        </div>

                        {/* ── Daily Sales ── */}
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
                                                No transactions found.
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

                        {/* ── Weekly Sales ── */}
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
                                                No transactions found.
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

                        {/* ── Monthly Sales ── */}
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
                                                No transactions found.
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