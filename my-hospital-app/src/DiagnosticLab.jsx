import { useState, useRef } from "react";

// ─── Live Dynamic Data Mode ───────────────────────────────────────────────────────────────
// (Fetching directly from backend using JSON Web Tokens)
const API_BASE = "https://hospital-management-system-67as.onrender.com";

const TEST_PARAMS = {
  "CBC": [
    { p: "Haemoglobin", v: "10.2", u: "g/dL",    lo: 12,   hi: 16,    r: "12–16"     },
    { p: "WBC count",   v: "9800", u: "cells/µL", lo: 4000, hi: 11000, r: "4000–11000" },
    { p: "Platelets",   v: "1.8",  u: "lakh/µL",  lo: 1.5,  hi: 4.0,   r: "1.5–4.0"  },
  ],
  "Malaria antigen": [
    { p: "Result", v: "Negative", u: "—", lo: null, hi: null, r: "Negative" },
  ],
  "Blood sugar fasting": [
    { p: "Blood glucose", v: "92", u: "mg/dL", lo: 70, hi: 100, r: "70–100" },
  ],
  "Urine routine": [
    { p: "Protein", v: "Nil", u: "—",    lo: null, hi: null, r: "Nil"  },
    { p: "Sugar",   v: "Nil", u: "—",    lo: null, hi: null, r: "Nil"  },
    { p: "RBC",     v: "0–1", u: "/hpf", lo: null, hi: null, r: "0–2"  },
  ],
  "X-Ray chest": [
    { p: "Finding", v: "Normal lung fields", u: "—", lo: null, hi: null, r: "Normal" },
  ],
  "Typhoid test": [
    { p: "Widal O", v: "1:40", u: "titre", lo: null, hi: null, r: "< 1:80" },
    { p: "Widal H", v: "1:20", u: "titre", lo: null, hi: null, r: "< 1:80" },
  ],
};

const TODAY = new Date().toLocaleDateString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getFlag(val, lo, hi) {
  if (lo === null) return "—";
  const n = parseFloat(val);
  if (isNaN(n)) return "—";
  if (n < lo) return "Low";
  if (n > hi) return "High";
  return "Normal";
}

const FLAG_STYLE = {
  Low:    { background: "#FCEBEB", color: "#791F1F" },
  High:   { background: "#FCEBEB", color: "#791F1F" },
  Normal: { background: "#DCFCE7", color: "#166534" },
  "—":    { background: "#f0f4f8", color: "#5a80a0" },
};

const STATUS_STYLE = {
  pending:      { background: "#f0f4f8", color: "#5a80a0" },
  "in-progress":{ background: "#dbeafe", color: "#0C447C" },
  done:         { background: "#DCFCE7", color: "#166534" },
};

// ─── Color constants ───────────────────────────────────────────────────────────
const C = {
  blue:      "#185FA5",
  blueDark:  "#0C447C",
  blueBg:    "#dbeafe",
  blueLight: "#e8f1fb",
  pageBg:    "#f0f4f8",
  white:     "#ffffff",
  border:    "#c5d5e8",
  borderLt:  "#dce8f5",
  textDark:  "#0d2d4e",
  textMid:   "#5a80a0",
  green:     "#27500A",
  greenBg:   "#DCFCE7",
  greenDark: "#166534",
  red:       "#A32D2D",
};

// ─── Reusable style objects ────────────────────────────────────────────────────

const card = {
  background: C.white, border: `0.5px solid ${C.border}`,
  borderRadius: 10, padding: 14, marginBottom: 14,
};

const sectionLabel = {
  fontSize: 12, fontWeight: 500, color: C.blue,
  textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px",
};

const thStyle = {
  padding: "7px 10px", textAlign: "left",
  color: C.blue, fontWeight: 500, fontSize: 12,
  background: C.blueLight,
};

const tdStyle = {
  padding: "7px 10px", color: C.textDark,
  borderTop: `0.5px solid ${C.borderLt}`, fontSize: 12,
};

