import { Link } from "react-router-dom";

export default function Sidebar({ today }) {
    return (
        <div className="sidebar">
            <div className="date-box">
                <p><strong>Today</strong></p>
                <p>{today}</p>
            </div>

            <Link to="/dashboard">Dashboard <i class="fa-solid fa-chart-pie"></i></Link>
            <Link to="/inventory">Inventory <i class="fa-solid fa-boxes-stacked"></i></Link>
            <Link to="/sales">Sales Overview <i class="fa-solid fa-chart-line"></i></Link>
            <Link to="/transactions">Transactions <i class="fa-solid fa-exchange-alt"></i></Link>
        </div>
    );
}