export default function ReceiptBox({ user, visible, onClose }) {
    if (!visible) return null;

    return (
        <div className="receipt-box">
            <button className="logout-btn" onClick={onClose}>
                Close
            </button>

            <h3>PAYMENT RECEIPT - {user.log_id}</h3>

            <h4>Product Information</h4>
            <p>Products: {user.product_name}</p>
            <p>Quantity: {user.quantity}</p>
            <p>Product Price: ₱{user.price}</p>
            <p>Subtotal: ₱{user.subtotal}</p>

            <h4>Payment</h4>
            <p>Payment Method: {user.payment_method}</p>
            <p>Amount Paid: ₱{user.amount_paid}</p>
            <p>Change Amount: ₱{user.change_amount}</p>
            <p>Reference Number: {user.reference_number || "N/A"}</p>

            <h4>Timestamp</h4>
            <p>{user.timestamp}</p>
        </div>
    );
}