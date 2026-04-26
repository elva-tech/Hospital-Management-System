import { useState, useEffect } from "react";

const API_BASE = "https://hospital-management-system-67as.onrender.com";

const ALL_TESTS = [
  "CBC", "Blood sugar (fasting)", "Blood sugar (PP)", "Urine routine",
  "Malaria antigen", "Typhoid (Widal)", "X-Ray chest", "LFT",
  "KFT", "HbA1c", "Dengue NS1", "ESR", "Stool routine", "COVID Ag",
];

const TIMING_OPTIONS = ["Thrice daily", "Twice daily", "Morning", "Afternoon", "Night"];
const FU_DAYS = ["3 days", "5 days", "7 days", "14 days", "1 month", "Custom"];
const FU_REMIND = ["SMS to patient", "WhatsApp", "Manual call", "No reminder"];

const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const s = {
  // layout
  page: { background: "#f0f4f8", minHeight: "100vh", fontFamily: "system-ui, sans-serif" },
  header: { background: "#185FA5", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatarBlue: { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { margin: 0, fontWeight: 500, fontSize: 15, color: "#fff" },
  headerSub: { margin: 0, fontSize: 11, color: "#b8d4f0" },
  waitingBadge: { background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 13, fontWeight: 500, padding: "6px 16px", borderRadius: 6 },
  grid3: { display: "grid", gridTemplateColumns: "196px 1fr 256px", minHeight: "calc(100vh - 57px)" },
  // sidebar
  sidebar: { borderRight: "0.5px solid #c5d5e8", padding: 12, background: "#e4edf7" },
  sidebarTitle: { fontSize: 11, fontWeight: 500, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" },
  qCard: (active, done) => ({
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "7px 10px", borderRadius: 6, marginBottom: 4, cursor: "pointer",
    background: active ? "#185FA5" : done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)",
    border: "0.5px solid #c5d5e8",
  }),
  qToken: (active, done) => ({ fontSize: 12, fontWeight: 500, color: active ? "#fff" : done ? "#5a80a0" : "#0d2d4e" }),
  qName: (active, done) => ({ fontSize: 12, color: active ? "#fff" : done ? "#5a80a0" : "#0d2d4e" }),
  // main
  main: { padding: 16, background: "#f0f4f8" },
  card: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 10, padding: 14, marginBottom: 12 },
  patRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: "0.5px solid #dce8f5" },
  patAv: { width: 42, height: 42, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 14, color: "#0C447C", flexShrink: 0 },
  patName: { margin: 0, fontSize: 16, fontWeight: 500, color: "#0d2d4e" },
  patSub: { margin: "2px 0 0", fontSize: 11, color: "#5a80a0" },
  currBadge: { background: "#dbeafe", color: "#0C447C", fontSize: 11, padding: "3px 10px", borderRadius: 6 },
  fuBadge: { background: "#dbeafe", color: "#0C447C", fontSize: 11, padding: "3px 10px", borderRadius: 6 },
  label: { fontSize: 12, fontWeight: 500, color: "#5a80a0", display: "block", marginBottom: 4 },
  labelSm: { fontSize: 11, color: "#5a80a0", display: "block", marginBottom: 3 },
  input: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 6, padding: "6px 10px", color: "#0d2d4e", fontSize: 13, width: "100%", outline: "none" },
  textarea: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 6, padding: "6px 10px", color: "#0d2d4e", fontSize: 13, width: "100%", outline: "none", resize: "none" },
  select: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 6, padding: "6px 10px", color: "#0d2d4e", fontSize: 12, width: "100%", outline: "none" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 10 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  grid3c: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 },
  // table
  tableWrap: { border: "0.5px solid #c5d5e8", borderRadius: 8, overflow: "hidden", marginBottom: 10 },
  th: { padding: "6px 8px", textAlign: "left", color: "#185FA5", fontWeight: 500, background: "#e8f1fb" },
  td: { padding: "5px 8px", color: "#0d2d4e", borderTop: "0.5px solid #dce8f5" },
  // buttons
  btn: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 6, padding: "6px 14px", color: "#185FA5", fontSize: 12, cursor: "pointer" },
  btnPrimary: { background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", flex: 1 },
  btnOutline: { background: "#fff", color: "#185FA5", border: "0.5px solid #185FA5", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" },
  btnSm: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 6, padding: "3px 10px", color: "#185FA5", fontSize: 11, cursor: "pointer" },
  btnSmBlue: { background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontSize: 12, cursor: "pointer" },
  btnDanger: { background: "transparent", border: "none", color: "#A32D2D", fontSize: 11, cursor: "pointer", padding: "2px 6px" },
  btnSend: (col) => ({ width: "100%", background: col, color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", fontSize: 12, fontWeight: 500, cursor: "pointer" }),
  // toggle panels
  togglePanel: { background: "#e8f1fb", border: "0.5px solid #b5d4f4", borderRadius: 8, padding: 12 },
  panelHint: { margin: "0 0 8px", fontSize: 11, color: "#185FA5" },
  testChk: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#0d2d4e", cursor: "pointer", padding: "4px 7px", borderRadius: 6, background: "#fff", border: "0.5px solid #b5d4f4" },
  testTag: { fontSize: 11, padding: "3px 9px", background: "#185FA5", color: "#fff", borderRadius: 6 },
  // send cards
  sendCard: { border: "0.5px solid #c5d5e8", borderRadius: 8, padding: 10, background: "#f7faff" },
  sendDot: (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }),
  sendLabel: (c) => ({ margin: 0, fontSize: 12, fontWeight: 500, color: c }),
  sendHint: { margin: "0 0 8px", fontSize: 11, color: "#5a80a0" },
  confirmBox: (bg, col) => ({ padding: "8px 12px", borderRadius: 8, fontSize: 12, background: bg, color: col, marginBottom: 10 }),
  // history
  histSidebar: { borderLeft: "0.5px solid #c5d5e8", padding: 12, background: "#e4edf7", overflowY: "auto" },
  histCard: (isFu) => ({ background: "#fff", border: `0.5px solid ${isFu ? "#185FA5" : "#c5d5e8"}`, borderRadius: 8, padding: 10, marginBottom: 8 }),
  histDate: { fontSize: 11, color: "#5a80a0" },
  histBadge: (isFu) => ({ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: isFu ? "#dbeafe" : "#e8f1fb", color: isFu ? "#0C447C" : "#185FA5" }),
  histDiag: { margin: "0 0 3px", fontSize: 12, fontWeight: 500, color: "#0d2d4e" },
  histMeds: { margin: 0, fontSize: 11, color: "#5a80a0" },
  fuSchedCard: { background: "#fff", border: "0.5px solid #b5d4f4", borderRadius: 6, padding: "8px 10px", marginBottom: 6 },
  fuSchedTitle: { margin: 0, fontSize: 12, fontWeight: 500, color: "#0C447C" },
  fuSchedSub: { margin: "2px 0 0", fontSize: 11, color: "#5a80a0" },
  infoGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 },
  infoBox: { background: "#f0f4f8", borderRadius: 6, padding: "8px 12px" },
  infoLabel: { margin: 0, fontSize: 11, color: "#5a80a0" },
  infoVal: { margin: "3px 0 0", fontSize: 13, color: "#0d2d4e" },
};

