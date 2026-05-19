import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import {
    getDashboard,
    getProducts,
    getCart,
    addToCart,
    deleteCartItem,
    checkout,
    getLogs,
} from "../services/api";

// ── Online payment methods that require a reference number ─────
const ONLINE_METHODS = ["GCash", "Maya", "MariBank"];

// ── Receipt shown right after checkout ────────────────────────
function ReceiptModal({ receipt, onClose }) {
    if (!receipt) return null;

    const today = new Date().toLocaleString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    return (
        <>
            <div className="stock-modal-overlay" onClick={onClose} />
            <div className="receipt-box" onClick={e => e.stopPropagation()}>
                <h3>Payment Receipt</h3>
                <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                    {today}
                </p>

                <h4>Items Purchased</h4>
                {receipt.items.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", margin: "6px 0", fontSize: 13 }}>
                        <span>{item.product} × {item.quantity}</span>
                        <span>₱{parseFloat(item.subtotal).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                ))}

                <div style={{ borderTop: "1px dashed #000", margin: "14px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                    <span>TOTAL</span>
                    <span>₱{parseFloat(receipt.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                </div>

                <h4 style={{ marginTop: 16 }}>Payment Details</h4>
                <p>Method: {receipt.payment}</p>
                <p>Amount Paid: ₱{parseFloat(receipt.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                <p>Change: ₱{parseFloat(receipt.change).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                {/* Always show reference — cash has auto-generated CP-, online has OP- */}
                <p>Reference #: {receipt.refnum}</p>

                <div style={{ borderTop: "2px dashed #000", margin: "16px 0" }} />
                <button className="logout-btn" style={{ width: "100%", marginTop: 16 }} onClick={onClose}>
                    Close
                </button>
            </div>
        </>
    );
}

// ── Receipt from logs table ────────────────────────────────────
function LogReceiptModal({ log, onClose }) {
    if (!log) return null;
    return (
        <>
            <div className="stock-modal-overlay" onClick={onClose} />
            <div className="receipt-box" onClick={e => e.stopPropagation()}>
                <h3>Payment Receipt</h3>
                <h4>Transaction #{log.log_id}</h4>
                <p style={{ fontSize: 13, marginBottom: 8 }}>{log.timestamp}</p>

                <h4>Products</h4>
                <p style={{ fontSize: 13, lineHeight: 1.8 }}>{log.product_name}</p>

                <div style={{ borderTop: "1px dashed #000", margin: "14px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                    <span>TOTAL</span>
                    <span>₱{parseFloat(log.subtotal).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                </div>

                <h4 style={{ marginTop: 16 }}>Payment Details</h4>
                <p>Method: {log.payment_method}</p>
                <p>Amount Paid: ₱{parseFloat(log.amount_paid).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                <p>Change: ₱{parseFloat(log.change_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                <p>Reference #: {log.reference_number || "—"}</p>

                <div style={{ borderTop: "2px dashed #000", margin: "16px 0" }} />
                <button className="logout-btn" style={{ width: "100%", marginTop: 16 }} onClick={onClose}>
                    Close
                </button>
            </div>
        </>
    );
}

export default function Transactions() {
    const [data, setData]         = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart]         = useState([]);
    const [logs, setLogs]         = useState([]);

    const [receipt, setReceipt]               = useState(null);
    const [receiptOpen, setReceiptOpen]       = useState(false);
    const [logReceipt, setLogReceipt]         = useState(null);
    const [logReceiptOpen, setLogReceiptOpen] = useState(false);

    const role   = localStorage.getItem("role");
    const userID = localStorage.getItem("user_id");
    const [profileOpen, setProfileOpen] = useState(false);

    const [form, setForm]       = useState({ product: "", quantity: "" });
    const [payment, setPayment] = useState({ paymethod: "", amount: "", refnum: "" });

    const isOnline = ONLINE_METHODS.includes(payment.paymethod);

    const fetchAll = () => {
        getDashboard(userID).then(res => setData(res.data));
        getProducts().then(res => setProducts(res.data));
        getCart().then(res => setCart(res.data));
        getLogs().then(res => setLogs(res.data));
    };

    useEffect(() => { fetchAll(); }, []);

    if (!data) return null;

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
    });

    // ── Add to cart ───────────────────────────────────────────
    const handleAdd = (e) => {
        e.preventDefault();
        addToCart(form).then(res => {
            if (res.data.error) { alert(res.data.error); return; }
            setCart(res.data);
            setForm({ product: "", quantity: "" });
        });
    };

    // ── Remove from cart ──────────────────────────────────────
    const handleDelete = (index) => {
        deleteCartItem(index).then(res => setCart(res.data));
    };

    // ── Checkout ──────────────────────────────────────────────
    // For online: prefix user-typed ref with "OP-"
    // For cash:   send empty refnum — backend generates "CP-<id>"
    const handleCheckout = (e) => {
        e.preventDefault();

        // Validate online reference input
        if (isOnline && !payment.refnum.trim()) {
            alert("Please enter a reference number for online payment.");
            return;
        }

        const payload = {
            paymethod: payment.paymethod,
            amount:    payment.amount,
            // Online: prefix with OP-, Cash: send null so backend auto-generates
            refnum: isOnline ? `OP-${payment.refnum.trim()}` : null,
        };

        checkout(payload).then(res => {
            if (res.data.error) {
                alert(res.data.error);
            } else {
                setReceipt({
                    items:   res.data.items,
                    total:   res.data.total,
                    payment: res.data.payment,
                    amount:  res.data.amount,
                    change:  res.data.change,
                    refnum:  res.data.refnum, // already formatted from backend
                });
                setReceiptOpen(true);
                setCart([]);
                setPayment({ paymethod: "", amount: "", refnum: "" });
                getLogs().then(r => setLogs(r.data));
            }
        });
    };

    // When payment method changes, clear the refnum input
    const handleMethodChange = (e) => {
        setPayment({ ...payment, paymethod: e.target.value, refnum: "" });
    };

    const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

    return (
        <div>
            <Sidebar today={today} />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />

            {receiptOpen && (
                <ReceiptModal receipt={receipt} onClose={() => { setReceiptOpen(false); setReceipt(null); }} />
            )}
            {logReceiptOpen && (
                <LogReceiptModal log={logReceipt} onClose={() => { setLogReceiptOpen(false); setLogReceipt(null); }} />
            )}

            <div className="main">
                <section className="main-section">
                    <h1>Product Payments</h1>
                </section>

                {/* ── Cart Section ─────────────────────────── */}
                <div className="section-box cart-box role-box">
                    <h2>Cart Section</h2>
                    <form onSubmit={handleAdd}>
                        <div className="cart-row">
                            <div className="cart-group products">
                                <label>Products</label>
                                <select
                                    value={form.product}
                                    onChange={e => setForm({ ...form, product: e.target.value })}
                                >
                                    <option value="">--Select--</option>
                                    {products.map(p => (
                                        <option key={p.product_name}>{p.product_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="cart-group quantity">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    min={1}
                                    required
                                    value={form.quantity}
                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                />
                            </div>
                            <button type="submit">Add to Cart</button>
                        </div>
                    </form>
                </div>

                {/* ── Payment ──────────────────────────────── */}
                {cart.length > 0 && (
                    <div className="section-box payment-box role-box">
                        <h2>Payment</h2>
                        <h4>Total: ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</h4>

                        <form onSubmit={handleCheckout}>
                            <div className="payment-row">

                                {/* Payment Method */}
                                <div className="payment-group">
                                    <label>Payment Method</label>
                                    <select value={payment.paymethod} onChange={handleMethodChange}>
                                        <option value="">--Select--</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Maya">Maya</option>
                                        <option value="MariBank">MariBank</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>

                                {/* Amount */}
                                <div className="payment-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        min={0}
                                        required
                                        value={payment.amount}
                                        onChange={e => setPayment({ ...payment, amount: e.target.value })}
                                    />
                                </div>

                                {/* Reference — only shown for online payments */}
                                {isOnline && (
                                    <div className="payment-group">
                                        <label>
                                            Reference No.
                                        </label>
                                        <input
                                            type="text"
                                            value={payment.refnum}
                                            onChange={e => setPayment({ ...payment, refnum: e.target.value })}
                                        />
                                    </div>
                                )}

                                {/* Cash note */}
                                {payment.paymethod === "Cash" && (
                                    <div className="payment-group">
                                        <label>Reference No.</label>
                                        <input
                                            type="text"
                                            value="Auto-generated"
                                            disabled
                                            style={{ background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" }}
                                        />
                                    </div>
                                )}

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
                                    <td>₱{parseFloat(item.price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                    <td>₱{parseFloat(item.subtotal).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                    <td>
                                        <button onClick={() => handleDelete(index)}>X</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Logs (Manager only) ───────────────────── */}
                {role === "Manager" && (
                    <div className="section-box role-box">
                        <h2>Logs</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Receipt</th>
                                    <th>ID</th>
                                    <th>Products</th>
                                    <th>Total Qty</th>
                                    <th>Method</th>
                                    <th>Amount Paid</th>
                                    <th>Change</th>
                                    <th>Subtotal</th>
                                    <th>Reference</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.log_id}>
                                        <td>
                                            <button
                                                className="empDelButton"
                                                onClick={() => { setLogReceipt(l); setLogReceiptOpen(true); }}
                                            >
                                                Receipt
                                            </button>
                                        </td>
                                        <td>{l.log_id}</td>
                                        <td style={{ maxWidth: 200, fontSize: 12 }}>{l.product_name}</td>
                                        <td>{l.quantity}</td>
                                        <td>{l.payment_method}</td>
                                        <td>₱{parseFloat(l.amount_paid).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                        <td>₱{parseFloat(l.change_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                        <td>₱{parseFloat(l.subtotal).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                                        <td>{l.reference_number || "—"}</td>
                                        <td>{l.timestamp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}