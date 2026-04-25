import { useState } from "react";
import axios from "axios";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });

    const handleLogin = (e) => {
        e.preventDefault();

        axios.post("http://localhost:5000/api/auth/login", form)
            .then(res => {
                if (res.data.error) {
                    alert("Invalid login");
                } else {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("user_id", res.data.user.accID);
                    window.location.href = "/dashboard";
                }
            });
    };

    return (
        <div className="login-container">
            <form className="login-box" onSubmit={handleLogin}>

                <div className="login-title">WONDER WATER MANAGEMENT</div>
                <h2>Login</h2>

                <input
                    type="text"
                    placeholder="Username"
                    onChange={e => setForm({ ...form, username: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={e => setForm({ ...form, password: e.target.value })}
                />

                <button type="submit">Login</button>

            </form>
        </div>
    );
}
