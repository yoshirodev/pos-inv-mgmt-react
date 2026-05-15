import { useEffect, useState, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import { getDashboard, getInventory, createProduct, updateProduct, deleteProduct, addStock } from "../services/api";

const EMPTY_CREATE = {
    product_name: "", type: "", category: "", brand: "",
    serial_number: "", cost: "", selling_price: "", quantity: "",
    length: "", width: "", height: "", image: null
};

const EMPTY_UPDATE = {
    productID: "", product_name: "", type: "", category: "", brand: "",
    serial_number: "", cost: "", selling_price: "", quantity: "",
    length: "", width: "", height: ""
};

//  Sort options 
const SORT_OPTIONS = [
    { label: "ID",value: "id",type: "number" },
    { label: "Name (A → Z)",       value: "product_name",  type: "string" },
    { label: "Category (A → Z)",   value: "category",      type: "string" },
    { label: "Type (A → Z)",       value: "type",          type: "string" },
    { label: "Brand (A → Z)",      value: "brand",         type: "string" },
    { label: "Cost (Low → High)",  value: "cost",          type: "number" },
    { label: "Cost (High → Low)",  value: "cost_desc",     type: "number", desc: true },
    { label: "Price (Low → High)", value: "selling_price", type: "number" },
    { label: "Price (High → Low)", value: "selling_price_desc", type: "number", desc: true },
    { label: "Stock (Low → High)", value: "quantity",      type: "number" },
    { label: "Stock (High → Low)", value: "quantity_desc", type: "number", desc: true },
];

export default function Inventory() {
    const [data, setData]         = useState(null);
    const [products, setProducts] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);

    // Sort
    const [sortValue, setSortValue] = useState("id");

    // Modals
    const [stockModalOpen,   setStockModalOpen]   = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [createModalOpen,  setCreateModalOpen]  = useState(false);
    const [updateModalOpen,  setUpdateModalOpen]  = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockToAdd,      setStockToAdd]      = useState(1);

    const [createData, setCreateData] = useState(EMPTY_CREATE);
    const [updateData, setUpdateData] = useState(EMPTY_UPDATE);

    const role   = localStorage.getItem("role");
    const userID = localStorage.getItem("user_id");

    useEffect(() => { fetchData(); }, []);

    const fetchData = () => {
        getDashboard(userID).then(res => setData(res.data));
        getInventory().then(res => setProducts(res.data));
    };

    useEffect(() => { fetchData(); }, []);

    //  Move this ABOVE the early return 
    const sortedProducts = useMemo(() => {
        const option = SORT_OPTIONS.find(o => o.value === sortValue);
        if (!option) return products;

        const field = option.value.replace("_desc", "");
        const desc  = !!option.desc;

        return [...products].sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (option.type === "number") {
                const diff = (Number(aVal) || 0) - (Number(bVal) || 0);
                return desc ? -diff : diff;
            } else {
                const diff = String(aVal || "").localeCompare(String(bVal || ""));
                return desc ? -diff : diff;
            }
        });
    }, [products, sortValue]);

    if (!data) return null;

    //  Create 
    const handleCreate = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(createData).forEach(([key, val]) => {
            if (val !== null && val !== "") formData.append(key, val);
        });
        createProduct(formData).then(() => {
            fetchData();
            setCreateData(EMPTY_CREATE);
            setCreateModalOpen(false);
        }).catch(() => alert("Failed to create product."));
    };

    //  Update 
    const handleUpdate = (e) => {
        e.preventDefault();
        updateProduct(updateData.productID, updateData).then(() => {
            fetchData();
            setUpdateData(EMPTY_UPDATE);
            setUpdateModalOpen(false);
        }).catch(() => alert("Failed to update product."));
    };

    //  Delete 
    const handleDelete = (id) => {
        if (!window.confirm("Are you sure to delete this item?")) return;
        deleteProduct(id).then(() => setProducts(products.filter(p => p.id !== id)));
    };

    //  Add Stock 
    const handleAddStock = () => {
        if (!selectedProduct || stockToAdd <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }
        addStock(selectedProduct.id, stockToAdd).then(() => {
            fetchData();
            setStockModalOpen(false);
            setSelectedProduct(null);
            setStockToAdd(1);
        }).catch(() => alert("Failed to add stock."));
    };

    //  update modal pre-filled 
    const openUpdateModal = (product) => {
        setUpdateData({
            productID:     product.id,
            product_name:  product.product_name  || "",
            type:          product.type          || "",
            category:      product.category      || "",
            brand:         product.brand         || "",
            serial_number: product.serial_number || "",
            cost:          product.cost          || "",
            selling_price: product.selling_price || "",
            quantity:      product.quantity      || "",
            length:        product.length        || "",
            width:         product.width         || "",
            height:        product.height        || "",
        });
        setUpdateModalOpen(true);
    };

    const FORM_FIELDS = [
        ["Product Name", "product_name"],
        ["Type",         "type"],
        ["Category",     "category"],
        ["Brand",        "brand"],
        ["Serial No.",   "serial_number"],
        ["Cost",         "cost"],
        ["Selling Price","selling_price"],
        ["Quantity",     "quantity"],
        ["Length",       "length"],
        ["Width",        "width"],
        ["Height",       "height"],
    ];

    return (
        <div>
            <Sidebar />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={data.user} visible={profileOpen} />

            <div className="main">
                <h1>Manager Controls <i className="fa-solid fa-sliders"></i></h1>

                {/* ── Action bar: Create button + Sort dropdown ─ */}
                <div className="inventory-actions">
                    <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
                        <i className="fa-solid fa-plus"></i> Create Product
                    </button>

                    {/* Sort dropdown */}
                    <div className="sort-group">
                        <label className="sort-label">
                            <i className="fa-solid fa-arrow-up-wide-short"></i> Sort by
                        </label>
                        <select
                            className="sort-select"
                            value={sortValue}
                            onChange={e => setSortValue(e.target.value)}
                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* ── Inventory Grid ─────────────────────────── */}
                <section className="main-section">
                    <h1>
                        Inventory <i className="fa-solid fa-boxes-stacked"></i>
                        <span style={{ fontSize: 14, fontWeight: 400, color: "#64748b", marginLeft: 10 }}>
                            {sortedProducts.length} items
                        </span>
                    </h1>

                    <div className="inventory-cards">
                        {sortedProducts.map(row => (
                            <div className="inv-card" key={row.id}>
                                <div className="product-image">
                                    <img
                                        src={`http://localhost:5000/uploads/${row.image_path}`}
                                        className="square-img"
                                        alt={row.product_name}
                                    />
                                </div>

                                <h3>ID: {row.id}</h3>
                                <h3>{row.product_name}</h3>
                                <p>Stock: {row.quantity}</p>
                                <p>Selling Price: ₱{row.selling_price}</p>
                                <p>Type: {row.type}</p>
                                <p>Category: {row.category}</p>

                                <button className="view-details-btn" onClick={() => { setSelectedProduct(row); setDetailsModalOpen(true); }}>
                                    View Details
                                </button>

                                <button className="add-stock-btn" onClick={() => { setSelectedProduct(row); setStockToAdd(1); setStockModalOpen(true); }}>
                                    Add Stock
                                </button>

                                <button className="add-stock-btn" style={{ width: "100%", marginBottom: 8 }} onClick={() => openUpdateModal(row)}>
                                    Update
                                </button>

                                {role === "Manager" && (
                                    <button className="delete-button-inv" onClick={() => handleDelete(row.id)}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ══ CREATE MODAL ══════════════════════════════════ */}
            {createModalOpen && (
                <div className="stock-modal-overlay">
                    <div className="stock-modal large-modal" onClick={e => e.stopPropagation()}>
                        <div className="stock-modal-header">
                            <h3>Create Product</h3>
                            <button className="stock-modal-close" onClick={() => setCreateModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="stock-modal-body">
                            <form onSubmit={handleCreate} className="modal-form-grid">
                                {FORM_FIELDS.map(([label, field]) => (
                                    <div className="form-group" key={field}>
                                        <label>{label}</label>
                                        <input
                                            type="text"
                                            value={createData[field]}
                                            onChange={e => setCreateData({ ...createData, [field]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div className="form-group full-width">
                                    <label>Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={e => setCreateData({ ...createData, image: e.target.files[0] })}
                                    />
                                </div>
                                <div className="stock-modal-footer full-width">
                                    <button type="button" className="btn-secondary" onClick={() => setCreateModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Create Product</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ UPDATE MODAL ══════════════════════════════════ */}
            {updateModalOpen && (
                <div className="stock-modal-overlay">
                    <div className="stock-modal large-modal" onClick={e => e.stopPropagation()}>
                        <div className="stock-modal-header">
                            <h3>Update — {updateData.product_name}</h3>
                            <button className="stock-modal-close" onClick={() => setUpdateModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="stock-modal-body">
                            <form onSubmit={handleUpdate} className="modal-form-grid">
                                {FORM_FIELDS.map(([label, field]) => (
                                    <div className="form-group" key={field}>
                                        <label>{label}</label>
                                        <input
                                            type="text"
                                            value={updateData[field]}
                                            onChange={e => setUpdateData({ ...updateData, [field]: e.target.value })}
                                        />
                                    </div>
                                ))}
                                <div className="stock-modal-footer full-width">
                                    <button type="button" className="btn-secondary" onClick={() => setUpdateModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ DETAILS MODAL ════════════════════════════════ */}
            {detailsModalOpen && selectedProduct && (
                <div className="stock-modal-overlay" onClick={() => setDetailsModalOpen(false)}>
                    <div className="stock-modal" onClick={e => e.stopPropagation()}>
                        <div className="stock-modal-header">
                            <h3>Product Details</h3>
                            <button className="stock-modal-close" onClick={() => setDetailsModalOpen(false)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="stock-modal-body details-grid">
                            <p><strong>Name:</strong> {selectedProduct.product_name}</p>
                            <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                            <p><strong>Serial No.:</strong> {selectedProduct.serial_number}</p>
                            <p><strong>Cost:</strong> ₱{selectedProduct.cost}</p>
                            <p><strong>Category:</strong> {selectedProduct.category}</p>
                            <p><strong>Type:</strong> {selectedProduct.type}</p>
                            <p><strong>Length:</strong> {selectedProduct.length}</p>
                            <p><strong>Width:</strong> {selectedProduct.width}</p>
                            <p><strong>Height:</strong> {selectedProduct.height}</p>
                            <p><strong>Created At:</strong> {selectedProduct.created_at}</p>
                            <p><strong>Updated At:</strong> {selectedProduct.updated_at}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ ADD STOCK MODAL ══════════════════════════════ */}
            {stockModalOpen && selectedProduct && (
                <div className="stock-modal-overlay" onClick={() => { setStockModalOpen(false); setSelectedProduct(null); }}>
                    <div className="stock-modal" onClick={e => e.stopPropagation()}>
                        <div className="stock-modal-header">
                            <h3>Add Stock</h3>
                            <button className="stock-modal-close" onClick={() => { setStockModalOpen(false); setSelectedProduct(null); }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="stock-modal-body">
                            <div className="stock-modal-product">
                                <strong>{selectedProduct.product_name}</strong>
                                <span>Current Stock: {selectedProduct.quantity}</span>
                            </div>
                            <div className="stock-input-group">
                                <label>Quantity to Add</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={stockToAdd}
                                    onChange={e => setStockToAdd(Number(e.target.value))}
                                />
                            </div>
                            <div className="stock-quick-actions">
                                <button type="button" onClick={() => setStockToAdd(prev => prev + 1)}>+1</button>
                                <button type="button" onClick={() => setStockToAdd(prev => prev + 10)}>+10</button>
                            </div>
                            <div className="stock-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => { setStockModalOpen(false); setSelectedProduct(null); }}>Cancel</button>
                                <button type="button" className="btn-primary" onClick={handleAddStock}>Add Stock</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}