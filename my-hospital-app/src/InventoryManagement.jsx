import { useState } from "react";

// ─── Color Tokens ──────────────────────────────────────────────────────────────
const C = {
  blue:       "#185FA5",
  blueDark:   "#0C447C",
  blueBg:     "#dbeafe",
  blueLight:  "#e8f1fb",
  pageBg:     "#f0f4f8",
  sidebarBg:  "#1a6bbf",
  white:      "#ffffff",
  border:     "#c5d5e8",
  borderLt:   "#dce8f5",
  textDark:   "#0d2d4e",
  textMid:    "#5a80a0",
  red:        "#E53935",
  redBg:      "#FCEBEB",
  green:      "#27A243",
  greenBg:    "#DCFCE7",
  amber:      "#D97706",
  amberBg:    "#FEF3C7",
};

// ─── Live Dynamic Data Mode ───────────────────────────────────────────────────────────────
const API_BASE = "https://hospital-management-system-67as.onrender.com";

const INIT_INWARDS = [];
const INIT_OUTWARDS = [];

const ITEM_NAMES = ["Paracetamol 500mg", "Amoxicillin 500mg", "Iron + Folic acid", "Cetirizine 10mg", "Metformin 500mg", "Omeprazole 20mg", "Azithromycin 500mg", "ORS Sachet", "Pantoprazole 40mg", "Dolo 650mg"];
const SUPPLIERS  = ["MedPlus Pharma", "Apollo Distributors", "Sun Pharma"];
const UNITS      = ["Tabs", "Caps", "Bottles", "Sachets"];

const TODAY = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/");

// ─── Helpers ───────────────────────────────────────────────────────────────────
function stockStatus(qty) {
  if (qty === 0)  return { label: "Out Of Stock", color: C.red,   bg: C.redBg   };
  if (qty <= 15)  return { label: "Low Stock",    color: C.amber, bg: C.amberBg };
  return              { label: "In Stock",     color: C.green, bg: C.greenBg };
}

function computeStock(inwards, outwards) {
  const stock = {};
  inwards.forEach(inv => inv.items.forEach(it => { stock[it.name] = (stock[it.name] || 0) + it.accepted; }));
  outwards.forEach(out => out.items.forEach(it => { stock[it.name] = (stock[it.name] || 0) - it.quantity; }));
  ITEM_NAMES.forEach(n => { if (stock[n] === undefined) stock[n] = 0; });
  return stock;
}

function nextId(list, prefix) {
  const nums = list.map(x => parseInt(x.id.replace(prefix + "-", "")) || 0);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(4, "0");
  return `${prefix}-${next}`;
}

// ─── Shared Styles ─────────────────────────────────────────────────────────────
const inputS = { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.textDark, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" };
const labelS = { fontSize: 12, color: C.textMid, display: "block", marginBottom: 4 };
const thS    = { padding: "9px 12px", textAlign: "left", color: C.blue, fontWeight: 600, fontSize: 12, background: C.blueLight, borderBottom: `0.5px solid ${C.border}` };
const tdS    = { padding: "10px 12px", color: C.textDark, borderBottom: `0.5px solid ${C.borderLt}`, fontSize: 13 };
const cardS  = { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 };

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, onBack }) {
  const items = [
    { key: "inward",  label: "Inward",      icon: "↙" },
    { key: "outward", label: "Outward",     icon: "↗" },
    { key: "stock",   label: "Store Stock", icon: "▦"  },
  ];
  return (
    <div style={{ width: 170, background: C.sidebarBg, minHeight: "100vh", padding: "16px 0", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 16px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: "0.5px solid rgba(255,255,255,0.2)" }}>
        <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: C.blue, flexShrink: 0 }}>SB</div>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>S B PATIL</p>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 1.2 }}>GROUP</p>
        </div>
      </div>
      <div style={{ padding: "12px 8px 0", flex: 1 }}>
        {items.map(it => (
          <div key={it.key} onClick={() => onNav(it.key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, marginBottom: 4, cursor: "pointer", background: active === it.key ? "rgba(255,255,255,0.2)" : "transparent", color: active === it.key ? "#fff" : "rgba(255,255,255,0.75)", fontWeight: active === it.key ? 600 : 400, fontSize: 14, transition: "background .15s" }}>
            <span style={{ fontSize: 16 }}>{it.icon}</span> {it.label}
          </div>
        ))}
      </div>
      {onBack && (
        <div style={{ padding: "12px 8px" }}>
          <div onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", background: "rgba(255, 255, 255, 0.15)", color: "#fff", fontWeight: 600, fontSize: 13, border: "0.5px solid rgba(255,255,255,0.2)" }}>
            ← Back to Pharmacy
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ title, breadcrumb, onBack }) {
  return (
    <div style={{ background: C.white, borderBottom: `0.5px solid ${C.border}`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 12 }}>
      {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: C.blue, fontSize: 18, cursor: "pointer", padding: 0, lineHeight: 1 }}>←</button>}
      <span style={{ fontSize: 13, color: C.textMid }}>{breadcrumb}</span>
    </div>
  );
}

