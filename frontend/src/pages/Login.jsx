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

                localStorage.setItem("role", res.data.user.accountType);

                window.location.href = "/dashboard";
            }
        });
    };

    return (
        <div className="login-container">

        {/* Left side banner */}
        <div className="login-hero">
            <div className="hero-overlay">

            {/* Company logo goes here */}
            <div className="hero-logo">
                <img src="../public/logo.png" alt="Wonder Water Logo" />
            </div>

            <div className="hero-company">Streamline POS</div>
            <div className="hero-tagline">
                Wonderwater Management
            </div>

            {/* Rotating information */}
            <div className="hero-slider">
                <div className="hero-slide">
                <h3>Who We Are</h3>
                <p>
                    A Water Equipment Supplier based in Naga City, Camarines Sur, Philippines. We are
                    dedicated to providing high-quality water equipment and supplies to meet the needs of Bicolanos.  
                </p>
                </div>

                <div className="hero-slide">
                <h3>What We Do</h3>
                <p>
                    We supply a wide range of water equipment and supplies, including water filtration systems,
                    water dispensers, and other related products.
                </p>
                </div>

                <div className="hero-slide">
                <h3>STREAMLINE: POS and Management System</h3>
                <p>
                    Track stock, automate receipts, monitor sales, and streamline daily
                    operations in one platform.
                </p>
                </div>
            </div>
            </div>
        </div>

        {/* Right side login form */}
        <div className="login-panel">
            <form className="login-box" onSubmit={handleLogin}>
            <div className="login-title">Welcome Back</div>
            <h2>Sign in to continue</h2>

            <input
                type="text"
                placeholder="Username"
                onChange={e =>
                setForm({ ...form, username: e.target.value })
                }
            />

            <input
                type="password"
                placeholder="Password"
                onChange={e =>
                setForm({ ...form, password: e.target.value })
                }
            />

            <button type="submit">Login</button>
            </form>
        </div>

        </div>
    );
}
