import { useState } from "react";
import InventoryManagement from "./InventoryManagement";

// ─── Sample Data ───────────────────────────────────────────────────────────────

const INVENTORY = [
  { name: "Paracetamol 500mg",  cat: "Analgesic",     stock: 145, min: 20, rate: 2,  expiry: "Mar 2027" },
  { name: "Amoxicillin 500mg",  cat: "Antibiotic",    stock: 8,   min: 15, rate: 12, expiry: "Nov 2026" },
  { name: "Iron + Folic acid",  cat: "Supplement",    stock: 60,  min: 10, rate: 4,  expiry: "Jun 2027" },
  { name: "Cetirizine 10mg",    cat: "Antihistamine", stock: 0,   min: 10, rate: 3,  expiry: "—"        },
  { name: "Metformin 500mg",    cat: "Antidiabetic",  stock: 4,   min: 20, rate: 5,  expiry: "Sep 2026" },
  { name: "Omeprazole 20mg",    cat: "Antacid",       stock: 80,  min: 15, rate: 6,  expiry: "Jan 2027" },
  { name: "Azithromycin 500mg", cat: "Antibiotic",    stock: 12,  min: 10, rate: 18, expiry: "Aug 2026" },
  { name: "ORS Sachet",         cat: "Hydration",     stock: 200, min: 30, rate: 5,  expiry: "Dec 2027" },
  { name: "Pantoprazole 40mg",  cat: "Antacid",       stock: 3,   min: 10, rate: 8,  expiry: "Oct 2026" },
  { name: "Dolo 650mg",         cat: "Analgesic",     stock: 55,  min: 20, rate: 3,  expiry: "May 2027" },
];

const INIT_PATIENTS = {
  "T-006": {
    name: "Anita Sharma", age: 38, gender: "F", village: "Rampur",
    reason: "General OPD", phone: "9876543210",
    doctor: "Dr. Ramesh Gupta", time: "10:48 AM",
    diag: "Viral fever, mild anaemia", advice: "Rest 2 days, drink ORS",
    status: "waiting",
    meds: [
      { name: "Paracetamol 500mg", dose: "1 tab", dur: "5 days",  timing: "Thrice daily" },
      { name: "Iron + Folic acid", dose: "1 tab", dur: "30 days", timing: "Night"        },
      { name: "Cetirizine 10mg",   dose: "1 tab", dur: "5 days",  timing: "Night"        },
    ],
    labs: ["CBC", "Malaria antigen"],
  },
  "T-007": {
    name: "Mohan Lal", age: 55, gender: "M", village: "Sitapur",
    reason: "Follow-up", phone: "9876543205",
    doctor: "Dr. Ramesh Gupta", time: "10:55 AM",
    diag: "Hypertension follow-up", advice: "Avoid salt, morning walk",
    status: "waiting",
    meds: [
      { name: "Amoxicillin 500mg", dose: "1 tab", dur: "7 days", timing: "Twice daily" },
      { name: "Omeprazole 20mg",   dose: "1 cap", dur: "7 days", timing: "Morning"     },
    ],
    labs: ["Blood sugar fasting"],
  },
  "T-008": {
    name: "Sunita Rawat", age: 34, gender: "F", village: "Bijnor",
    reason: "Fever / Cold", phone: "9876540034",
    doctor: "Dr. Ramesh Gupta", time: "11:10 AM",
    diag: "Acute pharyngitis", advice: "Warm fluids, rest",
    status: "waiting",
    meds: [
      { name: "Paracetamol 500mg", dose: "1 tab", dur: "3 days", timing: "Twice daily" },
      { name: "Dolo 650mg",        dose: "1 tab", dur: "3 days", timing: "Night"       },
    ],
    labs: [],
  },
  "T-003": {
    name: "Arjun Singh", age: 12, gender: "M", village: "Lalpur",
    reason: "General OPD", phone: "9876540003",
    doctor: "Dr. Ramesh Gupta", time: "09:38 AM",
    diag: "Acute tonsillitis", advice: "Gargle with warm salt water",
    status: "dispensed",
    meds: [
      { name: "Amoxicillin 500mg", dose: "0.5 tab", dur: "5 days", timing: "Thrice daily" },
      { name: "Paracetamol 500mg", dose: "0.5 tab", dur: "3 days", timing: "Twice daily"  },
    ],
    labs: [],
  },
  "T-004": {
    name: "Meena Kumari", age: 60, gender: "F", village: "Ramgarh",
    reason: "Follow-up", phone: "9876540060",
    doctor: "Dr. Ramesh Gupta", time: "09:55 AM",
    diag: "Diabetes management", advice: "Monitor sugar levels",
    status: "dispensed",
    meds: [{ name: "Metformin 500mg", dose: "1 tab", dur: "30 days", timing: "Twice daily" }],
    labs: ["HbA1c"],
  },
};

