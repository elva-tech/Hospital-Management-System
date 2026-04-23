import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { api } from "../api/axios";
import { shareOnWhatsApp } from "../utils/whatsapp";

// Style object from teammate's design
const s: any = {
  page: { background: "#f0f4f8", minHeight: "100%", fontFamily: "system-ui, sans-serif" },
  header: { background: "#185FA5", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "12px 12px 0 0" },
  headerLeft: { display: "flex", alignItems: "center", gap: 12 },
  avatarBlue: { width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { margin: 0, fontWeight: 500, fontSize: 15, color: "#fff" },
  headerSub: { margin: 0, fontSize: 11, color: "#b8d4f0" },
  waitingBadge: { background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 13, fontWeight: 500, padding: "6px 16px", borderRadius: 6 },
  grid3: { display: "grid", gridTemplateColumns: "196px 1fr 256px", minHeight: "calc(100vh - 120px)" },
  sidebar: { borderRight: "0.5px solid #c5d5e8", padding: 12, background: "#e4edf7" },
  sidebarTitle: { fontSize: 11, fontWeight: 500, color: "#185FA5", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" },
  qCard: (active: boolean, done: boolean) => ({
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "7px 10px", borderRadius: 6, marginBottom: 4, cursor: "pointer",
    background: active ? "#185FA5" : done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.6)",
    border: "0.5px solid #c5d5e8",
  }),
  qToken: (active: boolean, done: boolean) => ({ fontSize: 12, fontWeight: 500, color: active ? "#fff" : done ? "#5a80a0" : "#0d2d4e" }),
  qName: (active: boolean, done: boolean) => ({ fontSize: 12, color: active ? "#fff" : done ? "#5a80a0" : "#0d2d4e" }),
  main: { padding: 16, background: "#f0f4f8", overflowY: "auto" },
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
  tableWrap: { border: "0.5px solid #c5d5e8", borderRadius: 8, overflow: "hidden", marginBottom: 10 },
  th: { padding: "6px 8px", textAlign: "left", color: "#185FA5", fontWeight: 500, background: "#e8f1fb" },
  td: { padding: "5px 8px", color: "#0d2d4e", borderTop: "0.5px solid #dce8f5" },
  btn: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 6, padding: "6px 14px", color: "#185FA5", fontSize: 12, cursor: "pointer" },
  btnPrimary: { background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: 13, fontWeight: 500, cursor: "pointer", flex: 1 },
  btnOutline: { background: "#fff", color: "#185FA5", border: "0.5px solid #185FA5", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" },
  btnSm: { background: "#fff", border: "0.5px solid #c5d5e8", borderRadius: 6, padding: "3px 10px", color: "#185FA5", fontSize: 11, cursor: "pointer" },
  btnSmBlue: { background: "#185FA5", color: "#fff", border: "none", borderRadius: 6, padding: "6px 18px", fontSize: 12, cursor: "pointer" },
  btnDanger: { background: "transparent", border: "none", color: "#A32D2D", fontSize: 11, cursor: "pointer", padding: "2px 6px" },
  btnSend: (col: string) => ({ width: "100%", background: col, color: "#fff", border: "none", borderRadius: 6, padding: "7px 0", fontSize: 12, fontWeight: 500, cursor: "pointer" }),
  togglePanel: { background: "#e8f1fb", border: "0.5px solid #b5d4f4", borderRadius: 8, padding: 12 },
  panelHint: { margin: "0 0 8px", fontSize: 11, color: "#185FA5" },
  testChk: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#0d2d4e", cursor: "pointer", padding: "4px 7px", borderRadius: 6, background: "#fff", border: "0.5px solid #b5d4f4" },
  testTag: { fontSize: 11, padding: "3px 9px", background: "#185FA5", color: "#fff", borderRadius: 6 },
  sendCard: { border: "0.5px solid #c5d5e8", borderRadius: 8, padding: 10, background: "#f7faff" },
  sendDot: (c: string) => ({ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }),
  sendLabel: (c: string) => ({ margin: 0, fontSize: 12, fontWeight: 500, color: c }),
  sendHint: { margin: "0 0 8px", fontSize: 11, color: "#5a80a0" },
  confirmBox: (bg: string, col: string) => ({ padding: "8px 12px", borderRadius: 8, fontSize: 12, background: bg, color: col, marginBottom: 10 }),
  histSidebar: { borderLeft: "0.5px solid #c5d5e8", padding: 12, background: "#e4edf7", overflowY: "auto" },
  histCard: (isFu: boolean) => ({ background: "#fff", border: `0.5px solid ${isFu ? "#185FA5" : "#c5d5e8"}`, borderRadius: 8, padding: 10, marginBottom: 8 }),
  histDate: { fontSize: 11, color: "#5a80a0" },
  histBadge: (isFu: boolean) => ({ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: isFu ? "#dbeafe" : "#e8f1fb", color: isFu ? "#0C447C" : "#185FA5" }),
  histDiag: { margin: "0 0 3px", fontSize: 12, fontWeight: 500, color: "#0d2d4e" },
  histMeds: { margin: 0, fontSize: 11, color: "#5a80a0" },
  fuSchedCard: { background: "#fff", border: "0.5px solid #b5d4f4", borderRadius: 6, padding: "8px 10px", marginBottom: 6 },
  fuSchedTitle: { margin: 0, fontSize: 12, fontWeight: 500, color: "#0C447C" },
  fuSchedSub: { margin: "2px 0 0", fontSize: 11, color: "#5a80a0" },
};

const ALL_TESTS = [
  "CBC", "Blood sugar (fasting)", "Blood sugar (PP)", "Urine routine",
  "Malaria antigen", "Typhoid (Widal)", "X-Ray chest", "LFT",
  "KFT", "HbA1c", "Dengue NS1", "ESR", "Stool routine", "COVID Ag",
];

const TIMING_OPTIONS = ["Thrice daily", "Twice daily", "Morning", "Afternoon", "Night"];
const FU_DAYS = ["3 days", "5 days", "7 days", "14 days", "1 month", "Custom"];
const FU_REMIND = ["SMS to patient", "WhatsApp", "Manual call", "No reminder"];

const SearchableMedicineSelect = ({ value, inventory, onChange }: { value: string, inventory: any[], onChange: (id: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedMed = inventory.find(m => m.id.toString() === value.toString());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredInventory = inventory.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...s.select,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: "#fff",
          minHeight: "28px"
        }}
      >
        <span style={{ color: selectedMed ? "#0d2d4e" : "#5a80a0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedMed ? selectedMed.name : "Select Medicine"}
        </span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "0.2s" }}>
          <path d="M1 1L5 5L9 1" stroke="#5a80a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "105%",
          left: 0,
          right: 0,
          background: "#fff",
          border: "0.5px solid #c5d5e8",
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          zIndex: 1000,
          padding: 4
        }}>
          <input 
            autoFocus
            placeholder="Search medicine..."
            style={{ ...s.input, marginBottom: 4, height: 28, fontSize: 11 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {filteredInventory.length === 0 ? (
              <div style={{ padding: "8px 12px", fontSize: 11, color: "#5a80a0" }}>No results found</div>
            ) : (
              filteredInventory.map(m => (
                <div 
                  key={m.id}
                  onClick={() => {
                    onChange(m.id.toString());
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    borderRadius: 4,
                    background: value.toString() === m.id.toString() ? "#e8f1fb" : "transparent",
                    color: "#0d2d4e",
                    transition: "0.2s"
                  }}
                  onMouseEnter={(e: any) => e.target.style.background = "#f0f4f8"}
                  onMouseLeave={(e: any) => e.target.style.background = value.toString() === m.id.toString() ? "#e8f1fb" : "transparent"}
                >
                  <div style={{ fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: "#5a80a0" }}>Stock: {m.stock} · Price: ₹{m.price}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function DoctorEnhanced() {
  const [queue, setQueue] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any | null>(null);
  const [activeQueueId, setActiveQueueId] = useState<number | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);

  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [vitals, setVitals] = useState({ bp: "", temp: "", weight: "", pulse: "" });
  
  const [meds, setMeds] = useState<any[]>([]);
  const [nextMedId, setNextMedId] = useState(1);

  const [labOpen, setLabOpen] = useState(false);
  const [selectedTests, setSelectedTests] = useState<Set<string>>(new Set());
  const [customTest, setCustomTest] = useState("");
  const [extraTests, setExtraTests] = useState<string[]>([]);

  const [fuOpen, setFuOpen] = useState(false);
  const [fuDays, setFuDays] = useState("7 days");
  const [fuReason, setFuReason] = useState("");
  const [fuRemind, setFuRemind] = useState("SMS to patient");
  const [fuList, setFuList] = useState<any[]>([]);
  const [fuSaved, setFuSaved] = useState(false);

  const [sentPh, setSentPh] = useState(false);
  const [sentLab, setSentLab] = useState(false);
  const [sendConfirm, setSendConfirm] = useState("");

  const todayStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const allTests = [...ALL_TESTS, ...extraTests];

  useEffect(() => {
    fetchQueue();
    fetchInventory();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get("/queue/today");
      setQueue(data.data.filter((q: any) => q.status !== "COMPLETED"));
    } catch (e) { console.error(e); }
  };

  const fetchInventory = async () => {
    try {
      const { data } = await api.get("/pharmacy/inventory");
      setInventory(data.data);
    } catch (e) { console.error(e); }
  };

  const callPatient = async (q: any) => {
    try {
      await api.patch("/queue/status", { queueId: q.id, status: "IN_CONSULTATION" });
      setActivePatient(q.patient);
      setActiveQueueId(q.id);
      
      // Fetch history
      const { data } = await api.get(`/patients/${q.patient.phone}`);
      setPatientHistory(data.data.consultations || []);
      
      // Reset form
      setSymptoms("");
      setDiagnosis("");
      setNotes("");
      setMeds([]);
      setSentPh(false);
      setSentLab(false);
      setSendConfirm("");
      setFuSaved(false);
      setFuList([]);
      
      fetchQueue();
    } catch (e) { alert("Error calling patient"); }
  };

  function updateMed(id: number, field: string, val: any) {
    setMeds(meds.map(m => m.id === id ? { ...m, [field]: val } : m));
  }
  function removeMed(id: number) { setMeds(meds.filter(m => m.id !== id)); }
  function addMedRow() {
    setMeds([...meds, { id: nextMedId, medicineId: "", dose: "", dur: "", timing: "Morning" }]);
    setNextMedId(nextMedId + 1);
  }

  function toggleTest(t: string) {
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

  const handleFinishConsultation = async () => {
    if (!activePatient || !activeQueueId) return;
    setProcessing(true);
    try {
      // 1. Create Consultation
      const consultPayload = {
        queueId: activeQueueId,
        patientId: activePatient.id,
        symptoms,
        diagnosis,
        notes: `${notes} | Vitals: BP:${vitals.bp}, Temp:${vitals.temp}, Wt:${vitals.weight}, Pulse:${vitals.pulse}`
      };
      
      const res = await api.post("/doctor/consultation", consultPayload);
      const consultationId = res.data.data.id;

      let medText = "";
      // 2. Issue Prescription
      if (meds.length > 0) {
        const validItems = meds.filter(i => i.medicineId).map(i => {
          const med = inventory.find(m => m.id.toString() === i.medicineId.toString());
          if (med) medText += `- ${med.name}: ${i.dose} x ${i.dur} (${i.timing})\n`;
          return {
            medicineId: parseInt(i.medicineId),
            dosage: i.dose,
            duration: i.dur,
            quantity: 10 // Default qty for simulation
          };
        });
        
        if (validItems.length > 0) {
           await api.post("/doctor/prescription", { consultationId, items: validItems });
        }
      }

      // 3. Lab Requests
      if (selectedTests.size > 0) {
        for (const test of selectedTests) {
          await api.post("/diagnosis/request", { consultationId, testName: test });
        }
      }

      // WhatsApp sharing
      const msg = `*Clinic HMS - Prescription*\n\nPatient: ${activePatient.name}\nDiagnosis: ${diagnosis}\n\n*Medicines:*\n${medText || "No medicines prescribed."}\n\n_Please proceed to the pharmacy._`;
      shareOnWhatsApp(activePatient.phone, msg);

      // Reset
      setActivePatient(null);
      setActiveQueueId(null);
      fetchQueue();
      alert("Consultation completed successfully!");
    } catch (e) {
      alert("Error saving record");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
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
              <p style={s.headerTitle}>Enhanced Doctor Module</p>
              <p style={s.headerSub}>{todayStr} &nbsp;·&nbsp; General OPD</p>
            </div>
          </div>
          <div style={s.waitingBadge}>Patients waiting: {queue.length}</div>
        </div>

        {/* 3-column layout */}
        <div style={s.grid3}>

          {/* Queue */}
          <div style={s.sidebar}>
            <p style={s.sidebarTitle}>Queue</p>
            {queue.map(q => {
              const active = activeQueueId === q.id;
              const done = q.status === "COMPLETED";
              return (
                <div key={q.id} style={s.qCard(active, done)} onClick={() => !done && callPatient(q)}>
                  <span style={s.qToken(active, done)}>#{q.tokenNumber}</span>
                  <span style={s.qName(active, done)}>{q.patient.name}</span>
                </div>
              );
            })}
            {queue.length === 0 && <p style={{fontSize: 12, color: '#5a80a0'}}>No patients in queue</p>}
          </div>

          {/* Main consultation */}
          <div style={s.main}>
            {!activePatient ? (
              <div style={{...s.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', borderStyle: 'dashed', color: '#5a80a0'}}>
                  <p>No active consultation.</p>
                  <p style={{fontSize: 12}}>Select a patient from the queue to start.</p>
              </div>
            ) : (
              <div style={s.card}>
                {/* Patient header */}
                <div style={s.patRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={s.patAv}>{activePatient.name.substring(0,2).toUpperCase()}</div>
                    <div>
                      <p style={s.patName}>
                        {activePatient.name}{" "}
                        <span style={{ fontSize: 13, fontWeight: 400, color: "#5a80a0" }}>{activePatient.age} {activePatient.gender}</span>
                      </p>
                      <p style={s.patSub}>
                        Phone: {activePatient.phone} &nbsp;·&nbsp; Address: {activePatient.address || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {fuSaved && <span style={s.fuBadge}>Follow-up set</span>}
                    <span style={s.currBadge}>Active Case</span>
                  </div>
                </div>

                {/* Symptoms */}
                <div style={{ marginBottom: 10 }}>
                  <label style={s.label}>Symptoms / Chief complaint</label>
                  <textarea style={{ ...s.textarea, height: 56 }} value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Enter patient complaints..." />
                </div>

                {/* Vitals */}
                <div style={s.grid4}>
                  {[["BP (mmHg)", "bp"], ["Temp (°F)", "temp"], ["Weight (kg)", "weight"], ["Pulse (bpm)", "pulse"]].map(([lbl, key]: any) => (
                    <div key={key}>
                      <label style={s.labelSm}>{lbl}</label>
                      <input style={s.input} value={(vitals as any)[key]} onChange={e => setVitals({ ...vitals, [key]: e.target.value })} placeholder="--" />
                    </div>
                  ))}
                </div>

                {/* Diagnosis */}
                <div style={{ marginBottom: 10 }}>
                  <label style={s.label}>Diagnosis</label>
                  <input style={s.input} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Enter final diagnosis..." />
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
                        <col style={{ width: "35%" }} /><col style={{ width: "15%" }} />
                        <col style={{ width: "15%" }} /><col style={{ width: "25%" }} /><col style={{ width: "10%" }} />
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
                            <td style={{ ...s.td, overflow: "visible" }}>
                               <SearchableMedicineSelect 
                                 value={m.medicineId} 
                                 inventory={inventory} 
                                 onChange={(id) => updateMed(m.id, "medicineId", id)} 
                               />
                            </td>
                            <td style={s.td}><input style={s.input} value={m.dose} onChange={e => updateMed(m.id, "dose", e.target.value)} placeholder="1-0-1" /></td>
                            <td style={s.td}><input style={s.input} value={m.dur} onChange={e => updateMed(m.id, "dur", e.target.value)} placeholder="3 days" /></td>
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
                    {meds.length === 0 && <p style={{fontSize: 11, color: '#5a80a0', padding: 8, textAlign: 'center'}}>No medicines added</p>}
                  </div>
                </div>

                {/* Lab tests toggle */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <label style={{ ...s.label, marginBottom: 0 }}>Lab tests / Investigations</label>
                    <button style={s.btnSm} onClick={() => setLabOpen(!labOpen)}>
                      {labOpen ? "Hide options" : "+ Request tests"}
                    </button>
                  </div>
                  {labOpen && (
                    <div style={s.togglePanel}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, marginBottom: 8 }}>
                        {allTests.map(t => (
                          <label key={t} style={s.testChk}>
                            <input type="checkbox" checked={selectedTests.has(t)} onChange={() => toggleTest(t)} />
                            {t}
                          </label>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input style={{ ...s.input, flex: 1, fontSize: 12 }} placeholder="Other test..." value={customTest} onChange={e => setCustomTest(e.target.value)} />
                        <button style={s.btnSmBlue} onClick={addCustomTest}>Add</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advice */}
                <div style={{ marginBottom: 12 }}>
                  <label style={s.label}>Advice / Notes</label>
                  <textarea style={{ ...s.textarea, height: 50 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Rest, avoid oily food, etc." />
                </div>

                <div style={{ borderTop: "0.5px solid #dce8f5", paddingTop: 12, display: 'flex', gap: 12 }}>
                  <button style={s.btnPrimary} onClick={handleFinishConsultation} disabled={processing}>
                    {processing ? "Saving..." : "Finish Consultation & Share"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* History sidebar */}
          <div style={s.histSidebar}>
            <p style={s.sidebarTitle}>Patient History</p>
            {patientHistory.length === 0 ? (
                 <p style={{fontSize: 11, color: '#5a80a0'}}>No previous records found.</p>
            ) : (
                patientHistory.map((h, i) => (
                    <div key={i} style={s.histCard(false)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={s.histDate}>{new Date(h.date).toLocaleDateString()}</span>
                            <span style={s.histBadge(false)}>OPD</span>
                        </div>
                        <p style={s.histDiag}>{h.diagnosis || 'No diagnosis recorded'}</p>
                        <p style={s.histMeds}>{h.symptoms.substring(0, 50)}...</p>
                    </div>
                ))
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
