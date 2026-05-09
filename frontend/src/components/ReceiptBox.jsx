export default function ReceiptBox({ user, visible }) {
    return (
        <div id="receiptBox" className="receipt-box" style={{ display: visible ? "block" : "none" }}>
            <h3>PAYMENT RECEIPT - {user.log_id}</h3>
            <h4>Product Information</h4>
            <p>Products: {user.product_name}</p>
            <p>Quantity: {user.quantity}</p>
            <p>Product Price: {user.price}</p>
            <p>Subtotal: {user.subtotal}</p>

            <h4>Payment</h4>
            <p>Amount Paid: {user.amount_paid}</p>
            <p>Change Amount: {user.change_amount}</p>
            <p>Reference Number: {user.reference_number}</p>
        </div>
    );
}
