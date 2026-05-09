import { Link } from "react-router-dom";

export default function Sidebar({ today }) {
    return (
        <div className="sidebar">

            <div className="logo-box">
                <img src="../../public/logo.png" alt="Logo" />
            </div>

            <div className="date-box">
                <p><strong>Today</strong></p>
                <p>{today}</p>
            </div>

            <Link to="/dashboard">Dashboard</Link>
            <Link to="/inventory">Inventory</Link>
            <Link to="/sales">Sales Overview</Link>
            <Link to="/transactions">Transactions</Link>
        </div>
    );
}