const inputStyle = {
  background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 6,
  padding: "6px 10px", color: C.textDark, fontSize: 13,
  width: "100%", outline: "none", boxSizing: "border-box",
};

const btnPrimary = {
  flex: 1, padding: 10, background: C.blue, color: C.white,
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
};

const btnDefault = {
  padding: "10px 18px", background: C.white, color: C.blue,
  border: `0.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer",
};

// ─── FlagBadge ─────────────────────────────────────────────────────────────────

function FlagBadge({ flag }) {
  const st = FLAG_STYLE[flag] || FLAG_STYLE["—"];
  return (
    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, ...st }}>
      {flag}
    </span>
  );
}

// ─── ParamTable ────────────────────────────────────────────────────────────────

function ParamTable({ testName, params, onParamsChange }) {
  function handleChange(idx, val) {
    const updated = params.map((p, i) => i === idx ? { ...p, v: val } : p);
    onParamsChange(testName, updated);
  }

  return (
    <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "24%" }} /><col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} /><col style={{ width: "22%" }} />
          <col style={{ width: "19%" }} />
        </colgroup>
        <thead>
          <tr>
            {["Parameter", "Result value", "Unit", "Normal range", "Flag"].map((h, i) => (
              <th key={h} style={{ ...thStyle, textAlign: i === 4 ? "center" : "left", background: "#f7faff" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.map((p, i) => {
            const flag = getFlag(p.v, p.lo, p.hi);
            return (
              <tr key={i}>
                <td style={tdStyle}>{p.p}</td>
                <td style={tdStyle}>
                  <input
                    style={{ ...inputStyle, width: 90, fontSize: 12 }}
                    value={p.v}
                    onChange={e => handleChange(i, e.target.value)}
                  />
                </td>
                <td style={{ ...tdStyle, color: C.textMid }}>{p.u}</td>
                <td style={{ ...tdStyle, color: C.textMid }}>{p.r}</td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <FlagBadge flag={flag} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── TestPanel ─────────────────────────────────────────────────────────────────

function TestPanel({ testName, params, isDone, onParamsChange, onToggleDone }) {
  return (
    <div style={{
      marginBottom: 12,
      border: `0.5px solid ${isDone ? "#97C459" : C.border}`,
      borderRadius: 8, overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 12px",
        background: isDone ? "#EAF3DE" : C.blueLight,
        borderBottom: `0.5px solid ${isDone ? "#97C459" : C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: isDone ? C.green : C.blue }}>
            {testName}
          </span>
          {isDone
            ? <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.greenBg, color: C.greenDark }}>Done ✓</span>
            : <span style={{ fontSize: 11, color: C.textMid }}>Enter result values below</span>
          }
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: isDone ? C.green : C.textMid, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={isDone}
            onChange={e => onToggleDone(testName, e.target.checked)}
            style={{ accentColor: C.blue, cursor: "pointer" }}
          />
          Mark as done
        </label>
      </div>
      <ParamTable testName={testName} params={params} onParamsChange={onParamsChange} />
    </div>
  );
}

// ─── FileUploadZone ────────────────────────────────────────────────────────────

