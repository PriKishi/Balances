import { useState, useRef } from "react";
import * as XLSX from "xlsx";

const C = {
  bg:"#0A0E1A",surface:"#111827",surfaceUp:"#1A2234",border:"#1E2D45",
  accent:"#00C2FF",accentDim:"#0A3D52",green:"#00E5A0",greenDim:"#003D29",
  red:"#FF4D6A",redDim:"#3D0014",amber:"#FFB547",amberDim:"#3D2800",
  purple:"#CC88FF",purpleDim:"#2D1A4A",
  muted:"#4A6080",text:"#E8F0FE",textDim:"#7A90B0",
};

const css=`
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};color:${C.text};font-family:'Space Grotesk',sans-serif;}
  .app{min-height:100vh;}
  .header{background:linear-gradient(135deg,#0D1628,#0A1220);border-bottom:1px solid ${C.border};padding:20px 32px;display:flex;align-items:center;gap:16px;}
  .logo{width:36px;height:36px;background:linear-gradient(135deg,${C.accent},#0066FF);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;}
  .header-title{font-size:18px;font-weight:600;letter-spacing:-0.3px;}
  .header-sub{font-size:12px;color:${C.textDim};margin-top:1px;font-family:'JetBrains Mono',monospace;}
  .header-badge{margin-left:auto;background:${C.accentDim};color:${C.accent};border:1px solid ${C.accent}33;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;font-family:'JetBrains Mono',monospace;}
  .main{padding:32px;max-width:1500px;margin:0 auto;}
  .upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;}
  .upload-card{background:${C.surface};border:1.5px dashed ${C.border};border-radius:16px;padding:28px;transition:all 0.2s;cursor:pointer;}
  .upload-card:hover{border-color:${C.accent}66;background:${C.surfaceUp};}
  .upload-card.has-file{border-style:solid;border-color:${C.green}66;background:${C.greenDim}22;}
  .upload-card.dragging{border-color:${C.accent};background:${C.accentDim};}
  .upload-icon{font-size:32px;margin-bottom:12px;}
  .upload-label{font-size:13px;font-weight:600;color:${C.textDim};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}
  .upload-title{font-size:17px;font-weight:600;margin-bottom:6px;}
  .upload-hint{font-size:12px;color:${C.textDim};line-height:1.5;}
  .format-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;}
  .chip{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;background:${C.surfaceUp};color:${C.textDim};border:1px solid ${C.border};font-family:'JetBrains Mono',monospace;}
  .upload-filename{margin-top:12px;padding:8px 12px;background:${C.greenDim};border:1px solid ${C.green}44;border-radius:8px;font-size:12px;color:${C.green};font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:8px;}
  .file-type-tag{background:${C.accentDim};color:${C.accent};padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;text-transform:uppercase;}
  .file-input{display:none;}
  .run-btn{width:100%;padding:16px;background:linear-gradient(135deg,${C.accent},#0066FF);border:none;border-radius:12px;color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:'Space Grotesk',sans-serif;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:28px;}
  .run-btn:hover{transform:translateY(-1px);box-shadow:0 8px 24px ${C.accent}44;}
  .run-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}
  .status-bar{background:${C.surfaceUp};border:1px solid ${C.border};border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;color:${C.textDim};font-family:'JetBrains Mono',monospace;display:flex;align-items:center;gap:8px;}
  .status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
  .status-dot.processing{background:${C.amber};animation:pulse 1s infinite;}
  .status-dot.done{background:${C.green};}
  .status-dot.idle{background:${C.muted};}
  .status-dot.error{background:${C.red};}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  .progress-bar{height:3px;background:${C.border};border-radius:2px;overflow:hidden;width:120px;}
  .progress-fill{height:100%;background:linear-gradient(90deg,${C.accent},${C.green});border-radius:2px;transition:width 0.4s;}
  .debug-bar{background:#1A1A0A;border:1px solid ${C.amber}33;border-radius:8px;padding:10px 16px;margin-bottom:16px;font-size:11px;color:${C.amber};font-family:'JetBrains Mono',monospace;display:flex;gap:24px;flex-wrap:wrap;}
  .summary-cards{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:28px;}
  .summary-card{background:${C.surface};border:1px solid ${C.border};border-radius:12px;padding:16px;position:relative;overflow:hidden;}
  .summary-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;}
  .sc-total::after{background:${C.accent};}
  .sc-matched::after{background:${C.green};}
  .sc-miss-company::after{background:${C.red};}
  .sc-miss-bank::after{background:#FF8C00;}
  .sc-dup-bank::after{background:${C.purple};}
  .sc-dup-company::after{background:#FF6B9D;}
  .sc-label{font-size:10px;color:${C.textDim};text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;line-height:1.4;}
  .sc-value{font-size:28px;font-weight:700;line-height:1;margin-bottom:3px;font-family:'JetBrains Mono',monospace;}
  .sc-sub{font-size:10px;color:${C.textDim};line-height:1.4;}
  .v-total{color:${C.accent};}.v-matched{color:${C.green};}.v-miss-company{color:${C.red};}
  .v-miss-bank{color:#FF8C00;}.v-dup-bank{color:${C.purple};}.v-dup-company{color:#FF6B9D;}
  .table-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;}
  .table-title{font-size:16px;font-weight:600;}
  .filter-tabs{display:flex;gap:6px;flex-wrap:wrap;}
  .filter-tab{padding:5px 12px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.15s;border:1px solid transparent;font-family:'Space Grotesk',sans-serif;background:transparent;}
  .ft-all{color:${C.textDim};border-color:${C.border};}.ft-all.active{background:${C.accentDim};color:${C.accent};border-color:${C.accent}44;}
  .ft-matched{color:${C.green};border-color:${C.green}33;}.ft-matched.active{background:${C.greenDim};}
  .ft-miss-company{color:${C.red};border-color:${C.red}33;}.ft-miss-company.active{background:${C.redDim};}
  .ft-miss-bank{color:#FF8C00;border-color:#FF8C0033;}.ft-miss-bank.active{background:#3D2000;}
  .ft-dup-bank{color:${C.purple};border-color:${C.purple}33;}.ft-dup-bank.active{background:${C.purpleDim};}
  .ft-dup-company{color:#FF6B9D;border-color:#FF6B9D33;}.ft-dup-company.active{background:#3D0020;}
  .export-btn{padding:8px 16px;border-radius:8px;background:transparent;border:1px solid ${C.border};color:${C.textDim};font-size:13px;font-weight:500;cursor:pointer;font-family:'Space Grotesk',sans-serif;display:flex;align-items:center;gap:6px;}
  .export-btn:hover{border-color:${C.accent}66;color:${C.accent};background:${C.accentDim};}
  .table-wrap{background:${C.surface};border:1px solid ${C.border};border-radius:16px;overflow:hidden;}
  .table-scroll{overflow-x:auto;max-height:560px;overflow-y:auto;}
  .results-table{width:100%;border-collapse:collapse;font-size:13px;}
  .results-table th{text-align:left;padding:10px 14px;color:${C.textDim};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid ${C.border};position:sticky;top:0;background:${C.surface};white-space:nowrap;}
  .results-table td{padding:10px 14px;border-bottom:1px solid ${C.border}22;vertical-align:middle;}
  .results-table tr:hover td{background:${C.surfaceUp}33;}
  .pill{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;}
  .pill-matched{background:${C.greenDim};color:${C.green};border:1px solid ${C.green}44;}
  .pill-miss-company{background:${C.redDim};color:${C.red};border:1px solid ${C.red}44;}
  .pill-miss-bank{background:#3D2000;color:#FF8C00;border:1px solid #FF8C0044;}
  .pill-dup-bank{background:${C.purpleDim};color:${C.purple};border:1px solid ${C.purple}44;}
  .pill-dup-company{background:#3D0020;color:#FF6B9D;border:1px solid #FF6B9D44;}
  .pill-fuzzy{background:#1A2A3A;color:#88CCFF;border:1px solid #88CCFF44;}
  .amount{font-family:'JetBrains Mono',monospace;font-size:12px;}
  .neg{color:${C.red};}.pos{color:${C.green};}
  .mono{font-family:'JetBrains Mono',monospace;font-size:12px;color:${C.textDim};}
  .action-badge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
  .action-hide{background:#3D0020;color:#FF6B9D;}
  .action-report{background:${C.redDim};color:${C.red};}
  .action-ok{background:${C.greenDim};color:${C.green};}
  .empty-state{text-align:center;padding:60px;color:${C.textDim};}
  .empty-icon{font-size:48px;margin-bottom:16px;}
  .empty-title{font-size:18px;font-weight:600;color:${C.text};margin-bottom:8px;}
`;