// ─── Inward List ──────────────────────────────────────────────────────────────
function InwardList({ inwards, onAdd, onView }) {
  const [search, setSearch] = useState("");
  const filtered = inwards.filter(i => i.id.toLowerCase().includes(search.toLowerCase()) || i.supplier.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textDark }}>Inwards</h2>
        <button onClick={onAdd} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 6, padding: "8px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>ADD</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.textMid, fontSize: 13, cursor: "pointer" }}>
          <span>▼</span> Filter
        </button>
        <input style={{ ...inputS, width: 240 }} placeholder="🔍  Search" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={cardS}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thS}>NO.</th>
              <th style={thS}>Inward</th>
              <th style={thS}>Supplier Name</th>
              <th style={thS}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv, i) => (
              <tr key={inv.id} style={{ cursor: "pointer" }} onClick={() => onView(inv)}>
                <td style={tdS}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ ...tdS, color: C.red, fontWeight: 600 }}>{inv.id}</td>
                <td style={{ ...tdS, fontWeight: 500 }}>{inv.supplier}</td>
                <td style={{ ...tdS, fontWeight: 500 }}>{inv.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Inward Form ──────────────────────────────────────────────────────────────
function InwardForm({ existing, nextInwardId, onSave, onCancel }) {
  const isEdit = !!existing;
  const [supplier,   setSupplier]   = useState(existing?.supplier   || "Supplier 1");
  const [date,       setDate]       = useState(existing?.date       || TODAY);
  const [dcNo,       setDcNo]       = useState(existing?.dcNo       || "");
  const [lrNo,       setLrNo]       = useState(existing?.lrNo       || "");
  const [vehicleNo,  setVehicleNo]  = useState(existing?.vehicleNo  || "");
  const [items, setItems] = useState(
    existing?.items || [{ name: ITEM_NAMES[0], unit: "Nos", asPerChallan: 0, actualReceipt: 0, short: 0, excess: 0, reject: 0, accepted: 0, remarks: "" }]
  );

  function setItem(idx, field, val) {
    setItems(prev => {
      const next = prev.map((it, i) => i === idx ? { ...it, [field]: val } : it);
      if (["actualReceipt", "short", "excess", "reject"].includes(field)) {
        const it = next[idx];
        next[idx] = { ...it, accepted: (Number(it.actualReceipt) || 0) - (Number(it.reject) || 0) };
      }
      return next;
    });
  }

  function addItemRow() {
    setItems(prev => [...prev, { name: ITEM_NAMES[0], unit: "Nos", asPerChallan: 0, actualReceipt: 0, short: 0, excess: 0, reject: 0, accepted: 0, remarks: "" }]);
  }

  function removeItem(idx) { setItems(prev => prev.filter((_, i) => i !== idx)); }

  function handleSave() {
    if (!dcNo || !vehicleNo) { alert("Please fill DC No and Vehicle No."); return; }
    onSave({ id: existing?.id || nextInwardId, supplier, date, dcNo, lrNo, vehicleNo, items });
  }

  const fieldBox = { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 13, color: C.textDark, minWidth: 100 };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Supplier */}
        <div style={{ ...cardS, flex: 1, minWidth: 260 }}>
          <label style={labelS}>Supplier</label>
          <select style={inputS} value={supplier} onChange={e => setSupplier(e.target.value)}>
            {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Meta fields */}
        <div style={{ ...cardS, minWidth: 260 }}>
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Inward No.", existing?.id || nextInwardId, null],
                ["Date",       date,      setDate      ],
                ["D.C No",     dcNo,      setDcNo      ],
                ["L.R No",     lrNo,      setLrNo      ],
                ["Vehicle No.",vehicleNo, setVehicleNo ],
              ].map(([lbl, val, setter]) => (
                <tr key={lbl}>
                  <td style={{ padding: "6px 12px 6px 0", fontSize: 13, color: C.textMid, whiteSpace: "nowrap" }}>{lbl}</td>
                  <td style={{ padding: "4px 0" }}>
                    {setter
                      ? <input style={{ ...fieldBox, width: 140 }} value={val} onChange={e => setter(e.target.value)} />
                      : <span style={{ ...fieldBox, display: "inline-block", background: C.blueLight, color: C.blue, fontWeight: 600 }}>{val}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Items table */}
      <div style={cardS}>
        <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "18%" }} /><col style={{ width: "7%" }} />
              <col style={{ width: "9%" }} /><col style={{ width: "10%" }} />
              <col style={{ width: "7%" }} /><col style={{ width: "7%" }} />
              <col style={{ width: "7%" }} /><col style={{ width: "9%" }} />
              <col style={{ width: "12%" }} /><col style={{ width: "4%" }} />
            </colgroup>
            <thead>
              <tr style={{ background: C.blueLight }}>
                <th style={thS}>Item</th>
                <th style={thS}>Unit</th>
                <th style={{ ...thS, textAlign: "center" }}>As Per Challan</th>
                <th style={{ ...thS, textAlign: "center" }}>Actual Receipt</th>
                <th style={{ ...thS, textAlign: "center" }}>Short</th>
                <th style={{ ...thS, textAlign: "center" }}>Excess</th>
                <th style={{ ...thS, textAlign: "center" }}>Reject</th>
                <th style={{ ...thS, textAlign: "center" }}>Accepted</th>
                <th style={thS}>Remarks</th>
                <th style={thS}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderTop: `0.5px solid ${C.borderLt}`, background: C.white }}>
                  <td style={{ padding: "8px 10px" }}>
                    <select style={{ ...inputS, fontSize: 12 }} value={it.name} onChange={e => setItem(idx, "name", e.target.value)}>
                      {ITEM_NAMES.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "8px 6px", color: C.textMid, fontSize: 12 }}>
                    <select style={{ ...inputS, fontSize: 12, width: 60 }} value={it.unit} onChange={e => setItem(idx, "unit", e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  {["asPerChallan","actualReceipt","short","excess","reject"].map(f => (
                    <td key={f} style={{ padding: "8px 6px", textAlign: "center" }}>
                      <input type="number" min="0" style={{ ...inputS, width: 60, textAlign: "center", fontSize: 12 }} value={it[f]} onChange={e => setItem(idx, f, e.target.value)} />
                    </td>
                  ))}
                  <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: 600, color: C.blue, fontSize: 13 }}>{it.accepted}</td>
                  <td style={{ padding: "8px 6px" }}>
                    <input style={{ ...inputS, fontSize: 12 }} placeholder="Remarks" value={it.remarks} onChange={e => setItem(idx, "remarks", e.target.value)} />
                  </td>
                  <td style={{ padding: "8px 6px", textAlign: "center" }}>
                    <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: C.red, fontSize: 16, cursor: "pointer", padding: 0 }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={addItemRow} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: "50%", width: 36, height: 36, fontSize: 20, color: C.blue, cursor: "pointer", lineHeight: 1 }}>+</button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onCancel} style={{ padding: "9px 24px", border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.textMid, fontSize: 13, cursor: "pointer" }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: "9px 28px", background: C.red, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>SAVE</button>
      </div>
    </div>
  );
}

