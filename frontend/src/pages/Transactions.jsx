import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import ReceiptBox from "../components/ReceiptBox";
import {
    getDashboard,
    getProducts,
    getCart,
    addToCart,
    deleteCartItem,
    checkout,
    getLogs,
    getServices,
    doneService
} from "../services/api";

export default function Transactions() {
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [logs, setLogs] = useState([]);
    const [services, setServices] = useState([]);

    const [receiptOpen, setReceiptOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState({});

    const role = localStorage.getItem("role");

    const [profileOpen, setProfileOpen] = useState(false);

    const [form, setForm] = useState({ product: "", quantity: "" });
    const [payment, setPayment] = useState({ paymethod: "", amount: "", refnum: "" });

    const doneBtn = document.getElementById('ServiceDoneButton');

    const userID = localStorage.getItem("user_id");

    useEffect(() => {
        getDashboard(userID).then(res => setData(res.data));
        getProducts().then(res => setProducts(res.data));
        getCart().then(res => setCart(res.data));
        getLogs().then(res => setLogs(res.data));
        getServices().then(res => setServices(res.data));
    }, []);

    if (!data) return null;

    const handleAdd = (e) => {
        e.preventDefault();

        addToCart(form).then(res => {
            setCart(res.data);

            setForm({
                product: "",
                quantity: ""
            });
        });
    };


    const handleDelete = (index) => {
        deleteCartItem(index).then(res => setCart(res.data));
    };

    const handleCheckout = (e) => {
        e.preventDefault();

        checkout(payment).then(res => {
            if (res.data.error) {
                alert(res.data.error);
            } else {
                alert("Success Change: ₱" + res.data.change);

                setCart([]);

                setPayment({
                    paymethod: "",
                    amount: "",
                    refnum: ""
                });

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
    };

    const handleReceipt = (log) => {
        setSelectedReceipt(log);
        setReceiptOpen(true);
    };

    const total = cart.reduce((sum, i) => sum + i.subtotal, 0);

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const refreshPage = () => {
        window.location.reload();
    };

    return (
        <div>
            <Sidebar today={today} />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />
            <ReceiptBox
                user={selectedReceipt}
                visible={receiptOpen}
                onClose={() => setReceiptOpen(false)}
            />

            <div className="main">

                <div className="section-box cart-box">
                    <h3>Cart Section</h3>

                    <form onSubmit={handleAdd}>
                        <div className="cart-row">
                            <div className="cart-group products">
                                <label>Products</label>
                                <select onChange={e => setForm({ ...form, product: e.target.value })}>
                                    <option value="">--Select--</option>
                                    {products.map(p => (
                                        <option key={p.product_name}>{p.product_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="cart-group quantity">
                                <label>Quantity</label>
                                <input type="number" required onChange={e => setForm({ ...form, quantity: e.target.value })} />
                            </div>

                            <button type="submit" onClick={refreshPage}>Add to Cart</button>
                        </div>
                    </form>
                </div>

                {cart.length > 0 && (
                    <div className="section-box payment-box">
                        <h3>Payment</h3>
                        <h4>Total: ₱{total}</h4>

                        <form onSubmit={handleCheckout}>
                            <div className="payment-row">

                                <div className="payment-group">
                                    <label>Payment Method</label>
                                    <select onChange={e => setPayment({ ...payment, paymethod: e.target.value })}>
                                        <option value="">--Select--</option>
                                        <option value="GCash">GCash</option>
                                        <option value="Maya">Maya</option>
                                        <option value="MariBank">MariBank</option>
                                        <option value="Cash">Cash</option>
                                    </select>
                                </div>

                                <div className="payment-group">
                                    <label>Amount</label>
                                    <input type="number" required onChange={e => setPayment({ ...payment, amount: e.target.value })} />
                                </div>

                                <div className="payment-group">
                                    <label>Reference</label>
                                    <input type="number" onChange={e => setPayment({ ...payment, refnum: e.target.value })} />
                                </div>

                                <button type="submit" onClick={refreshPage}>Checkout</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="section-box role-box">
                    <h3>Pending</h3>

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

                <div className="section-box role-box">
                    <h3>Services</h3>

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
                                        {s.status === "Pending" &&
                                            <button id="ServiceDoneButton" onClick={() => doneService(s.service_id).then(res => setCart(res.data))} onClick={refreshPage}>
                                                Done
                                            </button>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {role === "Manager" && (
                    <div className="section-box role-box">
                        <h3>Logs</h3>

                        <table>
                            <thead>
                                <tr>
                                    <th>Receipt</th>
                                    <th>ID</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Change</th>
                                    <th>Subtotal</th>
                                    <th>Ref</th>
                                    <th>Time</th>
                                </tr>
                            </thead>

                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.log_id}>
                                        <td>
                                            <button
                                                className="empDelButton"
                                                onClick={() => handleReceipt(l)}
                                            >
                                                Receipt
                                            </button>
                                        </td>
                                        <td>{l.log_id}</td>
                                        <td>{l.product_name}</td>
                                        <td>{l.quantity}</td>
                                        <td>{l.price}</td>
                                        <td>{l.payment_method}</td>
                                        <td>{l.amount_paid}</td>
                                        <td>{l.change_amount}</td>
                                        <td>{l.subtotal}</td>
                                        <td>{l.reference_number}</td>
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