// ── File type detection ───────────────────────────────────────────────────────
function getFileType(file) {
  const name = file.name.toLowerCase();
  if (name.match(/\.xlsx?$/)) return "excel";
  if (name.match(/\.csv$/)) return "csv";
  if (name.match(/\.xml$/)) return "xml";
  if (name.match(/\.pdf$/)) return "pdf";
  if (name.match(/\.(png|jpg|jpeg|webp|gif|bmp|tiff?)$/)) return "image";
  return "unknown";
}

function getFileTypeBadge(file) {
  if (!file) return null;
  const t = getFileType(file);
  const labels = { excel:"XLSX", csv:"CSV", xml:"XML", pdf:"PDF", image:"IMG" };
  return labels[t] || "?";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  let m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m) return new Date(+m[3],+m[2]-1,+m[1]);
  m = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
  if (m) return new Date(+m[1],+m[2]-1,+m[3]);
  const d = new Date(s); return isNaN(d)?null:d;
}
function fmtDate(str) {
  if (!str) return "—";
  const d = parseDate(str);
  return d ? d.toLocaleDateString("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}) : str;
}
function fmtAmt(n,cur) {
  if (n==null||n==="") return "—";
  const abs = Math.abs(n).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2});
  return (n<0?"-":"+")+abs+(cur?" "+cur:"");
}
function parseAmount(v) {
  if (v==null) return null;
  if (typeof v==="number") return v;
  const n = parseFloat(String(v).replace(/\s/g,"").replace(",","."));
  return isNaN(n)?null:n;
}
function dateDiff(a,b) {
  const da=parseDate(a),db=parseDate(b);
  if(!da||!db) return 999;
  return Math.abs((da-db)/86400000);
}
function strSim(a,b) {
  if(!a||!b) return 0;
  const wa=new Set(String(a).toLowerCase().split(/\W+/).filter(x=>x.length>2));
  const wb=new Set(String(b).toLowerCase().split(/\W+/).filter(x=>x.length>2));
  if(!wa.size||!wb.size) return 0;
  let c=0; wa.forEach(w=>{if(wb.has(w))c++;});
  return c/Math.max(wa.size,wb.size);
}
function fileToBase64(file) {
  return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
}
function fileToText(file) {
  return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsText(file,"utf-8");});
}

