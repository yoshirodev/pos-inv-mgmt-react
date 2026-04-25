export default function ProfileBox({ user, visible }) {
    return (
        <div id="profileBox" className="profile-box" style={{ display: visible ? "block" : "none" }}>
            <h3>Profile</h3>
            <p>{user.firstname} {user.lastname}</p>
            <p>{user.email}</p>
            <p>+63{user.phonenumber}</p>
            <p>{user.accountType}</p>
        </div>
    );
}
