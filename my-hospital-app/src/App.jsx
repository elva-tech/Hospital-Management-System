import { useState, useEffect } from "react";
import DoctorModule from "./DoctorModule";
import PharmacyModule from "./PharmacyModule";
import DiagnosticLab from "./DiagnosticLab";
import NurseModule from "./NurseModule";
import Login from "./Login";

export default function App() {
  const [view, setView] = useState("doctor");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('hms_token');
    const savedUser = localStorage.getItem('hms_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try { setUser(JSON.parse(savedUser)); } catch(e){}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <Login setToken={setToken} setUser={setUser} />;
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Universal Top Header */}
      <header style={{
        background: "#185FA5",
        padding: "0 20px",
        height: "50px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        zIndex: 1000
      }}>
        <div style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>
          Clinic HMS - {user?.role} Portal
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
            Welcome, {user?.name}
          </span>
          <button 
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "none",
              padding: "6px 14px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {user?.role === 'Doctor' && <DoctorModule />}
        {user?.role === 'Pharmacist' && <PharmacyModule />}
        {user?.role === 'LabTech' && <DiagnosticLab />}
        {(user?.role === 'Receptionist' || user?.role === 'Nurse') && <NurseModule />}
        {user?.role === 'Admin' && <DoctorModule />}
      </div>
    </div>
  );
}