// ── AI extraction (PDF + images via API) ─────────────────────────────────────
async function extractViaAI(file, source, mediaType) {
  const base64 = await fileToBase64(file);
  const isImage = mediaType.startsWith("image/");
  const prompt = `Extract ALL financial transactions from this ${isImage?"bank statement image/screenshot":"document"}. Return ONLY a valid JSON array, no markdown, no explanation. Each object must have exactly:
{"transaction_date":"DD/MM/YYYY","value_date":"DD/MM/YYYY","description":"full description","amount":number,"currency":"EUR or other","source":"${source}"}
Rules: negative amount = debit/outflow, positive = credit/inflow. Include every single transaction row. If value_date is missing use transaction_date.`;

  const contentItem = isImage
    ? { type:"image", source:{ type:"base64", media_type: mediaType, data: base64 } }
    : { type:"document", source:{ type:"base64", media_type:"application/pdf", data: base64 } };

  const res = await fetch("/api/parse-pdf",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ base64, prompt, media_type: mediaType })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return JSON.parse(data.text.replace(/```json|```/g,"").trim());
}

// ── Parse CSV ─────────────────────────────────────────────────────────────────
async function parseCSV(file, source) {
  const text = await fileToText(file);
  const lines = text.split(/\r?\n/).filter(l=>l.trim());
  if (lines.length < 2) throw new Error("CSV vacío o sin datos");

  // Detect separator
  const sep = lines[0].includes(";") ? ";" : ",";
  const splitLine = l => l.split(sep).map(c=>c.replace(/^"|"$/g,"").trim());

  const headers = splitLine(lines[0]).map(h=>h.toLowerCase());
  const idx=(...kws)=>{ for(const k of kws){const i=headers.findIndex(h=>h.includes(k));if(i!==-1)return i;} return -1; };

  const dateIdx  = idx("fecha","date","f. contable","transaction","posting");
  const valIdx   = idx("valor","value date","f. valor");
  const descIdx  = idx("concepto","description","observaciones","desc","beneficiario");
  const amtIdx   = idx("importe","amount","accounting","monto","cargo");
  const curIdx   = idx("currency","divisa","moneda");

  const rows = [];
  for (let i=1;i<lines.length;i++) {
    const cols = splitLine(lines[i]);
    if (cols.every(c=>!c)) continue;
    const amt = parseAmount(cols[amtIdx]);
    if (amt==null) continue;
    rows.push({
      transaction_date: cols[dateIdx]||"",
      value_date: cols[valIdx]||"",
      description: cols[descIdx]||"",
      amount: amt,
      currency: curIdx!==-1?cols[curIdx]:"",
      source
    });
  }
  return rows;
}

