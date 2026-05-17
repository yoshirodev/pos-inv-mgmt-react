import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import { getDashboard, deleteUser, createUser, getRevenueOverTime, getTopProducts } from "../services/api";
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ── Bar colors for top products ───────────────────────────────
const BAR_COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// ── Custom tooltip: Revenue line chart ───────────────────────
function RevenueTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 8, padding: "10px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)"
        }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 700, color: "#2563eb", fontSize: 15 }}>
                ₱{Number(payload[0].value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </div>
        </div>
    );
}

// ── Custom tooltip: Top products bar chart ────────────────────
function ProductTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 8, padding: "10px 14px",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)"
        }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 14 }}>
                ₱{Number(payload[0].value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
                {payload[0].payload.total_qty} units sold
            </div>
        </div>
    );
}

// ── Empty form state ──────────────────────────────────────────
const EMPTY_FORM = {
    lastname: "", firstname: "", middlename: "",
    birthdate: "", gender: "Male", phonenumber: "",
    email: "", username: "", userpassword: "", accountType: "Employee"
};

export default function Dashboard() {
    const [data, setData]           = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    // Chart data
    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    // Account creation form
    const [showForm, setShowForm]     = useState(false);
    const [formData, setFormData]     = useState(EMPTY_FORM);
    const [formError, setFormError]   = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const userID = localStorage.getItem("user_id");

    useEffect(() => {
        getDashboard(userID).then(res => {
            setData(res.data);
            const role = res.data.user.accountType;

            // Manager gets both charts
            if (role === "Manager") {
                getRevenueOverTime().then(r => {
                    setRevenueData(r.data.map(d => ({
                        ...d,
                        label: new Date(d.sale_date).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
                        total_revenue: parseFloat(d.total_revenue),
                    })));
                });
                getTopProducts().then(r => {
                    setTopProducts(r.data.map(d => ({
                        ...d,
                        short_name: d.product_name.length > 12 ? d.product_name.slice(0, 11) + "…" : d.product_name,
                        total_revenue: parseFloat(d.total_revenue),
                    })));
                });
            }

            // Employee gets top products only
            if (role === "Employee") {
                getTopProducts().then(r => {
                    setTopProducts(r.data.map(d => ({
                        ...d,
                        short_name: d.product_name.length > 12 ? d.product_name.slice(0, 11) + "…" : d.product_name,
                        total_revenue: parseFloat(d.total_revenue),
                    })));
                });
            }
        });
    }, []);

    if (!data) return null;

    const role = data.user.accountType;

    // ── Delete account ────────────────────────────────────────
    const handleDelete = (id) => {
        const confirm = window.confirm("Are you sure to delete this employee?");
        if (!confirm) return;

        deleteUser(id).then(res => {
            if (res.data.error) {
                alert(res.data.error);
                return;
            }
            setData({ ...data, accounts: data.accounts.filter(a => a.accID !== id) });
        });
    };

    // ── Form handlers ─────────────────────────────────────────
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError("");
        setFormSuccess("");
    };

    const handleCreate = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError("");
        setFormSuccess("");

        createUser(formData).then(res => {
            if (res.data.error) {
                setFormError(res.data.error);
            } else {
                setFormSuccess("Account created successfully!");
                setFormData(EMPTY_FORM);
                getDashboard(userID).then(r => setData(r.data));
                setTimeout(() => { setShowForm(false); setFormSuccess(""); }, 1500);
            }
        }).catch(err => {
            setFormError(err.response?.data?.error || "Something went wrong.");
        }).finally(() => {
            setSubmitting(false);
        });
    };

    return (
        <div>
            <Sidebar/>
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />

            <div className="main">

                {/* ── Welcome + Stat Cards ──────────────────── */}
                <section className="main-section">
                    <h1 style={{ color: "#2563eb" }}>WELCOME BACK, {data.user.firstname}!</h1>
                    <div className="role-box">
                        <h2>Here's what's happening with the store today.</h2>
                    </div>

                    <h1>Dashboard <i className="fa-solid fa-chart-pie"></i></h1>

                    <div className="dashboard-cards">
                        <div className="card">
                            <h2>Sales Today</h2>
                            <p>₱{Number(data.today_sales).toLocaleString()}</p>
                        </div>
                        <div className="card">
                            <h2>Overall Stock</h2>
                            <p>{data.total_stock} Items</p>
                        </div>
                        <div className="card notification-card">
                            <h2>
                                System Notifications
                            </h2>

                            {data.low_stock.length === 0 ? (
                                <p className="notification-ok">
                                    All products are sufficiently stocked.
                                </p>
                            ) : (
                                <div className="notification-list">
                                    {data.low_stock.slice(0, 5).map((item) => (
                                        <div key={item.id} className="notification-item">
                                            <strong>{item.product_name}: </strong>
                                            <span>{item.quantity} left</span>
                                        </div>
                                    ))}

                                    {data.low_stock.length > 5 && (
                                        <p className="notification-more">
                                            +{data.low_stock.length - 5} more low stock items
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════
                    CHARTS — side by side
                    Manager: Revenue Over Time + Top Products
                    Employee: Top Products only (full width)
                ════════════════════════════════════════════ */}
                {(role === "Manager" || role === "Employee") && (
                    <div className="charts-row">

                        {/* Revenue Over Time — Manager only */}
                        {role === "Manager" && (
                            <div className="role-box chart-box">
                                <h3>
                                    Revenue Over Time
                                    <span className="chart-subtitle"> — Last 14 Days</span>
                                </h3>
                                {revenueData.length === 0 ? (
                                    <p className="chart-empty">No transaction data yet.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <LineChart data={revenueData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fontSize: 11, fill: "#64748b" }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: "#64748b" }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`}
                                            />
                                            <Tooltip content={<RevenueTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="total_revenue"
                                                stroke="#2563eb"
                                                strokeWidth={2.5}
                                                dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        )}

                        {/* Top Selling Products — Manager + Employee */}
                        <div className={`role-box chart-box${role === "Employee" ? " chart-box--full" : ""}`}>
                            <h3>
                                Top Selling Products
                                <span className="chart-subtitle"> — by Revenue</span>
                            </h3>
                            {topProducts.length === 0 ? (
                                <p className="chart-empty">No transaction data yet.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={topProducts} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="short_name"
                                            tick={{ fontSize: 11, fill: "#64748b" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: "#64748b" }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip content={<ProductTooltip />} />
                                        <Bar dataKey="total_revenue" radius={[6, 6, 0, 0]}>
                                            {topProducts.map((_, i) => (
                                                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                    </div>
                )}

                {/* ════════════════════════════════════════════
                    MANAGER — Account Management Table
                ════════════════════════════════════════════ */}
                <section className="role-section">
                    {role === "Manager" && (
                        <>
                            <div className="role-box">
                                <button
                                    className="btn-account-creation"
                                    onClick={() => {
                                        setShowForm(!showForm);
                                        setFormError("");
                                        setFormSuccess("");
                                        setFormData(EMPTY_FORM);
                                    }}
                                >
                                    <i className={`fa-solid ${showForm ? "fa-xmark" : "fa-user-plus"}`}></i>
                                    {showForm ? "Cancel" : "Account Creation"}
                                </button>

                                <h2>Account Management Table</h2>

                                <table>
                                    <thead>
                                        <tr>
                                            <th>accID</th>
                                            <th>Last Name</th>
                                            <th>First Name</th>
                                            <th>Middle Name</th>
                                            <th>Birthdate</th>
                                            <th>Gender</th>
                                            <th>Email</th>
                                            <th>Phone Number</th>
                                            <th>Account Type</th>
                                            <th>Username</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.accounts.map(row => (
                                            <tr key={row.accID}>
                                                <td>{row.accID}</td>
                                                <td>{row.lastname}</td>
                                                <td>{row.firstname}</td>
                                                <td>{row.middlename}</td>
                                                <td>{row.birthdate}</td>
                                                <td>{row.gender}</td>
                                                <td>{row.email}</td>
                                                <td>{row.phonenumber}</td>
                                                <td>{row.accountType}</td>
                                                <td>{row.username}</td>
                                                <td>
                                                    <button
                                                        className="empDelButton"
                                                        onClick={() => handleDelete(row.accID)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Account Creation Form */}
                            {showForm && (
                                <div className="role-box account-creation-form">
                                    <h3>
                                        <i className="fa-solid fa-user-plus"></i> Create New Account
                                    </h3>
                                    <form onSubmit={handleCreate}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Last Name <span className="required">*</span></label>
                                                <input type="text" name="lastname" placeholder="Last name"
                                                    value={formData.lastname} onChange={handleChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>First Name <span className="required">*</span></label>
                                                <input type="text" name="firstname" placeholder="First name"
                                                    value={formData.firstname} onChange={handleChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Middle Name</label>
                                                <input type="text" name="middlename" placeholder="Middle name"
                                                    value={formData.middlename} onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Birthdate <span className="required">*</span></label>
                                                <input type="date" name="birthdate"
                                                    value={formData.birthdate} onChange={handleChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Gender <span className="required">*</span></label>
                                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number <span className="required">*</span></label>
                                                <input type="tel" name="phonenumber" placeholder="123-456-7890"
                                                    value={formData.phonenumber} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Email <span className="required">*</span></label>
                                                <input type="email" name="email" placeholder="email@example.com"
                                                    value={formData.email} onChange={handleChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Username <span className="required">*</span></label>
                                                <input type="text" name="username" placeholder="username"
                                                    value={formData.username} onChange={handleChange} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Password <span className="required">*</span></label>
                                                <input type="password" name="userpassword" placeholder="password"
                                                    value={formData.userpassword} onChange={handleChange} required />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Account Type <span className="required">*</span></label>
                                                <select name="accountType" value={formData.accountType} onChange={handleChange}>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Employee">Employee</option>
                                                </select>
                                            </div>
                                        </div>

                                        {formError && (
                                            <div className="form-msg form-msg-error">
                                                <i className="fa-solid fa-circle-exclamation"></i> {formError}
                                            </div>
                                        )}
                                        {formSuccess && (
                                            <div className="form-msg form-msg-success">
                                                <i className="fa-solid fa-circle-check"></i> {formSuccess}
                                            </div>
                                        )}

                                        <div className="form-actions">
                                            <button type="submit" className="btn-submit-account" disabled={submitting}>
                                                {submitting ? "Creating…" : "Create Account"}
                                            </button>
                                            <button type="button" className="btn-cancel-account"
                                                onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); setFormError(""); }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </section>

            </div>
        </div>
    );
}