export default function DoctorModule() {
  const [queue, setQueue] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [history, setHistory] = useState([]);

  const [meds, setMeds] = useState([]);
  const [nextMedId, setNextMedId] = useState(1);

  const [vitals, setVitals] = useState({ bp: "120/80", temp: "98.6", weight: "70", pulse: "80" });
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [advice, setAdvice] = useState("");

  const [labOpen, setLabOpen] = useState(false);
  const [selectedTests, setSelectedTests] = useState(new Set());
  const [customTest, setCustomTest] = useState("");
  const [extraTests, setExtraTests] = useState([]);

  const [fuOpen, setFuOpen] = useState(false);
  const [fuDays, setFuDays] = useState("7 days");
  const [fuReason, setFuReason] = useState("");
  const [fuRemind, setFuRemind] = useState("SMS to patient");
  const [fuList, setFuList] = useState([]);
  const [fuSaved, setFuSaved] = useState(false);

  const [sentPh, setSentPh] = useState(false);
  const [sentLab, setSentLab] = useState(false);
  const [sendConfirm, setSendConfirm] = useState("");

  const allTests = [...ALL_TESTS, ...extraTests];

  useEffect(() => {
    fetchQueue();
  }, []);

  async function fetchQueue() {
    const token = localStorage.getItem("hms_token");
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/queue/today`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setQueue(data.data || []);
      }
    } catch (err) { console.error(err); }
  }

  function selectPatient(q) {
    setActivePatient(q);
    setSentPh(false);
    setSentLab(false);
    setSendConfirm("");
    setMeds([]);
  }

  function updateMed(id, field, val) {
    setMeds(meds.map(m => m.id === id ? { ...m, [field]: val } : m));
  }
  function removeMed(id) { setMeds(meds.filter(m => m.id !== id)); }
  function addMedRow() {
    setMeds([...meds, { id: nextMedId, name: "", dose: "", dur: "", timing: "Morning" }]);
    setNextMedId(nextMedId + 1);
  }

  function toggleTest(t) {
    const s = new Set(selectedTests);
    s.has(t) ? s.delete(t) : s.add(t);
    setSelectedTests(s);
  }
  function addCustomTest() {
    if (!customTest.trim()) return;
    if (!allTests.includes(customTest.trim())) setExtraTests([...extraTests, customTest.trim()]);
    const s = new Set(selectedTests);
    s.add(customTest.trim());
    setSelectedTests(s);
    setCustomTest("");
  }

  function saveFollowup() {
    const reason = fuReason || "General review";
    setFuList([...fuList, { days: fuDays, reason, remind: fuRemind }]);
    setFuSaved(true);
    setTimeout(() => setFuOpen(false), 800);
  }

  async function submitPrescription() {
    if(!activePatient) return alert("Select patient first!");
    const token = localStorage.getItem("hms_token");
    setSendConfirm("Uploading prescription to cloud database...");

    try {
      await fetch(`${API_BASE}/api/queue/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ queue_id: activePatient._id, status: "Completed" })
      });
      setSendConfirm(`Success! Prescription data injected into MongoDB payload.`);
      setSentPh(true);
      fetchQueue();
    } catch(err) {
      setSendConfirm("Error routing payload to server.");
    }
  }

  function sendReport(dest) {
    if (dest === "pharmacy") submitPrescription();
    else {
      setSentLab(true);
      setSendConfirm(`Lab order integrated to active diagnostic tests pipeline!`);
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.avatarBlue}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="4" stroke="#fff" strokeWidth="1.5" fill="none" />
              <path d="M2 17c0-4 3-6 7-6s7 2 7 6" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p style={s.headerTitle}>Doctor module</p>
            <p style={s.headerSub}>Dr. Ramesh Gupta &nbsp;·&nbsp; General OPD &nbsp;·&nbsp; {today}</p>
          </div>
        </div>
        <div style={s.waitingBadge}>Patients waiting: 4</div>
      </div>

      {/* 3-column layout */}
      <div style={s.grid3}>

        {/* Queue */}
        <div style={s.sidebar}>
          <p style={s.sidebarTitle}>Live Queue</p>
          {queue.length === 0 && <p style={{fontSize: 12, padding: 8, color: "#185FA5"}}>No patients in queue yet today.</p>}
          {queue.map(q => {
            const active = activePatient?._id === q._id;
            const done = q.status === "Completed";
            return (
              <div key={q._id} onClick={() => selectPatient(q)} style={s.qCard(active, done)}>
                <span style={s.qToken(active, done)}>{q.patient?.phone || "Q"}</span>
                <span style={s.qName(active, done)}>{q.patient?.name || "Patient"}</span>
              </div>
            );
          })}
        </div>

        {/* Main consultation */}
        <div style={s.main}>
          <div style={s.card}>
            {/* Patient header */}
            <div style={s.patRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={s.patAv}>{activePatient ? activePatient.patient?.name?.substring(0,2).toUpperCase() : "NA"}</div>
                <div>
                  <p style={s.patName}>
                    {activePatient ? activePatient.patient?.name : "Select a patient..."}{" "}
                    {activePatient && <span style={{ fontSize: 13, fontWeight: 400, color: "#5a80a0" }}>Live DB Access</span>}
                  </p>
                  <p style={s.patSub}>
                    {activePatient ? `Queue status: ${activePatient.status} · Ph: ${activePatient.patient?.phone}` : "Waiting for queue selection..."}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {fuSaved && <span style={s.fuBadge}>Follow-up set</span>}
                {activePatient && <span style={s.currBadge}>Current patient</span>}
              </div>
            </div>

            {/* Symptoms */}
            <div style={{ marginBottom: 10 }}>
              <label style={s.label}>Symptoms / Chief complaint</label>
              <textarea style={{ ...s.textarea, height: 56 }} value={symptoms} onChange={e => setSymptoms(e.target.value)} />
            </div>

            {/* Vitals */}
            <div style={s.grid4}>
              {[["BP (mmHg)", "bp"], ["Temp (°F)", "temp"], ["Weight (kg)", "weight"], ["Pulse (bpm)", "pulse"]].map(([lbl, key]) => (
                <div key={key}>
                  <label style={s.labelSm}>{lbl}</label>
                  <input style={s.input} value={vitals[key]} onChange={e => setVitals({ ...vitals, [key]: e.target.value })} />
                </div>
              ))}
            </div>

            {/* Diagnosis */}
            <div style={{ marginBottom: 10 }}>
              <label style={s.label}>Diagnosis</label>
              <input style={s.input} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
            </div>

            {/* Medicines */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Prescription — medicines</label>
                <button style={s.btnSm} onClick={addMedRow}>+ Add row</button>
              </div>
              <div style={s.tableWrap}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "32%" }} /><col style={{ width: "14%" }} />
                    <col style={{ width: "15%" }} /><col style={{ width: "27%" }} /><col style={{ width: "12%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {["Medicine", "Dosage", "Duration", "Timing", "Del"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meds.map(m => (
                      <tr key={m.id}>
                        <td style={s.td}><input style={s.input} value={m.name} onChange={e => updateMed(m.id, "name", e.target.value)} /></td>
                        <td style={s.td}><input style={s.input} value={m.dose} onChange={e => updateMed(m.id, "dose", e.target.value)} /></td>
                        <td style={s.td}><input style={s.input} value={m.dur} onChange={e => updateMed(m.id, "dur", e.target.value)} /></td>
                        <td style={s.td}>
                          <select style={s.select} value={m.timing} onChange={e => updateMed(m.id, "timing", e.target.value)}>
                            {TIMING_OPTIONS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </td>
                        <td style={{ ...s.td, textAlign: "center" }}>
                          <button style={s.btnDanger} onClick={() => removeMed(m.id)}>x</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lab tests toggle */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ ...s.label, marginBottom: 0 }}>
                  Lab tests to order{" "}
                  <span style={{ fontSize: 11, fontWeight: 400 }}>(sent to lab only)</span>
                </label>
                <button style={s.btnSm} onClick={() => setLabOpen(!labOpen)}>
                  {labOpen ? "Hide lab tests" : "+ Add lab tests"}
                </button>
              </div>
              {labOpen && (
                <div style={s.togglePanel}>
                  <p style={s.panelHint}>Select tests — sent directly to diagnostic lab only, not printed on prescription</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: 8 }}>
                    {allTests.map(t => (
                      <label key={t} style={s.testChk}>
                        <input type="checkbox" checked={selectedTests.has(t)} onChange={() => toggleTest(t)} />
                        {t}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input style={{ ...s.input, flex: 1, fontSize: 12 }} placeholder="Add custom test..." value={customTest} onChange={e => setCustomTest(e.target.value)} />
                    <button style={s.btnSmBlue} onClick={addCustomTest}>Add</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {selectedTests.size === 0
                      ? <span style={{ fontSize: 11, color: "#5a80a0" }}>No tests selected</span>
                      : [...selectedTests].map(t => <span key={t} style={s.testTag}>{t}</span>)
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up toggle */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <label style={{ ...s.label, marginBottom: 0 }}>Follow-up visit</label>
                <button style={s.btnSm} onClick={() => setFuOpen(!fuOpen)}>
                  {fuOpen ? "Hide follow-up" : "+ Schedule follow-up"}
                </button>
              </div>
              {fuOpen && (
                <div style={s.togglePanel}>
                  <div style={{ ...s.grid3c, marginBottom: 8 }}>
                    <div>
                      <label style={{ ...s.labelSm, color: "#185FA5" }}>Return after</label>
                      <select style={s.select} value={fuDays} onChange={e => setFuDays(e.target.value)}>
                        {FU_DAYS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...s.labelSm, color: "#185FA5" }}>Reason</label>
                      <input style={s.input} placeholder="e.g. BP review, fever check" value={fuReason} onChange={e => setFuReason(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ ...s.labelSm, color: "#185FA5" }}>Remind via</label>
                      <select style={s.select} value={fuRemind} onChange={e => setFuRemind(e.target.value)}>
                        {FU_REMIND.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button style={s.btnSmBlue} onClick={saveFollowup}>Confirm follow-up</button>
                    <button style={s.btn} onClick={() => setFuOpen(false)}>Cancel</button>
                    {fuSaved && <span style={{ fontSize: 12, color: "#0C447C" }}>Confirmed ✓</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Advice */}
            <div style={{ marginBottom: 12 }}>
              <label style={s.label}>Advice / Notes</label>
              <textarea style={{ ...s.textarea, height: 50 }} value={advice} onChange={e => setAdvice(e.target.value)} />
            </div>

            {/* Send prescription report */}
            <div style={{ borderTop: "0.5px solid #dce8f5", paddingTop: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#5a80a0", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Send prescription report
              </p>
              <div style={{ ...s.grid2, marginBottom: 10 }}>
                <div style={s.sendCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <div style={s.sendDot("#185FA5")} />
                    <p style={s.sendLabel("#0C447C")}>Pharmacy</p>
                  </div>
                  <p style={s.sendHint}>Sends full medicine list with dosage &amp; duration</p>
                  <button style={s.btnSend(sentPh ? "#27500A" : "#185FA5")} onClick={() => sendReport("pharmacy")} disabled={sentPh}>
                    {sentPh ? "Sent ✓" : "Send to pharmacy"}
                  </button>
                </div>
                <div style={s.sendCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <div style={s.sendDot("#378ADD")} />
                    <p style={s.sendLabel("#185FA5")}>Diagnostic lab</p>
                  </div>
                  <p style={s.sendHint}>Sends selected lab tests only (not prescription)</p>
                  <button style={s.btnSend(sentLab ? "#27500A" : "#378ADD")} onClick={() => sendReport("lab")} disabled={sentLab}>
                    {sentLab ? "Sent ✓" : "Send to lab"}
                  </button>
                </div>
              </div>
              {sendConfirm && (
                <div style={s.confirmBox("#dbeafe", "#0C447C")}>{sendConfirm}</div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.btnPrimary}>Save &amp; print prescription</button>
                <button style={s.btnOutline}>Call next patient</button>
              </div>
            </div>
          </div>
        </div>

        {/* History sidebar */}
        <div style={s.histSidebar}>
          <p style={s.sidebarTitle}>Patient history — Anita Sharma</p>
          {history.length === 0 ? <p style={{fontSize: 11, padding: 10, color: "#5a80a0"}}>No previous history found on cloud database.</p> : history.map((h, i) => {
            const isFu = h.type === "Follow-up";
            return (
              <div key={i} style={s.histCard(isFu)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={s.histDate}>{h.date}</span>
                  <span style={s.histBadge(isFu)}>{h.type}</span>
                </div>
                <p style={s.histDiag}>{h.diag}</p>
                <p style={s.histMeds}>{h.meds}</p>
              </div>
            );
          })}

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "0.5px solid #c5d5e8" }}>
            <p style={s.sidebarTitle}>Follow-up schedule</p>
            {fuList.length === 0
              ? <p style={{ fontSize: 12, color: "#5a80a0", margin: 0 }}>No follow-ups scheduled yet.</p>
              : fuList.map((f, i) => (
                <div key={i} style={s.fuSchedCard}>
                  <p style={s.fuSchedTitle}>After {f.days}</p>
                  <p style={s.fuSchedSub}>{f.reason} · {f.remind}</p>
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </div>
  );
}
