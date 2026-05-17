import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import {
    getDashboard,
    getServicesCart,
    deleteServiceCartItem,
    checkoutService,
    getServices,
    doneService,
    assignPersonel,
    getPersonel,
    createPersonel,
    deletePersonel,
} from "../services/api";

export default function Services() {
    const [data, setData]               = useState(null);
    const [serviceCart, setServiceCart] = useState([]);
    const [services, setServices]       = useState([]);
    const [personelList, setPersonelList] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);
    const [payment, setPayment]         = useState({ paymethod: "", amount: "", refnum: "" });

    // ── Personnel creation form ────────────────────────────────
    const [personelForm, setPersonelForm] = useState({
        first_name: "", last_name: "", email: "", phone_no: ""
    });

    // ── Delete warning modal state ─────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState(null); // { perso_id, name }

    const role   = localStorage.getItem("role");
    const userID = localStorage.getItem("user_id");

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });

    const fetchAll = () => {
        getDashboard(userID).then(res => setData(res.data));
        getServicesCart().then(res => setServiceCart(res.data));
        getServices().then(res => setServices(res.data));
        getPersonel().then(res => setPersonelList(res.data));
    };

    useEffect(() => { fetchAll(); }, []);

    if (!data) return null;

    // ── Mark service as done → moves to service cart ──────────
    const handleServiceDone = (service_id) => {
        doneService(service_id).then(res => {
            setServiceCart(res.data);
            getServices().then(r => setServices(r.data));
        });
    };

    // ── Auto-save personnel assignment on dropdown change ──────
    const handleAssignPersonel = (service_id, perso_id) => {
        assignPersonel({ service_id, perso_id: perso_id || null }).then(() => {
            getServices().then(r => setServices(r.data));
        });
    };

    // ── Remove item from service cart ─────────────────────────
    const handleDeleteCartItem = (index) => {
        deleteServiceCartItem(index).then(res => setServiceCart(res.data));
    };

    // ── Checkout service cart ─────────────────────────────────
    const handleCheckout = (e) => {
        e.preventDefault();
        checkoutService(payment).then(res => {
            if (res.data.error) {
                alert(res.data.error);
            } else {
                alert("Success! Change: ₱" + res.data.change);
                setServiceCart([]);
                setPayment({ paymethod: "", amount: "", refnum: "" });
                getServices().then(r => setServices(r.data));
            }
        });
    };

    // ── Create personnel ───────────────────────────────────────
    const handleCreatePersonel = (e) => {
        e.preventDefault();
        createPersonel(personelForm).then(res => {
            if (res.data.error) {
                alert(res.data.error);
                return;
            }
            setPersonelForm({ first_name: "", last_name: "", email: "", phone_no: "" });
            getPersonel().then(r => setPersonelList(r.data));
        });
    };

    // ── Delete personnel (confirmed via modal) ─────────────────
    const handleDeletePersonel = () => {
        const confirm = window.confirm("Are you sure to delete this personel?");
        if (!confirm) return;

        deletePersonel(deleteTarget.perso_id).then(() => {
            setDeleteTarget(null);
            getPersonel().then(r => setPersonelList(r.data));
            getServices().then(r => setServices(r.data));
        });
    };

    const total = serviceCart.reduce((sum, i) => sum + i.subtotal, 0);

    return (
        <div>
            <Sidebar today={today} />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />

            <div className="main">

                {/* ── Services Table ────────────────────────── */}
                <div className="section-box role-box">
                    <h2>Services</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Service Personnel</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map(s => (
                                <tr key={s.service_id}>
                                    <td>{s.service_id}</td>
                                    <td>{s.service_ordered}</td>
                                    <td>{s.status}</td>

                                    {/* ── Personnel column ── */}
                                    <td>
                                        {s.status === "Pending" ? (
                                            // Pending → show dropdown to assign
                                            <select
                                                value={s.perso_id || ""}
                                                onChange={e =>
                                                    handleAssignPersonel(s.service_id, e.target.value)
                                                }
                                            >
                                                <option value="">-- Assign --</option>
                                                {personelList.map(p => (
                                                    <option key={p.perso_id} value={p.perso_id}>
                                                        {p.first_name} {p.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            // Payment / Done → show assigned name
                                            <span>
                                                {s.personel_name || (
                                                    <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                                                        Unassigned
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </td>

                                    {/* ── Action column ── */}
                                    <td>
                                        {s.status === "Pending" && (
                                            <button onClick={() => handleServiceDone(s.service_id)}>
                                                Done
                                            </button>
                                        )}
                                        {s.status === "Payment" && (
                                            <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: 13 }}>
                                                Awaiting Payment
                                            </span>
                                        )}
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

                {/* ── Pending Service Cart ──────────────────── */}
                <div className="section-box role-box">
                    <h2>Pending Payment</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {serviceCart.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.product}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price}</td>
                                    <td>{item.subtotal}</td>
                                    <td>
                                        <button onClick={() => handleDeleteCartItem(index)}>X</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Payment (only shown when service cart has items) ── */}
                {serviceCart.length > 0 && (
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

                {/* ── Service Personnel Section (Manager only) ── */}
                {role === "Manager" && (
                    <>
                        {/* Create Personnel Form */}
                        <div className="section-box cart-box role-box">
                            <h2>Add Service Personnel</h2>
                            <form onSubmit={handleCreatePersonel}>
                                <div className="cart-row">
                                    <div className="cart-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={personelForm.first_name}
                                            onChange={e => setPersonelForm({ ...personelForm, first_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="cart-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={personelForm.last_name}
                                            onChange={e => setPersonelForm({ ...personelForm, last_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="cart-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={personelForm.email}
                                            onChange={e => setPersonelForm({ ...personelForm, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="cart-group">
                                        <label>Phone No.</label>
                                        <input
                                            type="text"
                                            value={personelForm.phone_no}
                                            onChange={e => setPersonelForm({ ...personelForm, phone_no: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit">Add Personnel</button>
                                </div>
                            </form>
                        </div>

                        {/* Personnel Table */}
                        <div className="section-box role-box">
                            <h2>Service Personnel</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                        <th>Email</th>
                                        <th>Phone No.</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {personelList.map(p => (
                                        <tr key={p.perso_id}>
                                            <td>{p.perso_id}</td>
                                            <td>{p.first_name}</td>
                                            <td>{p.last_name}</td>
                                            <td>{p.email || "—"}</td>
                                            <td>{p.phone_no || "—"}</td>
                                            <td>
                                                <button
                                                    className="empDelButton"
                                                    onClick={() => handleDeletePersonel({
                                                        perso_id: p.perso_id,
                                                        name: `${p.first_name} ${p.last_name}`
                                                    })}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}