// ── Parse XML ─────────────────────────────────────────────────────────────────
async function parseXML(file, source) {
  const text = await fileToText(file);
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");

  // Try common bank XML structures
  const txNodes = doc.querySelectorAll("Ntry, TxDtls, transaction, Transaction, movement, Movement, apunte, Apunte");
  if (!txNodes.length) {
    // Fallback: use AI to parse it
    return extractViaAI(file, source, "text/plain");
  }

  const rows = [];
  txNodes.forEach(node => {
    const getText = (...tags) => { for(const t of tags){ const el=node.querySelector(t); if(el?.textContent) return el.textContent.trim(); } return ""; };
    const amtEl = node.querySelector("Amt, amount, Amount, importe, Importe");
    const amt = parseAmount(amtEl?.textContent);
    if (amt==null) return;
    const cdtDbt = getText("CdtDbtInd","CdtDbt","type","tipo");
    const finalAmt = cdtDbt.toUpperCase()==="DBIT" ? -Math.abs(amt) : amt;
    rows.push({
      transaction_date: getText("BookgDt","ValDt","fecha","Date","date","BookingDate"),
      value_date: getText("ValDt","ValueDate","fechaValor"),
      description: getText("AddtlNtryInf","Ustrd","concepto","description","Description","narrative"),
      amount: finalAmt,
      currency: amtEl?.getAttribute("Ccy") || getText("currency","Currency","moneda") || "",
      source
    });
  });
  return rows;
}

// ── Parse Excel ───────────────────────────────────────────────────────────────
async function parseExcel(file, source) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result,{type:"array",cellDates:false});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws,{header:1,defval:null,raw:false});

        const DATE_KW = ["fecha","date","f. contable","transaction date","f.contable","posting","f.valor","value date"];
        let headerIdx=-1, headers=[];
        for (let i=0;i<Math.min(raw.length,30);i++) {
          const row=(raw[i]||[]).map(c=>String(c||"").toLowerCase().trim());
          if (row.some(c=>DATE_KW.some(k=>c.includes(k)))) { headerIdx=i; headers=row; break; }
        }
        if (headerIdx===-1) {
          let best=-1,bestCnt=0;
          for (let i=0;i<Math.min(raw.length,20);i++) {
            const cnt=(raw[i]||[]).filter(c=>c!=null&&String(c).trim()).length;
            if(cnt>bestCnt){bestCnt=cnt;best=i;}
          }
          if(best!==-1){headerIdx=best;headers=(raw[best]||[]).map(c=>String(c||"").toLowerCase().trim());}
        }
        if (headerIdx===-1){reject(new Error("No se encontró cabecera en el Excel"));return;}

        const idx=(...kws)=>{for(const k of kws){const i=headers.findIndex(h=>h.includes(k));if(i!==-1)return i;}return -1;};
        const dateIdx = idx("transaction date","fecha contable","f. contable","f.contable","posting","fecha");
        const valIdx  = idx("value date","f. valor","value_date","valor");
        const descIdx = idx("description","concepto","desc","beneficiario");
        const obsIdx  = idx("observaciones");
        const amtIdx  = idx("accounting amount","importe","amount","monto");
        const curIdx  = idx("currency","divisa","moneda");

        const rows=[];
        for (let i=headerIdx+1;i<raw.length;i++) {
          const r=raw[i];
          if(!r||r.every(c=>c==null)) continue;
          const amt=parseAmount(r[amtIdx]);
          if(amt==null) continue;
          const dateRaw=r[dateIdx];
          if(dateRaw==null) continue;
          let dateStr=String(dateRaw).trim();
          if(/^\d{5}$/.test(dateStr)) {
            try{const d=XLSX.SSF.parse_date_code(parseInt(dateStr));dateStr=`${String(d.d).padStart(2,"0")}/${String(d.m).padStart(2,"0")}/${d.y}`;}catch(e){}
          }
          let desc=String(r[descIdx]||"").trim();
          if(obsIdx!==-1&&obsIdx!==descIdx){const obs=String(r[obsIdx]||"").trim();if(obs&&obs!=="-"&&obs!==desc)desc=desc?desc+" | "+obs:obs;}
          rows.push({transaction_date:dateStr,value_date:String(r[valIdx]||"").trim(),description:desc,amount:amt,currency:curIdx!==-1?String(r[curIdx]||"").trim():"",source});
        }
        resolve(rows);
      } catch(err){reject(err);}
    };
    reader.readAsArrayBuffer(file);
  });
}