const QUEUE_ORDER = ["T-006", "T-007", "T-008", "T-003", "T-004"];
const TODAY = new Date().toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getStock(medName) {
  return INVENTORY.find((i) => i.name === medName) || null;
}

function stockStatus(inv) {
  if (!inv || inv.stock === 0)
    return { label: "Out of stock", bg: "#FCEBEB", color: "#791F1F" };
  if (inv.stock < inv.min)
    return { label: `Low: ${inv.stock}`, bg: "#FEF3C7", color: "#92400E" };
  return { label: `${inv.stock} left`, bg: "#DCFCE7", color: "#166534" };
}

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Color tokens ──────────────────────────────────────────────────────────────

const C = {
  blue:        "#185FA5",
  blueDark:    "#0C447C",
  blueBg:      "#dbeafe",
  blueLightBg: "#e8f1fb",
  pageBg:      "#f0f4f8",
  sidebarBg:   "#e4edf7",
  white:       "#ffffff",
  border:      "#c5d5e8",
  borderLight: "#dce8f5",
  textDark:    "#0d2d4e",
  textMid:     "#5a80a0",
  green:       "#27500A",
  greenBg:     "#DCFCE7",
  greenDark:   "#166534",
  red:         "#A32D2D",
  redBg:       "#FCEBEB",
  redDark:     "#791F1F",
  amber:       "#92400E",
  amberBg:     "#FEF3C7",
};

// ─── Reusable style fns ────────────────────────────────────────────────────────

const tdS = () => ({
  padding: "7px 8px",
  color: C.textDark,
  borderTop: `0.5px solid ${C.borderLight}`,
  fontSize: 12,
});

const sideTitle = () => ({
  fontSize: 11, fontWeight: 500, color: C.blue,
  textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px",
});

const cardStyle = () => ({
  background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 14,
});

const lbl = () => ({
  fontSize: 12, color: C.textMid, display: "block", marginBottom: 4,
});

const inputStyle = () => ({
  background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 6,
  padding: "6px 10px", color: C.textDark, fontSize: 13, width: "100%",
  outline: "none", marginBottom: 10, boxSizing: "border-box",
});

const secLabel = () => ({
  margin: "0 0 6px", fontSize: 12, fontWeight: 500, color: C.textMid,
  textTransform: "uppercase", letterSpacing: "0.04em",
});

const btnDefault = (extra = {}) => ({
  background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 6,
  padding: "6px 14px", color: C.blue, fontSize: 12, cursor: "pointer", ...extra,
});

// ─── Inventory Panel ───────────────────────────────────────────────────────────