// ─── Outward List ─────────────────────────────────────────────────────────────
function OutwardList({ outwards, onAdd, onView }) {
  const [search, setSearch] = useState("");
  const filtered = outwards.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.receiver.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textDark }}>Outwards</h2>
        <button onClick={onAdd} style={{ background: C.red, color: "#fff", border: "none", borderRadius: 6, padding: "8px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>ADD</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.textMid, fontSize: 13, cursor: "pointer" }}>
          <span>▼</span> Filter
        </button>
        <input style={{ ...inputS, width: 240 }} placeholder="🔍  Search" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={cardS}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thS}>NO.</th>
              <th style={thS}>Outward</th>
              <th style={thS}>Receiver</th>
              <th style={thS}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((out, i) => (
              <tr key={out.id} style={{ cursor: "pointer" }} onClick={() => onView(out)}>
                <td style={tdS}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ ...tdS, color: C.red, fontWeight: 600 }}>{out.id}</td>
                <td style={{ ...tdS, fontWeight: 500 }}>{out.receiver}</td>
                <td style={{ ...tdS, fontWeight: 500 }}>{out.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Outward Form ─────────────────────────────────────────────────────────────
function OutwardForm({ existing, nextOutwardId, onSave, onCancel }) {
  const [receiver,  setReceiver]  = useState(existing?.receiver  || "");
  const [date,      setDate]      = useState(existing?.date      || TODAY);
  const [vehicleNo, setVehicleNo] = useState(existing?.vehicleNo || "");
  const [woNo,      setWoNo]      = useState(existing?.woNo      || "");
  const [items, setItems] = useState(
    existing?.items || [{ name: ITEM_NAMES[0], unit: "Nos", quantity: 0, remarks: "" }]
  );

  function setItem(idx, field, val) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  }
  function addRow() { setItems(prev => [...prev, { name: ITEM_NAMES[0], unit: "Nos", quantity: 0, remarks: "" }]); }
  function removeItem(idx) { setItems(prev => prev.filter((_, i) => i !== idx)); }

  function handleSave() {
    if (!receiver || !vehicleNo) { alert("Please fill Receiver and Vehicle No."); return; }
    onSave({ id: existing?.id || nextOutwardId, receiver, date, vehicleNo, woNo, items });
  }

  const fieldBox = { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", fontSize: 13, color: C.textDark, minWidth: 100 };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ ...cardS, flex: 1, minWidth: 260 }}>
          <label style={labelS}>Receiver / Site</label>
          <input style={inputS} placeholder="Site or receiver name" value={receiver} onChange={e => setReceiver(e.target.value)} />
        </div>
        <div style={{ ...cardS, minWidth: 260 }}>
          <table style={{ borderCollapse: "collapse" }}>
            <tbody>
              {[
                ["Outward No.", existing?.id || nextOutwardId, null],
                ["Date",        date,      setDate      ],
                ["W.O No",      woNo,      setWoNo      ],
                ["Vehicle No.", vehicleNo, setVehicleNo ],
              ].map(([lbl, val, setter]) => (
                <tr key={lbl}>
                  <td style={{ padding: "6px 12px 6px 0", fontSize: 13, color: C.textMid, whiteSpace: "nowrap" }}>{lbl}</td>
                  <td style={{ padding: "4px 0" }}>
                    {setter
                      ? <input style={{ ...fieldBox, width: 140 }} value={val} onChange={e => setter(e.target.value)} />
                      : <span style={{ ...fieldBox, display: "inline-block", background: C.blueLight, color: C.blue, fontWeight: 600 }}>{val}</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={cardS}>
        <div style={{ border: `0.5px solid ${C.border}`, borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup><col style={{ width: "35%" }} /><col style={{ width: "10%" }} /><col style={{ width: "15%" }} /><col style={{ width: "30%" }} /><col style={{ width: "10%" }} /></colgroup>
            <thead>
              <tr style={{ background: C.blueLight }}>
                <th style={thS}>Item</th>
                <th style={thS}>Unit</th>
                <th style={{ ...thS, textAlign: "center" }}>Quantity</th>
                <th style={thS}>Remarks</th>
                <th style={thS}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} style={{ borderTop: `0.5px solid ${C.borderLt}` }}>
                  <td style={{ padding: "8px 10px" }}>
                    <select style={{ ...inputS, fontSize: 12 }} value={it.name} onChange={e => setItem(idx, "name", e.target.value)}>
                      {ITEM_NAMES.map(n => <option key={n}>{n}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "8px 6px" }}>
                    <select style={{ ...inputS, fontSize: 12, width: 65 }} value={it.unit} onChange={e => setItem(idx, "unit", e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "8px 6px", textAlign: "center" }}>
                    <input type="number" min="0" style={{ ...inputS, width: 80, textAlign: "center", fontSize: 12 }} value={it.quantity} onChange={e => setItem(idx, "quantity", e.target.value)} />
                  </td>
                  <td style={{ padding: "8px 6px" }}>
                    <input style={{ ...inputS, fontSize: 12 }} placeholder="Remarks" value={it.remarks} onChange={e => setItem(idx, "remarks", e.target.value)} />
                  </td>
                  <td style={{ padding: "8px 6px", textAlign: "center" }}>
                    <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: C.red, fontSize: 16, cursor: "pointer" }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={addRow} style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: "50%", width: 36, height: 36, fontSize: 20, color: C.blue, cursor: "pointer", lineHeight: 1 }}>+</button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button onClick={onCancel} style={{ padding: "9px 24px", border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.white, color: C.textMid, fontSize: 13, cursor: "pointer" }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: "9px 28px", background: C.red, color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>SAVE</button>
      </div>
    </div>
  );
}

// ─── Store Stock ──────────────────────────────────────────────────────────────
function StoreStock({ medicines }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
  const stock = {};
  medicines.forEach(m => stock[m.name] = m.stock);
  
  const items = Object.entries(stock)
    .map(([name, qty]) => ({ name, qty, ...stockStatus(qty) }))
    .filter(it => {
      const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "All" || it.label === filter;
      return matchSearch && matchFilter;
    });

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.textDark }}>Item Listing</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ ...inputS, width: "auto", fontSize: 12 }} value={filter} onChange={e => setFilter(e.target.value)}>
            {["All", "In Stock", "Low Stock", "Out Of Stock"].map(f => <option key={f}>{f}</option>)}
          </select>
          <input style={{ ...inputS, width: 220 }} placeholder="🔍  Search" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Items",   val: Object.keys(stock).length,                               bg: C.blueLight, col: C.blue  },
          { label: "Low Stock",     val: Object.values(stock).filter(q => q > 0 && q <= 15).length, bg: C.amberBg,  col: C.amber },
          { label: "Out of Stock",  val: Object.values(stock).filter(q => q === 0).length,          bg: C.redBg,    col: C.red   },
        ].map(({ label, val, bg, col }) => (
          <div key={label} style={{ background: bg, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
            <p style={{ margin: 0, fontSize: 11, color: col, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: col }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={cardS}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thS}>NO.</th>
              <th style={thS}>ITEM</th>
              <th style={{ ...thS, textAlign: "center" }}>Quantity</th>
              <th style={{ ...thS, textAlign: "center" }}>Availability</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.name} style={{ borderTop: `0.5px solid ${C.borderLt}` }}>
                <td style={tdS}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ ...tdS, color: C.red, fontWeight: 500 }}>{it.name}</td>
                <td style={{ ...tdS, textAlign: "center", fontWeight: 600 }}>{it.qty}</td>
                <td style={{ ...tdS, textAlign: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 12px", borderRadius: 6, background: it.bg, color: it.color }}>{it.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
import { useEffect } from "react";

export default function InventoryManagement({ onBack }) {
  const [tab,      setTab]      = useState("inward");
  const [inwards,  setInwards]  = useState(INIT_INWARDS);
  const [outwards, setOutwards] = useState(INIT_OUTWARDS);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
     fetchInventory();
  }, []);

  async function fetchInventory() {
     const token = localStorage.getItem("hms_token");
     if(!token) return;
     try {
       const res = await fetch(`${API_BASE}/api/inventory`, { headers: { Authorization: `Bearer ${token}` }});
       const json = await res.json();
       if(json.success) {
         setMedicines(json.data);
       }
     } catch(e) { console.error("Inventory error", e); }
  }

  // inward view state
  const [inwardView, setInwardView]   = useState("list"); // list | add | detail
  const [selectedInward, setSelInward] = useState(null);

  // outward view state
  const [outwardView, setOutwardView]   = useState("list");
  const [selectedOutward, setSelOutward] = useState(null);

  async function saveInward(data) {
    setInwards(prev => {
      const exists = prev.find(i => i.id === data.id);
      return exists ? prev.map(i => i.id === data.id ? data : i) : [...prev, data];
    });
    setInwardView("list");
    
    const token = localStorage.getItem("hms_token");
    for(const it of data.items) {
       const m = medicines.find(med => med.name === it.name);
       if(m && it.accepted > 0) {
          try {
            await fetch(`${API_BASE}/api/inventory/inward`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ medicine_id: m._id, quantity: parseInt(it.accepted) })
            });
          } catch(e) {}
       }
    }
    fetchInventory();
  }

  function saveOutward(data) {
    setOutwards(prev => {
      const exists = prev.find(o => o.id === data.id);
      return exists ? prev.map(o => o.id === data.id ? data : o) : [...prev, data];
    });
    setOutwardView("list");
  }

  function getBreadcrumb() {
    if (tab === "inward")  return inwardView  === "add" ? "Inward › Add Inward"  : inwardView  === "detail" ? `Inward › ${selectedInward?.id}`  : "Inward";
    if (tab === "outward") return outwardView === "add" ? "Outward › Add Outward": outwardView === "detail" ? `Outward › ${selectedOutward?.id}` : "Outward";
    return "Store Stock";
  }

  function getBackFn() {
    if (tab === "inward"  && inwardView  !== "list") return () => setInwardView("list");
    if (tab === "outward" && outwardView !== "list") return () => setOutwardView("list");
    return null;
  }

  function renderMain() {
    if (tab === "inward") {
      if (inwardView === "list")   return <InwardList inwards={inwards} onAdd={() => { setSelInward(null); setInwardView("add"); }} onView={inv => { setSelInward(inv); setInwardView("detail"); }} />;
      if (inwardView === "add")    return <InwardForm nextInwardId={nextId(inwards, "IN")} onSave={saveInward} onCancel={() => setInwardView("list")} />;
      if (inwardView === "detail") return <InwardForm existing={selectedInward} nextInwardId={selectedInward?.id} onSave={saveInward} onCancel={() => setInwardView("list")} />;
    }
    if (tab === "outward") {
      if (outwardView === "list")   return <OutwardList outwards={outwards} onAdd={() => { setSelOutward(null); setOutwardView("add"); }} onView={out => { setSelOutward(out); setOutwardView("detail"); }} />;
      if (outwardView === "add")    return <OutwardForm nextOutwardId={nextId(outwards, "OUT")} onSave={saveOutward} onCancel={() => setOutwardView("list")} />;
      if (outwardView === "detail") return <OutwardForm existing={selectedOutward} nextOutwardId={selectedOutward?.id} onSave={saveOutward} onCancel={() => setOutwardView("list")} />;
    }
    if (tab === "stock") return <StoreStock medicines={medicines} />;
  }

  return (
    <div style={{ display: "flex", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 13, color: C.textDark, minHeight: "100vh" }}>
      <Sidebar active={tab} onNav={key => { setTab(key); setInwardView("list"); setOutwardView("list"); }} onBack={onBack} />
      <div style={{ flex: 1, background: C.pageBg, display: "flex", flexDirection: "column" }}>
        <TopBar breadcrumb={getBreadcrumb()} onBack={getBackFn()} />
        <div style={{ flex: 1, overflowY: "auto" }}>
          {renderMain()}
        </div>
      </div>
    </div>
  );
}
