import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import { getDailySales, getWeeklySales, getMonthlySales } from "../services/api";

export default function Sales() {
    const [daily, setDaily] = useState([]);
    const [weekly, setWeekly] = useState([]);
    const [monthly, setMonthly] = useState([]);

    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        getDailySales().then(res => setDaily(res.data));
        getWeeklySales().then(res => setWeekly(res.data));
        getMonthlySales().then(res => setMonthly(res.data));
    }, []);

    const today = new Date().toLocaleDateString();

    return (
        <div>
            <Sidebar today={today} />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={{}} visible={profileOpen} />

            <div className="main">

                <section className="main-section">
                    <h1>Sales Overview <i className="fa-solid fa-chart-line"></i></h1>
                </section>

                <section className="role-section">

                    <div className="role-box">
                        <h3>Daily Sales</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Total Revenue</th>
                                    <th>Total Items</th>
                                    <th>Total Transactions</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {daily.map(d => (
                                    <tr key={d.daily_id}>
                                        <td>{d.daily_id}</td>
                                        <td>{d.total_revenue}</td>
                                        <td>{d.total_items_sold}</td>
                                        <td>{d.total_transactions}</td>
                                        <td>{d.sales_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="role-box">
                        <h3>Weekly Sales</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Total Revenue</th>
                                    <th>Total Items</th>
                                    <th>Total Transactions</th>
                                    <th>Week</th>
                                    <th>Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weekly.map(w => (
                                    <tr key={w.weekly_id}>
                                        <td>{w.weekly_id}</td>
                                        <td>{w.total_revenue}</td>
                                        <td>{w.total_items_sold}</td>
                                        <td>{w.total_transactions}</td>
                                        <td>{w.week_number}</td>
                                        <td>{w.year}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="role-box">
                        <h3>Monthly Sales</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Total Revenue</th>
                                    <th>Total Items</th>
                                    <th>Total Transactions</th>
                                    <th>Month</th>
                                    <th>Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthly.map(m => (
                                    <tr key={m.monthly_id}>
                                        <td>{m.monthly_id}</td>
                                        <td>{m.total_revenue}</td>
                                        <td>{m.total_items_sold}</td>
                                        <td>{m.total_transactions}</td>
                                        <td>{m.month}</td>
                                        <td>{m.year}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </section>
            </div>
        </div>
    );
}
