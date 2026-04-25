export default function Topbar({ toggleProfile }) {
    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="topbar">
            <div className="profile-btn" onClick={toggleProfile}>
                Profile
            </div>

            <button className="logout-btn" onClick={logout}>
                Logout
            </button>
        </div>
    );
}
