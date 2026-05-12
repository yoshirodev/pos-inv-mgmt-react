import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import { getDashboard, getInventory, createProduct, updateProduct, deleteProduct, addStock } from "../services/api";

export default function Inventory() {
    const [data, setData] = useState(null);
    const [products, setProducts] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);

    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockToAdd, setStockToAdd] = useState(1);

    const role = localStorage.getItem("role");

    const userID = localStorage.getItem("user_id");

    const [createData, setCreateData] = useState({
        product_name: "",
        type: "",
        cost: "",
        quantity: ""
    });

    const [updateData, setUpdateData] = useState({
        productID: "",
        product_name: "",
        type: "",
        cost: "",
        quantity: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        getDashboard(userID).then(res => setData(res.data));
        getInventory().then(res => setProducts(res.data));
    };

    if (!data) return null;

    const handleCreate = (e) => {
        e.preventDefault();

        createProduct(createData).then(() => {
            fetchData();

            setCreateData({
                product_name: "",
                type: "",
                cost: "",
                quantity: ""
            });
        });
    };


    const handleUpdate = (e) => {
        e.preventDefault();

        updateProduct(updateData.productID, updateData).then(() => {
            fetchData();

            setUpdateData({
                productID: "",
                product_name: "",
                type: "",
                cost: "",
                quantity: ""
            });
        });
    };



    const handleDelete = (id) => {
        const confirm = window.confirm ("Are you sure to delete this item in your inventory?");

        if (!confirm) return;
        deleteProduct(id).then(() => {
            setProducts(products.filter(p => p.id !== id));
            window.location.reload();
        });
    };

    const openStockModal = (product) => {
        setSelectedProduct(product);
        setStockToAdd(1);
        setStockModalOpen(true);
    };

    const closeStockModal = () => {
        setStockModalOpen(false);
        setSelectedProduct(null);
        setStockToAdd(1);
    };

    const handleAddStock = () => {
        if (!selectedProduct) return;

        if (stockToAdd <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }

        addStock(selectedProduct.id, stockToAdd)
            .then(() => {
                fetchData();
                closeStockModal();
            })
            .catch(() => {
                alert('Failed to add stock.');
            });
    };

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

            <div className="main">
                <h1>Manager Controls <i className="fa-solid fa-sliders"></i></h1>

                <div className="section-box inv-role-box">
                    <form onSubmit={handleCreate}>
                        <h3>Create</h3>

                        <div className="form-row">
                            <div className="form-group product">
                                <label>Product Name</label>
                                <input type="text" required onChange={e => setCreateData({ ...createData, product_name: e.target.value })} />
                            </div>

                            <div className="form-group type">
                                <label>Type</label>
                                <input type="text" required onChange={e => setCreateData({ ...createData, type: e.target.value })} />
                            </div>

                            <div className="form-group cost">
                                <label>Cost</label>
                                <input type="text" required onChange={e => setCreateData({ ...createData, cost: e.target.value })} />
                            </div>

                            <div className="form-group quantity">
                                <label>Quantity</label>
                                <input type="text" required onChange={e => setCreateData({ ...createData, quantity: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit" onClick={refreshPage}>Create</button>
                    </form>
                </div>

                <div className="section-box inv-control-box">
                    <form onSubmit={handleUpdate}>
                        <h3>Update Product Information</h3>

                        <div className="update-row">
                            <div className="update-group pid">
                                <label>Product ID</label>
                                <input type="text" required onChange={e => setUpdateData({ ...updateData, productID: e.target.value })} />
                            </div>

                            <div className="update-group product">
                                <label>Product Name</label>
                                <input type="text" value={updateData.product_name} onChange={e => setUpdateData({ ...updateData, product_name: e.target.value })} />
                            </div>

                            <div className="update-group type">
                                <label>Type</label>
                                <input type="text" value={updateData.type} onChange={e => setUpdateData({ ...updateData, type: e.target.value })} />
                            </div>

                            <div className="update-group cost">
                                <label>Cost</label>
                                <input type="text" value={updateData.cost}  onChange={e => setUpdateData({ ...updateData, cost: e.target.value })} />
                            </div>

                            <div className="update-group quantity">
                                <label>Quantity</label>
                                <input type="text" value={updateData.quantity} onChange={e => setUpdateData({ ...updateData, quantity: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit" onClick={refreshPage}>Update</button>
                    </form>
                </div>

                <section className="main-section">
                    <h1>Inventory <i className="fa-solid fa-boxes-stacked"></i></h1>

                    <div className="inventory-cards">
                        {products.map(row => (
                            <div className="inv-card" key={row.id}>
                                <div className="product-image">
                                    <img src={`/images/${row.image_path}`} className="square-img" />
                                </div>
                                <h3>ID: {row.id}</h3>
                                <h3>{row.product_name}</h3>
                                <p>Stock: {row.quantity}</p>
                                <p>Cost: {row.cost}</p>
                                <p>Type: {row.type}</p>

                                <button
                                    className="add-stock-btn"
                                    onClick={() => openStockModal(row)}
                                >
                                    Add Stock
                                </button>

                                {role === "Manager" && (
                                    <button
                                        id="delete-product"
                                        className="delete-button-inv"
                                        onClick={() => handleDelete(row.id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {stockModalOpen && selectedProduct && (
                <div
                    className="stock-modal-overlay"
                    onClick={closeStockModal}
                >
                    <div
                        className="stock-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="stock-modal-header">
                            <h3>Add Stock</h3>
                            <button
                                className="stock-modal-close"
                                onClick={closeStockModal}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="stock-modal-body">
                            <div className="stock-modal-product">
                                <strong>{selectedProduct.product_name}</strong>
                                <span>
                                    Current Stock: {selectedProduct.quantity}
                                </span>
                            </div>

                            <div className="stock-input-group">
                                <label>Quantity to Add</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={stockToAdd}
                                    onChange={(e) =>
                                        setStockToAdd(Number(e.target.value))
                                    }
                                />
                            </div>

                            <div className="stock-quick-actions">
                                <button
                                    type="button"
                                    onClick={() => setStockToAdd(stockToAdd + 1)}
                                >
                                    +1
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStockToAdd(stockToAdd + 10)}
                                >
                                    +10
                                </button>
                            </div>

                            <div className="stock-modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeStockModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleAddStock}
                                >
                                    Add Stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