function InventoryPanel({ onClose }) {
  const [q, setQ] = useState("");
  const filtered  = INVENTORY.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  const warnings  = INVENTORY.filter((i) => i.stock === 0 || i.stock < i.min);

  return (
    <div style={{ background: C.white, borderBottom: `0.5px solid ${C.border}`, padding: "14px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontWeight: 500, fontSize: 13, color: C.textDark }}>Medicine inventory</span>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicine..."
            style={{ border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 180, outline: "none" }}
          />
          <button onClick={onClose} style={btnDefault()}>Close</button>
        </div>
      </div>

      <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "26%" }} /><col style={{ width: "13%" }} />
            <col style={{ width: "12%" }} /><col style={{ width: "10%" }} />
            <col style={{ width: "11%" }} /><col style={{ width: "13%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: C.blueLightBg }}>
              {["Medicine","Category","In stock","Min","Rate (₹)","Expiry","Status"].map((h, i) => (
                <th key={h} style={{
                  padding: "7px 10px",
                  textAlign: i >= 2 && i <= 4 ? "right" : i === 6 ? "center" : "left",
                  color: C.blue, fontWeight: 500,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((it, idx) => {
              const st = stockStatus(it);
              const sc = it.stock === 0 ? C.red : it.stock < it.min ? C.amber : C.textDark;
              return (
                <tr key={idx}>
                  <td style={tdS()}>{it.name}</td>
                  <td style={tdS()}>{it.cat}</td>
                  <td style={{ ...tdS(), textAlign: "right", fontWeight: 500, color: sc }}>{it.stock}</td>
                  <td style={{ ...tdS(), textAlign: "right", color: C.textMid }}>{it.min}</td>
                  <td style={{ ...tdS(), textAlign: "right", color: C.textMid }}>₹{it.rate}</td>
                  <td style={{ ...tdS(), color: C.textMid }}>{it.expiry}</td>
                  <td style={{ ...tdS(), textAlign: "center" }}>
                    <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {warnings.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {warnings.map((w, i) => {
            const st = stockStatus(w);
            return (
              <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: st.bg, color: st.color }}>
                {w.stock === 0 ? "OUT: " : "LOW: "}{w.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Queue Card ────────────────────────────────────────────────────────────────

function QueueCard({ token, patient, active, onClick }) {
  const done = patient.status === "dispensed";
  const statusMap = {
    waiting:   { label: "Waiting",   bg: C.blueBg,  color: C.blueDark  },
    dispensed: { label: "Dispensed", bg: C.greenBg, color: C.greenDark },
    serving:   { label: "Serving",   bg: C.amberBg, color: C.amber     },
  };
  const st = statusMap[patient.status] || statusMap.waiting;

  return (
    <div
      onClick={onClick}
      style={{
        background: active ? C.blue : done ? "rgba(255,255,255,0.45)" : C.white,
        border: `0.5px solid ${active ? C.blue : C.border}`,
        borderRadius: 8, padding: 10, marginBottom: 8, cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#b8d4f0" : C.blue }}>{token}</span>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 4,
          background: active ? "rgba(255,255,255,0.2)" : st.bg,
          color: active ? C.white : st.color,
        }}>{st.label}</span>
      </div>
      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: active ? C.white : done ? C.textMid : C.textDark }}>
        {patient.name}
      </p>
      <p style={{ margin: "0 0 2px", fontSize: 11, color: active ? "rgba(255,255,255,0.75)" : C.textMid }}>
        {patient.age} {patient.gender} &nbsp;·&nbsp; {patient.village}
      </p>
      <p style={{ margin: 0, fontSize: 11, color: active ? "rgba(255,255,255,0.75)" : C.textMid }}>
        {patient.reason} &nbsp;·&nbsp; {patient.phone}
      </p>
      {patient.meds.length > 0 && (
        <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {patient.meds.map((m, i) => (
            <span key={i} style={{
              fontSize: 10, padding: "2px 6px", borderRadius: 4,
              background: active ? "rgba(255,255,255,0.18)" : C.blueLightBg,
              color: active ? C.white : C.blue,
            }}>{m.name.split(" ")[0]}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Prescription View ─────────────────────────────────────────────────────────

function PrescriptionView({ token, patient, onDispense }) {
  const [done, setDone] = useState(false);
  const hasWarn = patient.meds.some((m) => { const inv = getStock(m.name); return !inv || inv.stock === 0; });

  function handleDispense() { 
    setDone(true); 
    onDispense(token); 
  }

  return (
    <div style={cardStyle()}>
      {/* patient header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: `0.5px solid ${C.borderLight}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.blueBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 14, color: C.blueDark, flexShrink: 0 }}>
            {getInitials(patient.name)}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: C.textDark }}>{patient.name}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMid }}>
              Token: {token} &nbsp;·&nbsp; {patient.age} {patient.gender} &nbsp;·&nbsp; {patient.village} &nbsp;·&nbsp; {patient.phone}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 11, color: C.textMid }}>Prescribed by</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 500, color: C.textDark }}>{patient.doctor}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMid }}>{patient.time}</p>
        </div>
      </div>

      {/* diagnosis + advice */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[{ label: "Diagnosis", val: patient.diag }, { label: "Doctor's advice", val: patient.advice }].map(({ label, val }) => (
          <div key={label} style={{ background: "#f0f4f8", borderRadius: 6, padding: "8px 12px" }}>
            <p style={{ margin: 0, fontSize: 11, color: C.textMid }}>{label}</p>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.textDark }}>{val}</p>
          </div>
        ))}
      </div>

      {/* medicines */}
      <p style={secLabel()}>Prescribed medicines</p>
      {hasWarn && (
        <div style={{ background: C.redBg, color: C.redDark, padding: "8px 12px", borderRadius: 8, fontSize: 12, marginBottom: 8 }}>
          ⚠ One or more medicines are out of stock or low. Inform the patient and check for substitutes.
        </div>
      )}
      <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "30%" }} /><col style={{ width: "13%" }} />
            <col style={{ width: "14%" }} /><col style={{ width: "17%" }} />
            <col style={{ width: "14%" }} /><col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: C.blueLightBg }}>
              {["Medicine","Dosage","Duration","Timing","Stock","Dispense"].map((h) => (
                <th key={h} style={{ padding: "6px 8px", textAlign: h === "Stock" || h === "Dispense" ? "center" : "left", color: C.blue, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patient.meds.map((m, i) => {
              const inv = getStock(m.name);
              const st  = stockStatus(inv);
              const out = !inv || inv.stock === 0;
              return (
                <tr key={i}>
                  <td style={{ ...tdS(), color: out ? C.red : C.textDark }}>
                    {m.name}
                    {out && <span style={{ fontSize: 10, background: C.redBg, color: C.redDark, padding: "1px 5px", borderRadius: 4, marginLeft: 4 }}>OUT</span>}
                  </td>
                  <td style={{ ...tdS(), color: C.textMid }}>{m.dose}</td>
                  <td style={{ ...tdS(), color: C.textMid }}>{m.dur}</td>
                  <td style={{ ...tdS(), color: C.textMid }}>{m.timing}</td>
                  <td style={{ ...tdS(), textAlign: "center" }}>
                    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: st.bg, color: st.color }}>{st.label}</span>
                  </td>
                  <td style={{ ...tdS(), textAlign: "center" }}>
                    <input type="checkbox" defaultChecked={!out} disabled={out} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* lab tests */}
      <p style={secLabel()}>Lab tests ordered</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {patient.labs.length === 0
          ? <span style={{ fontSize: 12, color: C.textMid }}>No lab tests ordered</span>
          : patient.labs.map((l, i) => (
              <span key={i} style={{ fontSize: 12, padding: "4px 12px", background: C.blueBg, color: C.blueDark, borderRadius: 6 }}>{l}</span>
            ))
        }
      </div>

      {/* action buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleDispense} disabled={done}
          style={{ flex: 1, padding: 9, background: done ? "#27500A" : C.blue, color: C.white, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: done ? "default" : "pointer" }}
        >
          {done ? "Dispensed ✓" : "Dispense all & generate bill"}
        </button>
        <button style={btnDefault({ padding: "9px 14px" })}>Print label</button>
      </div>
      {done && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: C.blueBg, color: C.blueDark, borderRadius: 8, fontSize: 12 }}>
          Medicines dispensed to {patient.name} ({token}). Bill generated. Record updated.
        </div>
      )}
    </div>
  );
}

// ─── Registration Panel ────────────────────────────────────────────────────────

function RegistrationPanel({ onRegister, tokenCount }) {
  const [form, setForm] = useState({ name: "", age: "", gender: "Male", phone: "", village: "", reason: "General OPD" });
  const [issued, setIssued] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleSubmit() {
    if (!form.name.trim()) { alert("Enter patient name"); return; }
    const tok = `T-${String(tokenCount + 1).padStart(3, "0")}`;
    setIssued({ token: tok, name: form.name });
    onRegister({ ...form, token: tok });
    setForm({ name: "", age: "", gender: "Male", phone: "", village: "", reason: "General OPD" });
  }

  const lowCount = INVENTORY.filter((i) => i.stock === 0 || i.stock < i.min).length;

  return (
    <div style={{ borderLeft: `0.5px solid ${C.border}`, padding: 12, background: C.sidebarBg }}>
      <p style={sideTitle()}>New patient registration</p>

      <div style={cardStyle()}>
        <label style={lbl()}>Full name</label>
        <input style={inputStyle()} placeholder="Patient full name" value={form.name} onChange={(e) => set("name", e.target.value)} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div>
            <label style={lbl()}>Age</label>
            <input style={{ ...inputStyle(), marginBottom: 0 }} type="number" placeholder="Age" value={form.age} onChange={(e) => set("age", e.target.value)} />
          </div>
          <div>
            <label style={lbl()}>Gender</label>
            <select style={{ ...inputStyle(), marginBottom: 0 }} value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>

        <label style={lbl()}>Mobile number</label>
        <input style={inputStyle()} placeholder="10-digit mobile" value={form.phone} onChange={(e) => set("phone", e.target.value)} />

        <label style={lbl()}>Village or address</label>
        <input style={inputStyle()} placeholder="Village or address" value={form.village} onChange={(e) => set("village", e.target.value)} />

        <label style={lbl()}>Visit reason</label>
        <select style={inputStyle()} value={form.reason} onChange={(e) => set("reason", e.target.value)}>
          <option>General OPD</option>
          <option>Fever / Cold</option>
          <option>Injury</option>
          <option>Follow-up</option>
          <option>Other</option>
        </select>

        <button onClick={handleSubmit} style={{ width: "100%", padding: 10, background: C.blue, color: C.white, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Register &amp; issue token
        </button>

        {issued && (
          <div style={{ marginTop: 10, background: C.blueBg, padding: "10px 12px", borderRadius: 8, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 26, fontWeight: 600, color: C.blue }}>{issued.token}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: C.blueDark }}>{issued.name} registered successfully</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div style={{ ...cardStyle(), marginTop: 12 }}>
        <p style={sideTitle()}>Quick stats</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Dispensed today", val: "5",      color: C.blue  },
            { label: "Low stock items", val: lowCount,  color: C.red   },
            { label: "Bills today",     val: "5",      color: C.green  },
            { label: "Collected",       val: "₹786",   color: C.green  },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "#f0f4f8", borderRadius: 6, padding: 10, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: C.textMid }}>{label}</p>
              <p style={{ margin: "4px 0 0", fontSize: typeof val === "string" && val.includes("₹") ? 18 : 22, fontWeight: 500, color }}>{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function PharmacyModule() {
  const [viewMode,    setViewMode]   = useState('dispensary'); // 'dispensary' | 'inventory'
  const [invOpen,     setInvOpen]    = useState(false);
  const [patients,    setPatients]   = useState(INIT_PATIENTS);
  const [queueOrder,  setQueueOrder] = useState(QUEUE_ORDER);
  const [activeToken, setActive]     = useState(null);
  const [tokenCount,  setTokenCount] = useState(7);

  function handleDispense(token) {
    setPatients((prev) => ({ ...prev, [token]: { ...prev[token], status: "dispensed" } }));
  }

  function handleRegister(form) {
    const tok = `T-${String(tokenCount + 1).padStart(3, "0")}`;
    setTokenCount((c) => c + 1);
    setPatients((prev) => ({
      ...prev,
      [tok]: {
        name: form.name, age: form.age || "—", gender: form.gender,
        village: form.village || "—", reason: form.reason, phone: form.phone || "—",
        doctor: "—", time: "—", diag: "Pending consultation", advice: "—",
        status: "waiting", meds: [], labs: [],
      },
    }));
    setQueueOrder((prev) => [tok, ...prev]);
  }

  if (viewMode === 'inventory') {
    return <InventoryManagement onBack={() => setViewMode('dispensary')} />;
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 13, color: C.textDark, background: C.pageBg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: C.blue, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="8" width="14" height="2.5" rx="1" fill="#fff" />
              <rect x="7.75" y="2" width="2.5" height="14" rx="1" fill="#fff" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: "#fff" }}>Pharmacy module</p>
            <p style={{ margin: 0, fontSize: 11, color: "#b8d4f0" }}>Staff: PH001 &nbsp;·&nbsp; {TODAY}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {[{ label: "Tokens today", val: tokenCount }, { label: "Now serving", val: activeToken || "—" }].map(({ label, val }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "5px 16px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#b8d4f0" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "#fff" }}>{val}</p>
            </div>
          ))}
          <button onClick={() => setViewMode('inventory')} style={{ background: C.blueDark, color: "#fff", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600, marginRight: 8 }}>
            Full Inventory Manager
          </button>
          <button onClick={() => setInvOpen((o) => !o)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "0.5px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
            {invOpen ? "Hide quick stock" : "View quick stock"}
          </button>
        </div>
      </div>

      {/* Inventory panel */}
      {invOpen && <InventoryPanel onClose={() => setInvOpen(false)} />}

      {/* 3-column body */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 256px", minHeight: "calc(100vh - 57px)" }}>

        {/* Queue */}
        <div style={{ borderRight: `0.5px solid ${C.border}`, background: C.sidebarBg, padding: 12, overflowY: "auto" }}>
          <p style={sideTitle()}>Patient queue</p>
          {queueOrder.map((tok) => {
            const p = patients[tok];
            if (!p) return null;
            return <QueueCard key={tok} token={tok} patient={p} active={tok === activeToken} onClick={() => setActive(tok)} />;
          })}
        </div>

        {/* Main */}
        <div style={{ padding: 16, background: C.pageBg }}>
          {!activeToken ? (
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "48px 20px", textAlign: "center" }}>
              <svg width="48" height="48" viewBox="0 0 48 48" style={{ margin: "0 auto 12px", display: "block", opacity: 0.2 }}>
                <circle cx="24" cy="16" r="10" stroke={C.blue} strokeWidth="2" fill="none" />
                <path d="M4 44c0-11 9-18 20-18s20 7 20 18" stroke={C.blue} strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              <p style={{ margin: 0, fontSize: 14, color: C.textMid }}>Select a patient from the queue to view their prescription</p>
            </div>
          ) : (
            <PrescriptionView key={activeToken} token={activeToken} patient={patients[activeToken]} onDispense={handleDispense} />
          )}
        </div>

        {/* Registration */}
        <RegistrationPanel onRegister={handleRegister} tokenCount={tokenCount} />
      </div>
    </div>
  );
}
