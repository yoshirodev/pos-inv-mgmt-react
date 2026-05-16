import { Link } from "react-router-dom";

export default function Sidebar({ today }) {
    return (
        <div className="sidebar">
            <div className="date-box">
                <p><strong>Wonder Water</strong></p>
                <p>Managemnent</p>
            </div>

            <Link to="/dashboard">Dashboard <i class="fa-solid fa-chart-pie"></i></Link>
            <Link to="/inventory">Inventory <i class="fa-solid fa-boxes-stacked"></i></Link>
            <Link to="/sales">Sales Overview <i class="fa-solid fa-chart-line"></i></Link>
            <Link to="/services">Services and Payment<i class="fa-solid fa-concierge-bell"></i></Link>
            <Link to="/transactions">Product Payments <i class="fa-solid fa-exchange-alt"></i></Link>
        </div>
    );
}