// ── Main file router ──────────────────────────────────────────────────────────
async function parseFile(file, source) {
  const type = getFileType(file);
  switch(type) {
    case "excel": return parseExcel(file, source);
    case "csv":   return parseCSV(file, source);
    case "xml":   return parseXML(file, source);
    case "pdf":   return extractViaAI(file, source, "application/pdf");
    case "image": {
      const ext = file.name.split(".").pop().toLowerCase();
      const mime = ext==="jpg"||ext==="jpeg" ? "image/jpeg" : ext==="png" ? "image/png" : ext==="webp" ? "image/webp" : "image/png";
      return extractViaAI(file, source, mime);
    }
    default: throw new Error(`Formato no soportado: ${file.name}`);
  }
}

// ── Duplicate detection ───────────────────────────────────────────────────────
function findDuplicates(txs) {
  const dups=new Set();
  for(let i=0;i<txs.length;i++)
    for(let j=i+1;j<txs.length;j++){
      const a=txs[i],b=txs[j];
      if(Math.abs((a.amount||0)-(b.amount||0))<0.02 && dateDiff(a.transaction_date,b.transaction_date)<=1 && strSim(a.description,b.description)>0.5){
        dups.add(i);dups.add(j);
      }
    }
  return dups;
}

// ── Reconcile ─────────────────────────────────────────────────────────────────
function reconcile(bankTxs, companyTxs) {
  const results=[],usedcompany=new Set(),usedBank=new Set();
  const bankDups=findDuplicates(bankTxs),companyDups=findDuplicates(companyTxs);
  bankTxs.forEach((tx,i)=>{if(bankDups.has(i)){results.push({status:"dup_in_bank",bank:tx,company:null,score:0,action:"hide"});usedBank.add(i);}});
  companyTxs.forEach((tx,i)=>{if(companyDups.has(i)){results.push({status:"dup_in_company",bank:null,company:tx,score:0,action:"hide"});usedcompany.add(i);}});
  bankTxs.forEach((bank,bi)=>{
    if(usedBank.has(bi)) return;
    let best=null,bestScore=-1;
    companyTxs.forEach((e,ei)=>{
      if(usedcompany.has(ei)) return;
      const dd=dateDiff(bank.transaction_date,e.transaction_date);
      const amtOk=Math.abs((e.amount||0)-(bank.amount||0))<0.02;
      let sc=0;
      if(amtOk)sc+=60;
      if(dd===0)sc+=30;else if(dd<=1)sc+=20;else if(dd<=3)sc+=10;else if(dd>7)sc-=30;
      sc+=strSim(bank.description,e.description)*10;
      if(sc>bestScore&&sc>50){bestScore=sc;best=ei;}
    });
    if(best!==null){
      const e=companyTxs[best];usedcompany.add(best);usedBank.add(bi);
      results.push({status:bestScore>=85?"matched":"fuzzy",bank,company:e,score:bestScore,dateDiff:dateDiff(bank.transaction_date,e.transaction_date),action:"ok"});
    } else {
      results.push({status:"missing_in_company",bank,company:null,score:0,action:"report_bank"});
    }
  });
  companyTxs.forEach((e,ei)=>{if(!usedcompany.has(ei))results.push({status:"missing_in_bank",bank:null,company:e,score:0,action:"report_company"});});
  return results;
}

