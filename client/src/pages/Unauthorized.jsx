import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Unauthorized.css";

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const goHome = () => {
    if (!user)                       return navigate("/login");
    if (user.role === "restaurant")  return navigate("/owner/dashboard");
    if (user.role === "courier")     return navigate("/delivery");
    return navigate("/");
  };

  return (
    <div className="unauth-page">
      <div className="unauth-card">
        <div className="unauth-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>
          This page is not available for your account type
          {user?.role ? ` (${user.role})` : ""}.
        </p>
        <button className="unauth-btn" onClick={goHome}>
          Go to My Home
        </button>
      </div>
    </div>
  );
}