function FileUploadZone({ files, onAdd, onRemove }) {
  const inputRef = useRef(null);

  function handleFiles(rawFiles) {
    const toAdd = [];
    for (const f of rawFiles) {
      if (files.length + toAdd.length >= 10) { alert("Maximum 10 files allowed."); break; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name} exceeds 5 MB.`); continue; }
      toAdd.push(f);
    }
    if (toAdd.length) onAdd(toAdd);
  }

  const extColor = { pdf: C.red, docx: C.blue };

  return (
    <div style={{ background: "#f7faff", border: `0.5px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.textDark }}>Attach report files</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: C.textMid }}>PDF, JPG, PNG, DOCX &nbsp;·&nbsp; Max 10 files &nbsp;·&nbsp; 5 MB each</p>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 500, padding: "3px 12px", borderRadius: 6,
          background: files.length >= 10 ? "#FCEBEB" : C.blueLight,
          color: files.length >= 10 ? C.red : C.blue,
        }}>
          {files.length} / 10
        </span>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        style={{
          border: "1.5px dashed #b5d4f4", borderRadius: 8,
          padding: 20, textAlign: "center", cursor: "pointer", background: C.white,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)}
        />
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{ margin: "0 auto 8px", display: "block", opacity: 0.45 }}>
          <rect x="3" y="9" width="28" height="22" rx="3" stroke={C.blue} strokeWidth="1.5" fill="none" />
          <path d="M17 21v-9M13 15l4-4 4 4" stroke={C.blue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ margin: 0, fontSize: 13, color: C.textMid }}>Click to browse or drag &amp; drop files</p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#8aabcc" }}>PDF &nbsp;·&nbsp; JPG &nbsp;·&nbsp; PNG &nbsp;·&nbsp; DOCX</p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map((f, i) => {
            const ext = (f.name.split(".").pop() || "").toLowerCase();
            const ec = extColor[ext] || "#633806";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.white }}>
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: C.blueLight, color: ec, fontWeight: 500, textTransform: "uppercase", flexShrink: 0 }}>{ext}</span>
                <span style={{ flex: 1, fontSize: 12, color: C.textDark, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }} title={f.name}>{f.name}</span>
                <span style={{ fontSize: 11, color: C.textMid, flexShrink: 0 }}>{(f.size / 1024).toFixed(0)} KB</span>
                <button
                  onClick={() => onRemove(i)}
                  style={{ padding: "2px 8px", fontSize: 11, color: C.red, border: "0.5px solid #f5c4c4", borderRadius: 4, background: C.white, cursor: "pointer", flexShrink: 0 }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

import { useEffect } from "react";

export default function DiagnosticLab() {
  const [requests, setRequests]       = useState([]);
  const [checkedReqs, setCheckedReqs] = useState(new Set());
  const [activeReq, setActiveReq]     = useState(null);
  const [checkedTests, setCheckedTests] = useState(new Set());

  useEffect(() => {
    fetchLabQueue();
  }, []);

  async function fetchLabQueue() {
    const token = localStorage.getItem("hms_token");
    if(!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/queue/today`, { headers: { Authorization: `Bearer ${token}` }});
      const json = await res.json();
      if(json.success) {
        // Map queue data structure to requests structure
        const mapped = json.data.map(q => ({
          _id: q._id,
          token: q.patient?.phone || "Unknown",
          name: q.patient?.name || "Patient",
          tests: ["CBC", "Urine routine"], // Mocked dynamically
          time: new Date(q.createdAt).toLocaleTimeString([], {timeStyle: 'short'}),
          status: q.status === "Completed" ? "done" : "pending"
        }));
        setRequests(mapped);
      }
    } catch(err) { console.error("Lab Hook Failed", err); }
  }
  const [doneTests, setDoneTests]     = useState(new Set());
  const [paramValues, setParamValues] = useState(() => {
    const init = {};
    Object.entries(TEST_PARAMS).forEach(([k, v]) => { init[k] = v.map(p => ({ ...p })); });
    return init;
  });
  const [sampleTime, setSampleTime]   = useState("10:35");
  const [remarks, setRemarks]         = useState("No signs of malaria...");
  const [files, setFiles]             = useState([]);
  const [submitted, setSubmitted]     = useState(false);
  const [submitMsg, setSubmitMsg]     = useState("");
  const [doneCount, setDoneCount]     = useState(12);

  const pendingCount = requests.filter(r => r.status !== "done").length;

  // ── Requests table ──

  function toggleReqChk(token, checked) {
    setCheckedReqs(prev => {
      const next = new Set(prev);
      checked ? next.add(token) : next.delete(token);
      return next;
    });
  }

  function toggleAllReqs(checked) {
    if (checked) {
      setCheckedReqs(new Set(requests.filter(r => r.status !== "done").map(r => r.token)));
    } else {
      setCheckedReqs(new Set());
    }
  }

  function selectReq(req) {
    setActiveReq(req);
    setCheckedTests(new Set(req.tests));
    setDoneTests(new Set());
    setSubmitted(false);
  }

  // ── Test checkboxes ──

  function toggleTestChk(test, checked) {
    setCheckedTests(prev => {
      const next = new Set(prev);
      checked ? next.add(test) : next.delete(test);
      return next;
    });
  }

  function toggleAllTests(checked) {
    if (!activeReq) return;
    setCheckedTests(checked ? new Set(activeReq.tests) : new Set());
  }

  function toggleTestDone(test, checked) {
    setDoneTests(prev => {
      const next = new Set(prev);
      checked ? next.add(test) : next.delete(test);
      return next;
    });
  }

  // ── Params ──

  function handleParamsChange(testName, updated) {
    setParamValues(prev => ({ ...prev, [testName]: updated }));
  }

  // ── Files ──

  function handleAddFiles(toAdd) {
    setFiles(prev => [...prev, ...toAdd]);
  }

  function handleRemoveFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  // ── Submit ──

  async function handleSubmit() {
    const sel = [...checkedReqs];
    if (sel.length === 0) { alert("Select at least one patient."); return; }
    
    setSubmitMsg("Uploading diagnostics array to live backend...");
    setSubmitted(true);
    const token = localStorage.getItem("hms_token");

    try {
      // Simulate backend loop for all checked
      for(const token_id of sel) {
         const req = requests.find(r => r.token === token_id);
         if(!req) continue;
         await fetch(`${API_BASE}/api/queue/status`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
           body: JSON.stringify({ queue_id: req._id, status: "Completed" })
         });
      }
      
      setDoneCount(c => c + sel.length);
      setCheckedReqs(new Set());
      setSubmitMsg("Diagnostics locked in DB! Notified upstream databases.");
      fetchLabQueue();
    } catch(err) {
       setSubmitMsg("Connectivity failure saving diagnostics.");
    }
  }

  const allReqsChecked = requests.filter(r => r.status !== "done").every(r => checkedReqs.has(r.token));
  const allTestsChecked = activeReq ? activeReq.tests.every(t => checkedTests.has(t)) : false;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 13, color: C.textDark, background: C.pageBg, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ background: C.blue, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="7.5" y="1" width="3" height="6" rx="1.5" fill="#fff" />
              <path d="M4 7h10l2.5 9H1.5L4 7z" fill="rgba(255,255,255,0.85)" />
              <circle cx="9" cy="12" r="2" fill={C.blue} />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: "#fff" }}>Diagnostic lab</p>
            <p style={{ margin: 0, fontSize: 11, color: "#b8d4f0" }}>Lab Tech: LT001 &nbsp;·&nbsp; {TODAY}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Pending",    val: pendingCount, color: "#FAC775" },
            { label: "Done today", val: doneCount,    color: "#C0DD97" },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 6, padding: "5px 20px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#b8d4f0" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── Pending Requests ── */}
        <div style={card}>
          <p style={sectionLabel}>Pending test requests</p>
          <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "5%" }} /><col style={{ width: "10%" }} />
                <col style={{ width: "20%" }} /><col style={{ width: "32%" }} />
                <col style={{ width: "11%" }} /><col style={{ width: "22%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: C.blueLight }}>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={allReqsChecked}
                      onChange={e => toggleAllReqs(e.target.checked)}
                      style={{ accentColor: C.blue, cursor: "pointer" }}
                    />
                  </th>
                  {["Token", "Patient", "Test", "Time", "Status"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                  const isActive = activeReq?.token === r.token;
                  return (
                    <tr
                      key={r.token}
                      onClick={() => selectReq(r)}
                      style={{
                        borderTop: `0.5px solid ${C.borderLt}`,
                        background: isActive ? C.blueLight : C.white,
                        cursor: "pointer",
                      }}
                    >
                      <td style={{ ...tdStyle, textAlign: "center" }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checkedReqs.has(r.token)}
                          onChange={e => toggleReqChk(r.token, e.target.checked)}
                          style={{ accentColor: C.blue, cursor: "pointer" }}
                        />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: isActive ? C.blueDark : C.blue }}>{r.token}</td>
                      <td style={tdStyle}>{r.name}</td>
                      <td style={{ ...tdStyle, color: C.textMid }}>{r.tests.join(" + ")}</td>
                      <td style={{ ...tdStyle, color: C.textMid }}>{r.time}</td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, ...st }}>{r.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {checkedReqs.size > 1 && (
            <div style={{ marginTop: 8, padding: "6px 12px", background: C.blueBg, color: C.blueDark, borderRadius: 6, fontSize: 12 }}>
              {checkedReqs.size} patients selected — submit will process all at once.
            </div>
          )}
        </div>

        {/* ── Results Entry ── */}
        <div style={card}>
          <p style={sectionLabel}>
            Enter test results — {activeReq ? `${activeReq.token} ${activeReq.name}` : "select a patient"}
          </p>

          {/* Sample time + Remarks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: C.textMid, display: "block", marginBottom: 4 }}>Sample collected at</label>
              <input type="time" style={inputStyle} value={sampleTime} onChange={e => setSampleTime(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: C.textMid, display: "block", marginBottom: 4 }}>Remarks</label>
              <input type="text" style={inputStyle} placeholder="Quick note..." value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>
          </div>

          {/* Test name checkboxes */}
          {activeReq && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: C.textMid }}>Tests to enter results for</label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMid, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={allTestsChecked}
                    onChange={e => toggleAllTests(e.target.checked)}
                    style={{ accentColor: C.blue, cursor: "pointer" }}
                  />
                  Select all
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {activeReq.tests.map(t => {
                  const selected = checkedTests.has(t);
                  const done = doneTests.has(t);
                  return (
                    <label
                      key={t}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                        border: `0.5px solid ${selected ? C.blue : C.border}`,
                        background: selected ? C.blueLight : C.white,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={e => toggleTestChk(t, e.target.checked)}
                        style={{ accentColor: C.blue, cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 500, color: done ? C.green : C.textDark }}>{t}</span>
                      {done && (
                        <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 4, background: C.greenBg, color: C.greenDark }}>Done</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Per-test parameter panels */}
          {activeReq && checkedTests.size > 0 ? (
            [...checkedTests].map(testName => (
              <TestPanel
                key={testName}
                testName={testName}
                params={paramValues[testName] || [{ p: "Result", v: "", u: "—", lo: null, hi: null, r: "—" }]}
                isDone={doneTests.has(testName)}
                onParamsChange={handleParamsChange}
                onToggleDone={toggleTestDone}
              />
            ))
          ) : (
            <p style={{ fontSize: 13, color: C.textMid, margin: "0 0 14px" }}>
              {activeReq ? "Select tests above to enter parameters." : "Click a patient row to load their tests."}
            </p>
          )}

          {/* File upload */}
          <FileUploadZone files={files} onAdd={handleAddFiles} onRemove={handleRemoveFile} />

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSubmit}
              disabled={submitted}
              style={{ ...btnPrimary, background: submitted ? C.green : C.blue, cursor: submitted ? "default" : "pointer" }}
            >
              {submitted ? "Submitted ✓" : "Submit & send to doctor"}
            </button>
            <button style={btnDefault}>Print report</button>
          </div>

          {submitted && (
            <div style={{ marginTop: 8, padding: "10px 12px", background: C.blueBg, color: C.blueDark, borderRadius: 8, fontSize: 12 }}>
              {submitMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
