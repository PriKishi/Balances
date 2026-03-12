import { useState, useRef } from "react";
import * as XLSX from "xlsx";

// ─── Palette & Styles ────────────────────────────────────────────────────────
const C = {
  bg: "#0A0E1A", surface: "#111827", surfaceUp: "#1A2234", border: "#1E2D45",
  accent: "#00C2FF", accentDim: "#0A3D52", green: "#00E5A0", greenDim: "#003D29",
  red: "#FF4D6A", redDim: "#3D0014", amber: "#FFB547", amberDim: "#3D2800",
  muted: "#4A6080", text: "#E8F0FE", textDim: "#7A90B0",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Space Grotesk', sans-serif; }
  .app { min-height: 100vh; }
  .header { background: linear-gradient(135deg,#0D1628,#0A1220); border-bottom:1px solid ${C.border}; padding:20px 32px; display:flex; align-items:center; gap:16px; }
  .logo { width:36px; height:36px; background:linear-gradient(135deg,${C.accent},#0066FF); border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; color:#fff; }
  .header-title { font-size:18px; font-weight:600; letter-spacing:-0.3px; }
  .header-sub { font-size:12px; color:${C.textDim}; margin-top:1px; font-family:'JetBrains Mono',monospace; }
  .header-badge { margin-left:auto; background:${C.accentDim}; color:${C.accent}; border:1px solid ${C.accent}33; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:500; font-family:'JetBrains Mono',monospace; }
  .main { padding:32px; max-width:1400px; margin:0 auto; }
  .upload-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:28px; }
  .upload-card { background:${C.surface}; border:1.5px dashed ${C.border}; border-radius:16px; padding:28px; transition:all 0.2s; cursor:pointer; position:relative; overflow:hidden; }
  .upload-card:hover { border-color:${C.accent}66; background:${C.surfaceUp}; }
  .upload-card.has-file { border-style:solid; border-color:${C.green}66; background:${C.greenDim}22; }
  .upload-card.dragging { border-color:${C.accent}; background:${C.accentDim}; }
  .upload-icon { font-size:32px; margin-bottom:12px; }
  .upload-label { font-size:13px; font-weight:600; color:${C.textDim}; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; }
  .upload-title { font-size:17px; font-weight:600; margin-bottom:6px; }
  .upload-hint { font-size:12px; color:${C.textDim}; }
  .upload-filename { margin-top:12px; padding:8px 12px; background:${C.greenDim}; border:1px solid ${C.green}44; border-radius:8px; font-size:12px; color:${C.green}; font-family:'JetBrains Mono',monospace; }
  .file-input { display:none; }
  .run-btn { width:100%; padding:16px; background:linear-gradient(135deg,${C.accent},#0066FF); border:none; border-radius:12px; color:#fff; font-size:16px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:'Space Grotesk',sans-serif; display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:28px; }
  .run-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px ${C.accent}44; }
  .run-btn:disabled { opacity:0.4; cursor:not-allowed; transform:none; box-shadow:none; }
  .status-bar { background:${C.surfaceUp}; border:1px solid ${C.border}; border-radius:10px; padding:12px 16px; margin-bottom:20px; font-size:13px; color:${C.textDim}; font-family:'JetBrains Mono',monospace; display:flex; align-items:center; gap:8px; }
  .status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .status-dot.processing { background:${C.amber}; animation:pulse 1s infinite; }
  .status-dot.done { background:${C.green}; }
  .status-dot.idle { background:${C.muted}; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .progress-bar { height:3px; background:${C.border}; border-radius:2px; margin-top:8px; overflow:hidden; width:120px; }
  .progress-fill { height:100%; background:linear-gradient(90deg,${C.accent},${C.green}); border-radius:2px; transition:width 0.4s; }
  .summary-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .summary-card { background:${C.surface}; border:1px solid ${C.border}; border-radius:12px; padding:20px; position:relative; overflow:hidden; }
  .summary-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; }
  .summary-card.total::after { background:${C.accent}; }
  .summary-card.matched::after { background:${C.green}; }
  .summary-card.missing::after { background:${C.red}; }
  .summary-card.extra::after { background:${C.amber}; }
  .sc-label { font-size:11px; color:${C.textDim}; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .sc-value { font-size:32px; font-weight:700; line-height:1; margin-bottom:4px; font-family:'JetBrains Mono',monospace; }
  .sc-sub { font-size:12px; color:${C.textDim}; }
  .sc-value.total { color:${C.accent}; }
  .sc-value.matched { color:${C.green}; }
  .sc-value.missing { color:${C.red}; }
  .sc-value.extra { color:${C.amber}; }
  .table-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .table-title { font-size:16px; font-weight:600; }
  .filter-tabs { display:flex; gap:6px; }
  .filter-tab { padding:6px 14px; border-radius:20px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.15s; border:1px solid transparent; font-family:'Space Grotesk',sans-serif; background:transparent; }
  .filter-tab.all { color:${C.textDim}; border-color:${C.border}; }
  .filter-tab.all.active { background:${C.accentDim}; color:${C.accent}; border-color:${C.accent}44; }
  .filter-tab.matched { color:${C.green}; border-color:${C.green}44; }
  .filter-tab.matched.active { background:${C.greenDim}; }
  .filter-tab.missing { color:${C.red}; border-color:${C.red}44; }
  .filter-tab.missing.active { background:${C.redDim}; }
  .filter-tab.extra { color:${C.amber}; border-color:${C.amber}44; }
  .filter-tab.extra.active { background:${C.amberDim}; }
  .export-btn { padding:8px 18px; border-radius:8px; background:transparent; border:1px solid ${C.border}; color:${C.textDim}; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.15s; font-family:'Space Grotesk',sans-serif; display:flex; align-items:center; gap:6px; }
  .export-btn:hover { border-color:${C.accent}66; color:${C.accent}; background:${C.accentDim}; }
  .table-wrap { background:${C.surface}; border:1px solid ${C.border}; border-radius:16px; overflow:hidden; }
  .table-scroll { overflow-x:auto; max-height:520px; overflow-y:auto; }
  .results-table { width:100%; border-collapse:collapse; font-size:13px; }
  .results-table th { text-align:left; padding:10px 14px; color:${C.textDim}; font-size:11px; font-weight:500; text-transform:uppercase; letter-spacing:0.8px; border-bottom:1px solid ${C.border}; position:sticky; top:0; background:${C.surface}; }
  .results-table td { padding:11px 14px; border-bottom:1px solid ${C.border}22; vertical-align:middle; }
  .results-table tr:hover td { background:${C.surfaceUp}33; }
  .status-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
  .pill-matched { background:${C.greenDim}; color:${C.green}; border:1px solid ${C.green}44; }
  .pill-missing { background:${C.redDim}; color:${C.red}; border:1px solid ${C.red}44; }
  .pill-extra { background:${C.amberDim}; color:${C.amber}; border:1px solid ${C.amber}44; }
  .pill-fuzzy { background:#2D1A4A; color:#CC88FF; border:1px solid #CC88FF44; }
  .amount { font-family:'JetBrains Mono',monospace; font-size:13px; }
  .amount.neg { color:${C.red}; }
  .amount.pos { color:${C.green}; }
  .empty-state { text-align:center; padding:60px; color:${C.textDim}; }
  .empty-icon { font-size:48px; margin-bottom:16px; }
  .empty-title { font-size:18px; font-weight:600; color:${C.text}; margin-bottom:8px; }
  .empty-text { font-size:14px; }
  .desc-main { font-weight:500; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return new Date(+m[3], +m[2]-1, +m[1]);
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (m) return new Date(+m[3], +m[2]-1, +m[1]);
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2]-1, +m[3]);
  const d = new Date(s); return isNaN(d) ? null : d;
}

function fmtAmt(n, cur) {
  if (n == null) return "—";
  const abs = Math.abs(n).toLocaleString("de-DE", { minimumFractionDigits:2, maximumFractionDigits:2 });
  return (n < 0 ? "-" : "+") + abs + (cur ? " " + cur : "");
}

function parseAmount(str) {
  if (str == null) return null;
  if (typeof str === "number") return str;
  const n = parseFloat(String(str).replace(/\s/g,"").replace(",","."));
  return isNaN(n) ? null : n;
}

function dateDiff(a, b) {
  if (!a || !b) return 999;
  return Math.abs((a - b) / 86400000);
}

function strSim(a, b) {
  if (!a || !b) return 0;
  const wa = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wb = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  let common = 0; wa.forEach(w => { if (wb.has(w)) common++; });
  return common / Math.max(wa.size, wb.size, 1);
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ─── Parse PDF via secure API route ──────────────────────────────────────────
async function parsePDF(file, source) {
  const base64 = await fileToBase64(file);
  const prompt = source === "bank"
    ? `Extract ALL transactions from this bank statement PDF. Return ONLY a JSON array, no markdown. Each item: {"transaction_date":"DD/MM/YYYY","value_date":"DD/MM/YYYY","description":"...","amount":number,"currency":"...","source":"bank"}. Negative = outflow.`
    : `Extract ALL transactions from this Embat export PDF. Return ONLY a JSON array, no markdown. Each item: {"transaction_date":"DD/MM/YYYY","value_date":"DD/MM/YYYY","description":"...","amount":number,"currency":"...","source":"embat"}. Negative = outflow.`;

  const res = await fetch("/api/parse-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, prompt }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const clean = data.text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Parse Excel ──────────────────────────────────────────────────────────────
async function parseExcel(file, source) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header:1, defval:null });
        let headerIdx = -1, headers = [];
        for (let i = 0; i < Math.min(raw.length, 30); i++) {
          const row = raw[i].map(c => String(c || "").toLowerCase());
          if (row.some(c => c.includes("fecha") || c.includes("date") || c.includes("f. contable"))) {
            headerIdx = i; headers = raw[i].map(c => String(c || "").toLowerCase().trim()); break;
          }
        }
        if (headerIdx === -1) { reject(new Error("No se encontró fila de cabecera")); return; }
        const idx = (kws) => { for (const k of kws) { const i = headers.findIndex(h => h.includes(k)); if (i !== -1) return i; } return -1; };
        const dateIdx = idx(["transaction date","fecha contable","f. contable","transaction_date"]);
        const valIdx  = idx(["value date","f. valor","value_date"]);
        const descIdx = idx(["description","concepto","observaciones"]);
        const amtIdx  = idx(["accounting amount","importe","amount"]);
        const curIdx  = idx(["currency","divisa","moneda"]);
        const rows = [];
        for (let i = headerIdx + 1; i < raw.length; i++) {
          const r = raw[i];
          if (!r || r.every(c => c == null)) continue;
          const amt = parseAmount(r[amtIdx]);
          if (amt == null) continue;
          let dateStr = "";
          const dateRaw = r[dateIdx];
          if (typeof dateRaw === "number") {
            const d = XLSX.SSF.parse_date_code(dateRaw);
            dateStr = `${String(d.d).padStart(2,"0")}/${String(d.m).padStart(2,"0")}/${d.y}`;
          } else dateStr = String(dateRaw || "");
          rows.push({ transaction_date: dateStr, value_date: String(r[valIdx] || ""), description: String(r[descIdx] || ""), amount: amt, currency: curIdx !== -1 ? String(r[curIdx] || "") : "", source });
        }
        resolve(rows);
      } catch(err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ─── Matching Engine ──────────────────────────────────────────────────────────
function matchTransactions(bankTxs, embatTxs) {
  const results = [], usedEmbat = new Set();
  for (const bank of bankTxs) {
    const bankDate = parseDate(bank.transaction_date);
    let best = null, bestScore = -1;
    embatTxs.forEach((e, i) => {
      if (usedEmbat.has(i)) return;
      const dd = dateDiff(bankDate, parseDate(e.transaction_date));
      const amtMatch = Math.abs((e.amount||0) - (bank.amount||0)) < 0.02;
      let score = 0;
      if (amtMatch) score += 60;
      if (dd === 0) score += 30; else if (dd <= 1) score += 20; else if (dd <= 3) score += 10; else if (dd > 7) score -= 30;
      score += strSim(bank.description, e.description) * 10;
      if (score > bestScore && score > 50) { bestScore = score; best = i; }
    });
    if (best !== null) {
      const e = embatTxs[best]; usedEmbat.add(best);
      results.push({ status: bestScore >= 80 ? "matched" : "fuzzy", bank, embat: e, score: bestScore, dateDiff: dateDiff(bankDate, parseDate(e.transaction_date)) });
    } else {
      results.push({ status: "missing_in_embat", bank, embat: null, score: 0 });
    }
  }
  embatTxs.forEach((e, i) => { if (!usedEmbat.has(i)) results.push({ status: "extra_in_embat", bank: null, embat: e, score: 0 }); });
  return results;
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV(results) {
  const rows = [["Status","Fecha Banco","Descripción Banco","Importe Banco","Moneda Banco","Fecha Embat","Descripción Embat","Importe Embat","Moneda Embat","Diferencia días","Score"]];
  for (const r of results) {
    rows.push([r.status, r.bank?.transaction_date||"", r.bank?.description||"", r.bank?.amount||"", r.bank?.currency||"", r.embat?.transaction_date||"", r.embat?.description||"", r.embat?.amount||"", r.embat?.currency||"", r.dateDiff??""  , r.score||""]);
  }
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = "embat_reconciliation.csv"; a.click();
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [bankFile, setBankFile] = useState(null);
  const [embatFile, setEmbatFile] = useState(null);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState("idle");
  const [statusMsg, setStatusMsg] = useState("Sube los archivos para comenzar");
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState("all");
  const [dragging, setDragging] = useState(null);
  const bankRef = useRef(), embatRef = useRef();

  const handleDrop = (type, e) => { e.preventDefault(); setDragging(null); const f = e.dataTransfer.files[0]; if (!f) return; type === "bank" ? setBankFile(f) : setEmbatFile(f); };

  const run = async () => {
    if (!bankFile || !embatFile) return;
    setStatus("processing"); setResults(null); setProgress(10);
    try {
      setStatusMsg("📄 Extrayendo transacciones del banco..."); setProgress(20);
      const bankTxs = (bankFile.name.endsWith(".xlsx") || bankFile.name.endsWith(".xls"))
        ? await parseExcel(bankFile, "bank") : await parsePDF(bankFile, "bank");

      setStatusMsg("📊 Leyendo datos de Embat..."); setProgress(55);
      const embatTxs = (embatFile.name.endsWith(".xlsx") || embatFile.name.endsWith(".xls"))
        ? await parseExcel(embatFile, "embat") : await parsePDF(embatFile, "embat");

      setStatusMsg("🔍 Cruzando transacciones..."); setProgress(85);
      await new Promise(r => setTimeout(r, 300));
      const matched = matchTransactions(bankTxs, embatTxs);
      setResults(matched); setProgress(100); setStatus("done");
      setStatusMsg(`✅ Completado — ${bankTxs.length} transacciones banco · ${embatTxs.length} en Embat`);
    } catch(err) { setStatus("idle"); setStatusMsg("❌ Error: " + err.message); setProgress(0); }
  };

  const filtered = results ? results.filter(r => {
    if (filter === "all") return true;
    if (filter === "matched") return r.status === "matched" || r.status === "fuzzy";
    if (filter === "missing") return r.status === "missing_in_embat";
    if (filter === "extra") return r.status === "extra_in_embat";
    return true;
  }) : [];

  const counts = results ? {
    total: results.length,
    matched: results.filter(r => r.status === "matched" || r.status === "fuzzy").length,
    missing: results.filter(r => r.status === "missing_in_embat").length,
    extra: results.filter(r => r.status === "extra_in_embat").length,
  } : null;

  return (
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <div className="logo">E</div>
        <div>
          <div className="header-title">Embat Reconciler</div>
          <div className="header-sub">Bank ↔ Embat · Transaction Matching</div>
        </div>
        <div className="header-badge">Internal Tool v1.0</div>
      </div>
      <div className="main">
        <div className="upload-grid">
          {[{type:"bank",icon:"🏦",label:"Fuente 1",title:"Extracto del Banco",hint:"PDF del banco (Naspa, BBVA…) o Excel",ref:bankRef,file:bankFile,set:setBankFile},
            {type:"embat",icon:"📊",label:"Fuente 2",title:"Export de Embat",hint:"Excel descargado desde Embat o PDF",ref:embatRef,file:embatFile,set:setEmbatFile}
          ].map(({type,icon,label,title,hint,ref,file,set}) => (
            <div key={type}
              className={`upload-card ${file?"has-file":""} ${dragging===type?"dragging":""}`}
              onClick={() => ref.current.click()}
              onDragOver={e=>{e.preventDefault();setDragging(type);}}
              onDragLeave={()=>setDragging(null)}
              onDrop={e=>handleDrop(type,e)}
            >
              <div className="upload-icon">{icon}</div>
              <div className="upload-label">{label}</div>
              <div className="upload-title">{title}</div>
              <div className="upload-hint">{hint}</div>
              {file && <div className="upload-filename">✓ {file.name}</div>}
              <input ref={ref} type="file" className="file-input" accept=".pdf,.xlsx,.xls" onChange={e=>set(e.target.files[0])} />
            </div>
          ))}
        </div>

        <button className="run-btn" onClick={run} disabled={!bankFile||!embatFile||status==="processing"}>
          {status==="processing" ? "⏳ Analizando..." : "🔍 Analizar y Cruzar Transacciones"}
        </button>

        <div className="status-bar">
          <div className={`status-dot ${status}`} />
          <span>{statusMsg}</span>
          {status==="processing" && <div style={{marginLeft:"auto"}}><div className="progress-bar"><div className="progress-fill" style={{width:progress+"%"}}/></div></div>}
        </div>

        {counts && (
          <div className="summary-cards">
            {[{cls:"total",label:"Total",val:counts.total,sub:"banco + embat"},
              {cls:"matched",label:"Coinciden",val:counts.matched,sub:counts.total?Math.round(counts.matched/counts.total*100)+"%":"0%"},
              {cls:"missing",label:"Faltan en Embat",val:counts.missing,sub:"en banco, no en Embat"},
              {cls:"extra",label:"Extra en Embat",val:counts.extra,sub:"en Embat, no en banco"},
            ].map(({cls,label,val,sub}) => (
              <div key={cls} className={`summary-card ${cls}`}>
                <div className="sc-label">{label}</div>
                <div className={`sc-value ${cls}`}>{val}</div>
                <div className="sc-sub">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {results && (
          <div>
            <div className="table-header">
              <div className="table-title">Resultados del cruce</div>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div className="filter-tabs">
                  {[{key:"all",label:`Todos (${counts.total})`},{key:"matched",label:`✓ Match (${counts.matched})`},{key:"missing",label:`✗ Faltan (${counts.missing})`},{key:"extra",label:`+ Extra (${counts.extra})`}]
                    .map(t => <button key={t.key} className={`filter-tab ${t.key} ${filter===t.key?"active":""}`} onClick={()=>setFilter(t.key)}>{t.label}</button>)}
                </div>
                <button className="export-btn" onClick={()=>exportCSV(results)}>↓ CSV</button>
              </div>
            </div>
            <div className="table-wrap">
              <div className="table-scroll">
                {filtered.length===0 ? (
                  <div className="empty-state"><div className="empty-icon">🎉</div><div className="empty-title">¡Sin discrepancias!</div></div>
                ) : (
                  <table className="results-table">
                    <thead><tr>
                      <th>Estado</th><th>Fecha Banco</th><th>Descripción Banco</th><th>Importe Banco</th>
                      <th>Fecha Embat</th><th>Descripción Embat</th><th>Importe Embat</th><th>Δ Días</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map((r,i) => (
                        <tr key={i}>
                          <td>
                            {r.status==="matched" && <span className="status-pill pill-matched">✓ Match</span>}
                            {r.status==="fuzzy" && <span className="status-pill pill-fuzzy">~ Probable</span>}
                            {r.status==="missing_in_embat" && <span className="status-pill pill-missing">✗ Falta en Embat</span>}
                            {r.status==="extra_in_embat" && <span className="status-pill pill-extra">+ Extra Embat</span>}
                          </td>
                          <td style={{color:C.textDim,fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{r.bank?.transaction_date||"—"}</td>
                          <td><div className="desc-main">{r.bank?.description?.slice(0,60)||"—"}</div></td>
                          <td><span className={`amount ${(r.bank?.amount||0)<0?"neg":"pos"}`}>{fmtAmt(r.bank?.amount,r.bank?.currency)}</span></td>
                          <td style={{color:C.textDim,fontFamily:"JetBrains Mono,monospace",fontSize:12}}>{r.embat?.transaction_date||"—"}</td>
                          <td><div className="desc-main">{r.embat?.description?.slice(0,60)||"—"}</div></td>
                          <td><span className={`amount ${(r.embat?.amount||0)<0?"neg":"pos"}`}>{fmtAmt(r.embat?.amount,r.embat?.currency)}</span></td>
                          <td style={{textAlign:"center",fontFamily:"JetBrains Mono,monospace",fontSize:12}}>
                            {r.dateDiff!=null ? <span style={{color:r.dateDiff===0?C.green:r.dateDiff<=2?C.amber:C.red}}>{r.dateDiff}d</span> : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {!results && status==="idle" && (
          <div className="empty-state">
            <div className="empty-icon">🔄</div>
            <div className="empty-title">Listo para analizar</div>
            <div className="empty-text">Sube el extracto bancario y el export de Embat para cruzar transacciones automáticamente.</div>
          </div>
        )}
      </div>
    </div>
  );
}
