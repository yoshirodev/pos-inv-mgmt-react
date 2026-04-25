import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import { getDashboard, deleteUser } from "../services/api";

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    const userID = localStorage.getItem("user_id");

    useEffect(() => {
        getDashboard(userID).then(res => {
            setData(res.data);
        });
    }, []);

    if (!data) return null;

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    const handleDelete = (id) => {
        deleteUser(id).then(() => {
            setData({
                ...data,
                accounts: data.accounts.filter(a => a.accID !== id)
            });
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
                    <div className="role-box"><h2>Here's what's happening with the store today.</h2></div>

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
                    <div className="role-box">
                        <h3>HR Management</h3>
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
                                            <button className="empDelButton" onClick={() => handleDelete(row.accID)}>
                                                Delete
                                            </button>
                                        </td>
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
