import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const login = (data) => API.post("/auth/login", data);
export const createUser = (data) => API.post("/auth/register", data); // ← new

export const getDashboard = (id) => API.get(`/dashboard/${id}`);

export const deleteUser = (id) => {
    const role = localStorage.getItem("role");
    return API.delete(`/dashboard/${id}`, { data: { role } });
};

export const getInventory = () => API.get("/inventory");
export const createProduct = (data) => API.post("/inventory/create", data);
export const updateProduct = (id, data) => API.put(`/inventory/${id}`, data);
export const deleteProduct = (id) => API.delete(`/inventory/${id}`, {
    headers: { role: localStorage.getItem("role") }
});

export const getProducts = () => API.get("/transactions/products");

export const getCart = () => API.get("/transactions/cart");
export const addToCart = (data) => API.post("/transactions/cart", data);
export const deleteCartItem = (id) => API.delete(`/transactions/cart/${id}`);

export const checkout = (data) => API.post("/transactions/checkout", data);

export const getLogs = (id) => API.get("/transactions/logs");

export const getServices = () => API.get("/transactions/services");
export const doneService = (id) => API.post("/transactions/service-done", { service_id: id });

export const getDailySales = () => API.get("/sales/daily");
export const getWeeklySales = () => API.get("/sales/weekly");
export const getMonthlySales = () => API.get("/sales/monthly");

export default API;