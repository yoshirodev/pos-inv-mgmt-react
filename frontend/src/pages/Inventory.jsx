import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfileBox from "../components/ProfileBox";
import { getInventory, createProduct, updateProduct, deleteProduct } from "../services/api";

export default function Inventory() {
    const [products, setProducts] = useState([]);
    const [profileOpen, setProfileOpen] = useState(false);

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
        getInventory().then(res => setProducts(res.data));
    };

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
        });
    };

    const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    return (
        <div>
            <Sidebar today={today} />
            <Topbar toggleProfile={() => setProfileOpen(!profileOpen)} />
            <ProfileBox user={{}} visible={profileOpen} />

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

                        <button type="submit">Create</button>
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
                                <input type="text" onChange={e => setUpdateData({ ...updateData, product_name: e.target.value })} />
                            </div>

                            <div className="update-group type">
                                <label>Type</label>
                                <input type="text" onChange={e => setUpdateData({ ...updateData, type: e.target.value })} />
                            </div>

                            <div className="update-group cost">
                                <label>Cost</label>
                                <input type="text" onChange={e => setUpdateData({ ...updateData, cost: e.target.value })} />
                            </div>

                            <div className="update-group quantity">
                                <label>Quantity</label>
                                <input type="text" onChange={e => setUpdateData({ ...updateData, quantity: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit">Update</button>
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

                                <button className="delete-button-inv" id="delete-product" onClick={() => handleDelete(row.id)}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
