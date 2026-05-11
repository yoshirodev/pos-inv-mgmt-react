import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import { getDashboard, deleteUser, createUser } from "../services/api";

const EMPTY_FORM = {
    lastname: "", firstname: "", middlename: "",
    birthdate: "", gender: "Male", phonenumber: "",
    email: "", username: "", userpassword: "", accountType: "Employee"
};

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    // Account creation form state
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const userID = localStorage.getItem("user_id");

    useEffect(() => {
        getDashboard(userID).then(res => setData(res.data));
    }, []);

    if (!data) return null;

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit", minute: "2-digit"
    });

const handleDelete = (id) => {
    const role = localStorage.getItem("role");

    const firstConfirm = window.confirm("Are you sure you want to delete this employee?");
    if (!firstConfirm) return;

    if (role === "HR") {
        const secondConfirm = window.confirm("This action is permanent and cannot be undone. Confirm again?");
        if (!secondConfirm) return;
    }

    deleteUser(id).then(() => {
        const currentUserId = localStorage.getItem("user_id");

        if (currentUserId === String(id)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            localStorage.removeItem("role");
            window.location.href = "/Login";
            return;
        }

        setData({
            ...data,
            accounts: data.accounts.filter(a => a.accID !== id)
        });
    });
};

    // ── Handle form input change ──────────────────────────────
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError("");
        setFormSuccess("");
    };

    // ── Submit new account ────────────────────────────────────
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
                // Re-fetch dashboard to update the accounts table
                getDashboard(userID).then(r => setData(r.data));
                // Auto-close form after 1.5s
                setTimeout(() => {
                    setShowForm(false);
                    setFormSuccess("");
                }, 1500);
            }
        }).catch(err => {
            setFormError(err.response?.data?.error || "Something went wrong.");
        }).finally(() => {
            setSubmitting(false);
        });
    };

    return (
        <div>
            <Sidebar today={today} />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />

            <div className="main">
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
                        <div className="card">
                            <h2><strong>Today</strong></h2>
                            <p>{today}</p>
                        </div>
                        <div className="card">
                            <h2><strong>Time</strong></h2>
                            <p>{time}</p>
                        </div>
                    </div>
                </section>

                <section className="role-section">
                    {data.user.accountType === "Manager" && (
                        <>
                            {/* ── Account Management Table ─────────── */}
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

                            {/* ── Account Creation Form (appears below) */}
                            {showForm && (
                                <div className="role-box account-creation-form">
                                    <h2>
                                        <i className="fa-solid fa-user-plus"></i> Create New Account
                                    </h2>

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
                                                    <option value="HR">HR</option>
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