// ── Export ────────────────────────────────────────────────────────────────────
function exportCSV(results) {
  const LABELS={matched:"✓ Match exacto",fuzzy:"~ Match probable",missing_in_company:"✗ Falta en company",missing_in_bank:"✗ Falta en Banco",dup_in_bank:"⚠ Duplicado Banco",dup_in_company:"⚠ Duplicado company"};
  const ACTIONS={ok:"Sin acción",report_bank:"Reportar al banco",report_company:"Revisar en company",hide:"Ocultar en back office"};
  const rows=[["Estado","Acción recomendada","Fecha Banco","Descripción Banco","Importe Banco","Moneda","Fecha company","Descripción company","Importe company","Δ días"]];
  for(const r of results) rows.push([LABELS[r.status]||r.status,ACTIONS[r.action]||"",r.bank?.transaction_date||"",r.bank?.description||"",r.bank?.amount||"",r.bank?.currency||r.company?.currency||"",r.company?.transaction_date||"",r.company?.description||"",r.company?.amount||"",r.dateDiff??""]);
  const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"}));a.download="company_reconciliation.csv";a.click();
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [bankFile,setBankFile]=useState(null);
  const [companyFile,setcompanyFile]=useState(null);
  const [results,setResults]=useState(null);
  const [debugInfo,setDebugInfo]=useState(null);
  const [appStatus,setAppStatus]=useState("idle");
  const [statusMsg,setStatusMsg]=useState("Sube los archivos para comenzar");
  const [progress,setProgress]=useState(0);
  const [filter,setFilter]=useState("all");
  const [dragging,setDragging]=useState(null);
  const bankRef=useRef(),companyRef=useRef();

  const handleDrop=(type,e)=>{e.preventDefault();setDragging(null);const f=e.dataTransfer.files[0];if(!f)return;type==="bank"?setBankFile(f):setcompanyFile(f);};

  const run=async()=>{
    if(!bankFile||!companyFile)return;
    setAppStatus("processing");setResults(null);setDebugInfo(null);setProgress(10);
    try{
      setStatusMsg(`📄 Leyendo extracto del banco (${getFileType(bankFile).toUpperCase()})...`);setProgress(20);
      const bankTxs=await parseFile(bankFile,"bank");
      setStatusMsg(`📊 Leyendo export de company (${getFileType(companyFile).toUpperCase()})...`);setProgress(55);
      const companyTxs=await parseFile(companyFile,"company");
      setDebugInfo({bankCount:bankTxs.length,companyCount:companyTxs.length,bankType:getFileType(bankFile),companyType:getFileType(companyFile)});
      setStatusMsg("🔍 Cruzando transacciones...");setProgress(85);
      await new Promise(r=>setTimeout(r,200));
      setResults(reconcile(bankTxs,companyTxs));
      setProgress(100);setAppStatus("done");
      setStatusMsg(`✅ Completado — ${bankTxs.length} tx banco · ${companyTxs.length} tx company`);
    }catch(err){setAppStatus("error");setStatusMsg("❌ Error: "+err.message);setProgress(0);}
  };

  const FILTERS=[
    {key:"all",cls:"ft-all",label:"Todos"},
    {key:"matched",cls:"ft-matched",label:"✓ Match"},
    {key:"missing_in_company",cls:"ft-miss-company",label:"✗ Falta en company"},
    {key:"missing_in_bank",cls:"ft-miss-bank",label:"✗ Falta en Banco"},
    {key:"dup_in_bank",cls:"ft-dup-bank",label:"⚠ Dup. Banco"},
    {key:"dup_in_company",cls:"ft-dup-company",label:"⚠ Dup. company"},
  ];

  const counts=results?{
    total:results.length,
    matched:results.filter(r=>r.status==="matched"||r.status==="fuzzy").length,
    miss_company:results.filter(r=>r.status==="missing_in_company").length,
    miss_bank:results.filter(r=>r.status==="missing_in_bank").length,
    dup_bank:results.filter(r=>r.status==="dup_in_bank").length,
    dup_company:results.filter(r=>r.status==="dup_in_company").length,
  }:null;

  const fCount=k=>k==="all"?counts?.total:k==="matched"?counts?.matched:k==="missing_in_company"?counts?.miss_company:k==="missing_in_bank"?counts?.miss_bank:k==="dup_in_bank"?counts?.dup_bank:counts?.dup_company;
  const filtered=results?(filter==="all"?results:filter==="matched"?results.filter(r=>r.status==="matched"||r.status==="fuzzy"):results.filter(r=>r.status===filter)):[];

  const PILL={
    matched:<span className="pill pill-matched">✓ Match exacto</span>,
    fuzzy:<span className="pill pill-fuzzy">~ Match probable</span>,
    missing_in_company:<span className="pill pill-miss-company">✗ Falta en Companyt</span>,
    missing_in_bank:<span className="pill pill-miss-bank">✗ Falta en Banco</span>,
    dup_in_bank:<span className="pill pill-dup-bank">⚠ Dup. Banco</span>,
    dup_in_company:<span className="pill pill-dup-company">⚠ Dup. Company</span>,
  };
  const ACTION={
    ok:<span className="action-badge action-ok">Sin acción</span>,
    report_bank:<span className="action-badge action-report">Reportar al banco</span>,
    report_company:<span className="action-badge action-report">Revisar en company</span>,
    hide:<span className="action-badge action-hide">Ocultar en back office</span>,
  };

  return(
    <div className="app">
      <style>{css}</style>
      <div className="header">
        <div className="logo">E</div>
        <div><div className="header-title">company Reconciler</div><div className="header-sub">Bank ↔ company · Transaction Matching</div></div>
        <div className="header-badge">v3.0 — Multi-format</div>
      </div>
      <div className="main">
        <div className="upload-grid">
          {[
            {type:"bank",icon:"🏦",label:"Fuente 1",title:"Extracto del Banco",hint:"Cualquier formato del banco",ref:bankRef,file:bankFile,set:setBankFile},
            {type:"company",icon:"📊",label:"Fuente 2",title:"Export de Company",hint:"Cualquier formato de company",ref:companyRef,file:companyFile,set:setcompanyFile}
          ].map(({type,icon,label,title,hint,ref,file,set})=>(
            <div key={type} className={`upload-card ${file?"has-file":""} ${dragging===type?"dragging":""}`}
              onClick={()=>ref.current.click()}
              onDragOver={e=>{e.preventDefault();setDragging(type);}}
              onDragLeave={()=>setDragging(null)}
              onDrop={e=>handleDrop(type,e)}>
              <div className="upload-icon">{icon}</div>
              <div className="upload-label">{label}</div>
              <div className="upload-title">{title}</div>
              <div className="upload-hint">{hint}</div>
              <div className="format-chips">
                {["PDF","XLSX","CSV","XML","PNG","JPG"].map(f=>(
                  <span key={f} className="chip">{f}</span>
                ))}
              </div>
              {file&&(
                <div className="upload-filename">
                  <span className="file-type-tag">{getFileTypeBadge(file)}</span>
                  {file.name}
                </div>
              )}
              <input ref={ref} type="file" className="file-input"
                accept=".pdf,.xlsx,.xls,.csv,.xml,.png,.jpg,.jpeg,.webp"
                onChange={e=>set(e.target.files[0])}/>
            </div>
          ))}
        </div>

        <button className="run-btn" onClick={run} disabled={!bankFile||!companyFile||appStatus==="processing"}>
          {appStatus==="processing"?"⏳ Analizando...":"🔍 Analizar y Cruzar Transacciones"}
        </button>

        <div className="status-bar">
          <div className={`status-dot ${appStatus}`}/>
          <span>{statusMsg}</span>
          {appStatus==="processing"&&<div style={{marginLeft:"auto"}}><div className="progress-bar"><div className="progress-fill" style={{width:progress+"%"}}/></div></div>}
        </div>

        {debugInfo&&(
          <div className="debug-bar">
            <span>🏦 Banco [{debugInfo.bankType.toUpperCase()}]: <strong>{debugInfo.bankCount}</strong> transacciones</span>
            <span>📊 Company [{debugInfo.companyType.toUpperCase()}]: <strong>{debugInfo.companyCount}</strong> transacciones</span>
            {debugInfo.bankCount===0&&<span>⚠️ 0 tx en banco — verifica que el archivo tenga columnas de fecha e importe</span>}
          </div>
        )}

        {counts&&(
          <div className="summary-cards">
            {[
              {cls:"sc-total",vcls:"v-total",label:"Total filas",val:counts.total,sub:"resultado del cruce"},
              {cls:"sc-matched",vcls:"v-matched",label:"Coinciden ✓",val:counts.matched,sub:`${counts.total?Math.round(counts.matched/counts.total*100):0}% · Sin acción`},
              {cls:"sc-miss-company",vcls:"v-miss-company",label:"Falta en company",val:counts.miss_company,sub:"En banco, no en company → reportar banco"},
              {cls:"sc-miss-bank",vcls:"v-miss-bank",label:"Falta en Banco",val:counts.miss_bank,sub:"En company, no en banco → revisar"},
              {cls:"sc-dup-bank",vcls:"v-dup-bank",label:"Dup. en Banco",val:counts.dup_bank,sub:"Misma tx 2x en extracto banco"},
              {cls:"sc-dup-company",vcls:"v-dup-company",label:"Dup. en company",val:counts.dup_company,sub:"Misma tx 2x → ocultar backoffice"},
            ].map(({cls,vcls,label,val,sub})=>(
              <div key={cls} className={`summary-card ${cls}`}>
                <div className="sc-label">{label}</div>
                <div className={`sc-value ${vcls}`}>{val}</div>
                <div className="sc-sub">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {results&&(
          <div>
            <div className="table-header">
              <div className="table-title">Resultados del cruce</div>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <div className="filter-tabs">
                  {FILTERS.map(({key,cls,label})=>(
                    <button key={key} className={`filter-tab ${cls} ${filter===key?"active":""}`} onClick={()=>setFilter(key)}>
                      {label} ({fCount(key)||0})
                    </button>
                  ))}
                </div>
                <button className="export-btn" onClick={()=>exportCSV(results)}>↓ CSV</button>
              </div>
            </div>
            <div className="table-wrap">
              <div className="table-scroll">
                {filtered.length===0?(
                  <div className="empty-state"><div className="empty-icon">🎉</div><div className="empty-title">Sin registros en este filtro</div></div>
                ):(
                  <table className="results-table">
                    <thead><tr>
                      <th>Estado</th><th>Acción</th>
                      <th>Fecha Banco</th><th>Descripción Banco</th><th>Importe Banco</th>
                      <th>Fecha company</th><th>Descripción company</th><th>Importe company</th>
                      <th>Δ días</th>
                    </tr></thead>
                    <tbody>
                      {filtered.map((r,i)=>(
                        <tr key={i}>
                          <td>{PILL[r.status]||r.status}</td>
                          <td>{ACTION[r.action]||""}</td>
                          <td className="mono">{fmtDate(r.bank?.transaction_date)}</td>
                          <td style={{maxWidth:220,fontSize:12,lineHeight:1.4}}>{r.bank?.description?.slice(0,80)||"—"}</td>
                          <td><span className={`amount ${(r.bank?.amount||0)<0?"neg":"pos"}`}>{fmtAmt(r.bank?.amount,r.bank?.currency)}</span></td>
                          <td className="mono">{fmtDate(r.company?.transaction_date)}</td>
                          <td style={{maxWidth:220,fontSize:12,lineHeight:1.4}}>{r.company?.description?.slice(0,80)||"—"}</td>
                          <td><span className={`amount ${(r.company?.amount||0)<0?"neg":"pos"}`}>{fmtAmt(r.company?.amount,r.company?.currency)}</span></td>
                          <td className="mono" style={{textAlign:"center"}}>
                            {r.dateDiff!=null?<span style={{color:r.dateDiff===0?C.green:r.dateDiff<=2?C.amber:C.red}}>{r.dateDiff}d</span>:"—"}
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

        {!results&&appStatus==="idle"&&(
          <div className="empty-state">
            <div className="empty-icon">🔄</div>
            <div className="empty-title">Listo para analizar</div>
            <div style={{fontSize:14,color:C.textDim,marginTop:8}}>Acepta PDF · Excel · CSV · XML · Imágenes y Screenshots</div>
          </div>
        )}
      </div>
    </div>
  );
}
