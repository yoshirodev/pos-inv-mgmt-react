import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import {
    getDashboard,
    getServicesCart,
    deleteServiceItem,
    checkout,
    getServices,
    doneService
} from "../services/api";

export default function Services()  {
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [services, setServices] = useState([]);

    const role = localStorage.getItem("role");
    const [profileOpen, setProfileOpen] = useState(false);

    const [payment, setPayment] = useState({ paymethod: "", amount: "", refnum: "" });

    const userID = localStorage.getItem("user_id");

    // ── Fetch everything ──────────────────────────────────────
    const fetchAll = () => {
        getDashboard(userID).then(res => setData(res.data));
        getServicesCart().then(res => setCart(res.data));
        getServices().then(res => setServices(res.data));
    };

    useEffect(() => {
        fetchAll();
    }, []);

    if (!data) return null;

     // ── Remove from cart ──────────────────────────────────────
    const handleDelete = (index) => {
        deleteServiceItem(index).then(res => setCart(res.data));
    };

    // ── Checkout ──────────────────────────────────────────────
    const handleCheckout = (e) => {
        e.preventDefault();
        checkout(payment).then(res => {
            if (res.data.error) {
                alert(res.data.error);
            } else {
                alert("Success! Change: ₱" + res.data.change);
                setCart([]);
                setPayment({ paymethod: "", amount: "", refnum: "" });
                // Re-fetch logs and services to reflect updated statuses
                getLogs().then(r => setLogs(r.data));
                getServices().then(r => setServices(r.data));
            }
        });
    };

    const handleServiceDone = (service_id) => {
        doneService(service_id).then(res => {

            setCart(res.data);

            getServices().then(r => setServices(r.data));
        });
    };


    const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

    return (
        <div>
            <Sidebar/>
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />

            <div className="main">
                {/* ── Payment (only shown when cart has items) ─ */}
                {cart.length > 0 && (
                    <div className="section-box payment-box">
                        <h2>Payment</h2>
                        <h4>Total: ₱{total}</h4>

                        <form onSubmit={handleCheckout}>
                            <div className="payment-row">
                                <div className="payment-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={payment.paymethod}
                                        onChange={e => setPayment({ ...payment, paymethod: e.target.value })}
                                    >
                                        <option value="">--Select--</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Maya">Maya</option>
                                        <option value="MariBank">MariBank</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>

                                <div className="payment-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        required
                                        value={payment.amount}
                                        onChange={e => setPayment({ ...payment, amount: e.target.value })}
                                    />
                                </div>

                                <div className="payment-group">
                                    <label>Reference</label>
                                    <input
                                        type="number"
                                        value={payment.refnum}
                                        onChange={e => setPayment({ ...payment, refnum: e.target.value })}
                                    />
                                </div>

                                <button type="submit">Checkout</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Pending Cart Table ────────────────────── */}
                <div className="section-box role-box">
                    <h2>Pending</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.product}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price}</td>
                                    <td>{item.subtotal}</td>
                                    <td>
                                        <button onClick={() => handleDelete(index)}>X</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Services Table ────────────────────────── */}
                <div className="section-box role-box">
                    <h2>Services</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(s => (
                                <tr key={s.service_id}>
                                    <td>{s.service_id}</td>
                                    <td>{s.service_ordered}</td>
                                    <td>{s.status}</td>
                                    <td>
                                        {/* Pending → click Done → adds to cart, status becomes "Payment" */}
                                        {s.status === "Pending" && (
                                            <button onClick={() => handleServiceDone(s.service_id)}>
                                                Done
                                            </button>
                                        )}
                                        {/* Payment → waiting for cashier checkout, no button needed */}
                                        {s.status === "Payment" && (
                                            <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: 13 }}>
                                                Awaiting Payment
                                            </span>
                                        )}
                                        {/* Done = fully paid */}
                                        {s.status === "Done" && (
                                            <span style={{ color: "#10b981", fontWeight: 600, fontSize: 13 }}>
                                                ✓ Paid
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}