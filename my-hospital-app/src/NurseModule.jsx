import { useState, useEffect } from "react";

const API_BASE = "https://hospital-management-system-67as.onrender.com";
const TODAY = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const C = {
  blue:        "#185FA5",
  blueDark:    "#0C447C",
  blueBg:      "#dbeafe",
  blueLight:   "#e8f1fb",
  pageBg:      "#f0f4f8",
  sidebarBg:   "#1a6bbf",
  white:       "#ffffff",
  border:      "#c5d5e8",
  borderLt:    "#dce8f5",
  textDark:    "#0d2d4e",
  textMid:     "#5a80a0",
  green:       "#27500A",
  greenBg:     "#DCFCE7",
  greenDark:   "#166534",
};

const inputS = { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.textDark, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
const labelS = { fontSize: 12, fontWeight: 500, color: C.textMid, display: "block", marginBottom: 6 };
const card = { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 16 };

export default function NurseModule() {
  const [form, setForm] = useState({ name: "", age: "", gender: "Male", phone: "", reason: "General OPD", bp: "", temp: "", weight: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    fetchRecentQueue();
  }, []);

  async function fetchRecentQueue() {
    const token = localStorage.getItem("hms_token");
    if(!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/queue/today`, { headers: { Authorization: `Bearer ${token}` }});
      const json = await res.json();
      if(json.success && json.data) {
        setRecentPatients(json.data.slice(0, 8));
      }
    } catch(e) {}
  }

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleRegister() {
    if (!form.name || !form.phone || !form.age) {
      alert("Name, Age, and Phone are strongly required constraints.");
      return;
    }
    
    setLoading(true);
    setSuccess(null);
    const token = localStorage.getItem("hms_token");
    
    try {
      // 1. Create Patient
      const patRes = await fetch(`${API_BASE}/api/patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, age: Number(form.age), gender: form.gender, phone: form.phone })
      });
      const patJson = await patRes.json();
      
      if(patJson.success || patJson.data) {
         const patientId = patJson.data?._id || patJson.patient?._id || patJson._id;
         
         // 2. Add to Queue & Triage
         const qRes = await fetch(`${API_BASE}/api/queue/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ 
                patient_id: patientId, 
                reason: form.reason + (form.temp ? ` | Temp: ${form.temp}F` : '') + (form.bp ? ` | BP: ${form.bp}` : '')
            })
         });
         const qJson = await qRes.json();
         
         setSuccess({ token: `TKN-${patientId.substring(patientId.length - 4).toUpperCase()}`, name: form.name });
         setForm({ name: "", age: "", gender: "Male", phone: "", reason: "General OPD", bp: "", temp: "", weight: "" });
         fetchRecentQueue();
      } else {
         alert("Failed to register patient: " + JSON.stringify(patJson));
      }
    } catch(error) {
      console.error(error);
      alert("Registration endpoint disconnected or failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 13, color: C.textDark, background: C.pageBg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: C.blue, padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18 }}>🩺</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#fff" }}>Nurse / Reception</p>
            <p style={{ margin: 0, fontSize: 11, color: "#b8d4f0" }}>Triage & Registration &nbsp;·&nbsp; {TODAY}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        
        {/* Left: Registration Form */}
        <div>
           <div style={card}>
             <h2 style={{ margin: "0 0 20px", fontSize: 18, color: C.blueDark }}>New Patient Registration</h2>
             
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
               <div>
                 <label style={labelS}>Full Name*</label>
                 <input style={inputS} placeholder="E.g. Jane Doe" value={form.name} onChange={e => set("name", e.target.value)} />
               </div>
               <div>
                 <label style={labelS}>Mobile Number*</label>
                 <input style={inputS} placeholder="10-digit number" value={form.phone} onChange={e => set("phone", e.target.value)} />
               </div>
             </div>

             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
               <div>
                 <label style={labelS}>Age*</label>
                 <input type="number" style={inputS} placeholder="Years" value={form.age} onChange={e => set("age", e.target.value)} />
               </div>
               <div>
                 <label style={labelS}>Gender*</label>
                 <select style={inputS} value={form.gender} onChange={e => set("gender", e.target.value)}>
                   <option>Male</option><option>Female</option><option>Other</option>
                 </select>
               </div>
               <div>
                 <label style={labelS}>Reason for Visit</label>
                 <select style={inputS} value={form.reason} onChange={e => set("reason", e.target.value)}>
                   <option>General OPD</option>
                   <option>Fever / Cold</option>
                   <option>Pediatric</option>
                   <option>Follow-up</option>
                   <option>Accident / ER</option>
                 </select>
               </div>
             </div>

             <h3 style={{ margin: "0 0 16px", fontSize: 14, color: C.textMid, borderBottom: `1px solid ${C.borderLt}`, paddingBottom: 8 }}>Triage / Vitals (Optional)</h3>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
               <div>
                 <label style={labelS}>Blood Pressure</label>
                 <input style={inputS} placeholder="e.g. 120/80" value={form.bp} onChange={e => set("bp", e.target.value)} />
               </div>
               <div>
                 <label style={labelS}>Temperature (°F)</label>
                 <input style={inputS} placeholder="e.g. 98.6" value={form.temp} onChange={e => set("temp", e.target.value)} />
               </div>
               <div>
                 <label style={labelS}>Weight (kg)</label>
                 <input style={inputS} placeholder="e.g. 70" value={form.weight} onChange={e => set("weight", e.target.value)} />
               </div>
             </div>

             <button 
               onClick={handleRegister} 
               disabled={loading}
               style={{ 
                 width: "100%", padding: 12, background: loading ? C.textMid : C.blue, 
                 color: C.white, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer" 
               }}
             >
               {loading ? "Generating Safe Record..." : "Register Patient & Trigger Doctor Queue"}
             </button>

             {success && (
                <div style={{ marginTop: 20, background: C.greenBg, padding: 16, borderRadius: 8, textAlign: "center", border: `1px solid ${C.green}` }}>
                  <p style={{ margin: 0, fontSize: 13, color: C.greenDark }}>Patient <b>{success.name}</b> generated securely!</p>
                  <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 700, color: C.green }}>{success.token}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: C.greenDark }}>They have been pushed into the Doctor's Queue.</p>
                </div>
             )}
           </div>
        </div>

        {/* Right: Quick Queue View */}
        <div>
           <div style={{ ...card, padding: 16 }}>
             <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: C.blueDark, textTransform: "uppercase" }}>Queue Monitor</p>
             {recentPatients.length === 0 ? (
                <p style={{ fontSize: 12, color: C.textMid, textAlign: "center", fontStyle: "italic" }}>No active patients.</p>
             ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recentPatients.map(q => (
                    <div key={q._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.blueLight, borderRadius: 6 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.blueDark }}>{q.patient?.name || "Unknown"}</p>
                        <p style={{ margin: 0, fontSize: 11, color: C.textMid }}>{q.status}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.blue, background: C.white, padding: "2px 6px", borderRadius: 4 }}>
                        {new Date(q.createdAt).toLocaleTimeString([], {timeStyle: 'short'})}
                      </span>
                    </div>
                  ))}
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}
