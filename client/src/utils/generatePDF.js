/**
 * client/src/utils/generatePDF.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a professional 2-page A4 PDF report using jsPDF.
 * Call: generatePDF(data, userName?)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { jsPDF } from "jspdf";

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const FMT = (n) => n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN");
const pct = (n) => n == null ? "—" : `${Number(n).toFixed(1)}%`;

/** Blend rgb color at opacity onto white background → solid rgb for PDF fills */
function ab(rgb, op) {
  return rgb.map(c => Math.round(255 * (1 - op) + c * op));
}

const RISK_COLORS = {
  Low:      [16,  185, 129],
  Medium:   [245, 158, 11],
  High:     [244, 63,  94],
  Critical: [124, 58,  237],
};
const URGENCY_COLORS = {
  critical: [244, 63,  94],
  high:     [245, 158, 11],
  medium:   [96,  165, 250],
  low:      [100, 116, 139],
};

function riskRGB(level) { return RISK_COLORS[level] || [100, 116, 139]; }
function urgencyRGB(u)  { return URGENCY_COLORS[u?.toLowerCase()] || [100, 116, 139]; }

/** Draw a rounded rectangle (jsPDF doesn't have native, so use rect with radius approximation) */
function roundedRect(doc, x, y, w, h, r, style) {
  doc.roundedRect(x, y, w, h, r, r, style);
}

/** Draw a colored section header band */
function sectionHeader(doc, text, y, pageW) {
  doc.setFillColor(20, 20, 32);
  doc.rect(0, y, pageW, 10, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(124, 58, 237);
  doc.setFont("helvetica", "bold");
  doc.text(text.toUpperCase(), 20, y + 6.5);
  doc.setDrawColor(124, 58, 237);
  doc.setLineWidth(0.4);
  doc.line(20, y + 9.5, pageW - 20, y + 9.5);
}

/** Draw a metric pill */
function metricPill(doc, x, y, label, value, rgb) {
  // Background — blended solid (no GState needed)
  const bg = ab(rgb, 0.08);
  doc.setFillColor(bg[0], bg[1], bg[2]);
  roundedRect(doc, x, y, 38, 22, 3, "F");
  // Border
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  doc.setLineWidth(0.3);
  roundedRect(doc, x, y, 38, 22, 3, "S");
  // Top line
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.rect(x, y, 38, 1.5, "F");
  // Value
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  doc.text(String(value), x + 19, y + 11, { align: "center" });
  // Label
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(label, x + 19, y + 17, { align: "center" });
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export function generatePDF(data, userName = null) {
  const doc     = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW   = 210;
  const pageH   = 297;
  const ML      = 20;   // left margin
  const MR      = 20;   // right margin
  const CW      = pageW - ML - MR;  // content width = 170
  const level   = data.riskLevel || "Medium";
  const rgb     = riskRGB(level);
  const today   = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  /* ── PAGE 1 ─────────────────────────────────────────────────────────────── */

  // Header gradient band
  doc.setFillColor(28, 0, 60);
  doc.rect(0, 0, pageW, 42, "F");
  // Violet accent left edge
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 4, 42, "F");
  // Brand
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("SafetyNet", ML + 2, 16);
  doc.setTextColor(167, 139, 250);
  doc.text(".ai", ML + 2 + 33.5, 16);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("AI Emergency Fund Calculator  ·  India", ML + 2, 24);
  // Report title (right aligned)
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Emergency Fund Report", pageW - MR, 14, { align: "right" });
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${today}`, pageW - MR, 21, { align: "right" });
  if (userName) {
    doc.text(`Prepared for: ${userName}`, pageW - MR, 28, { align: "right" });
  }
  // Subtitle line
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("For educational purposes only. Not financial advice.", pageW / 2, 38, { align: "center" });

  let y = 52;

  // ── Risk level banner ──────────────────────────────────────
  const bgRisk = ab(rgb, 0.08);
  doc.setFillColor(bgRisk[0], bgRisk[1], bgRisk[2]);
  roundedRect(doc, ML, y, CW, 18, 4, "F");
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
  doc.setLineWidth(0.4);
  roundedRect(doc, ML, y, CW, 18, 4, "S");
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.rect(ML, y, 4, 18, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
  doc.text(`RISK LEVEL: ${level.toUpperCase()}`, ML + 10, y + 8);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Risk Score: ${data.riskScore ?? "—"} / 100`, ML + 10, y + 14);
  // AI source badge
  const aiLabel = data.aiSource === "groq" ? "AI · Groq Llama 3.1" : "Calculated";
  doc.setFontSize(7);
  doc.setTextColor(data.aiSource === "groq" ? 16 : 100, data.aiSource === "groq" ? 185 : 116, data.aiSource === "groq" ? 129 : 139);
  doc.text(aiLabel, pageW - MR, y + 11, { align: "right" });

  y += 26;

  // ── 4 key metric pills ────────────────────────────────────
  const surplus = (data.inputs?.monthlyIncome || 0) - (data.inputs?.monthlyExpenses || 0) - (data.inputs?.emi || 0);
  const metrics = [
    { label: "TARGET FUND",      value: FMT(data.recommendedFund),          rgb: rgb },
    { label: "MONTHS COVERED",   value: data.monthsCovered?.toFixed ? data.monthsCovered.toFixed(1)+" mo" : "—", rgb: [96, 165, 250] },
    { label: "RISK SCORE",       value: `${data.riskScore ?? "—"} / 100`,   rgb: rgb },
    { label: "MONTHLY SURPLUS",  value: FMT(surplus),                        rgb: [16, 185, 129] },
  ];
  metrics.forEach((m, i) => { metricPill(doc, ML + i * 43, y, m.label, m.value, m.rgb); });

  y += 32;

  // ── AI Insights ───────────────────────────────────────────
  sectionHeader(doc, "AI Insights", y, pageW);
  y += 14;
  if (data.insights) {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    const lines = doc.splitTextToSize(String(data.insights), CW);
    const capped = lines.slice(0, 6);
    doc.text(capped, ML, y);
    y += capped.length * 5 + 4;
  }
  if (data.suggestions?.length) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(167, 139, 250);
    doc.text("Key Suggestions:", ML, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    data.suggestions.slice(0, 3).forEach(s => {
      const ls = doc.splitTextToSize(`• ${s}`, CW - 4);
      doc.text(ls, ML + 2, y);
      y += ls.length * 4.5;
    });
  }

  y += 6;

  // ── Investment Tiers ──────────────────────────────────────
  if (data.tiers?.length) {
    sectionHeader(doc, "3-Tier Emergency Fund Architecture", y, pageW);
    y += 14;
    const TIER_COLORS = [[16, 185, 129], [96, 165, 250], [167, 139, 250]];
    data.tiers.slice(0, 3).forEach((tier, i) => {
      const tx = ML + i * 58;
      const tr = TIER_COLORS[i];
      const bgTier = ab(tr, 0.06);
      doc.setFillColor(bgTier[0], bgTier[1], bgTier[2]);
      roundedRect(doc, tx, y, 54, 38, 3, "F");
      doc.setDrawColor(tr[0], tr[1], tr[2]);
      doc.setLineWidth(0.3);
      roundedRect(doc, tx, y, 54, 38, 3, "S");
      doc.setFillColor(tr[0], tr[1], tr[2]);
      doc.rect(tx, y, 54, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(tr[0], tr[1], tr[2]);
      doc.text(tier.name || `Tier ${i + 1}`, tx + 3, y + 8);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(240, 245, 250);
      doc.text(FMT(tier.amount), tx + 3, y + 16);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`${tier.months || "—"} months`, tx + 3, y + 22);
      const purp = doc.splitTextToSize(tier.purpose || "", 50);
      doc.text(purp.slice(0, 2), tx + 3, y + 28);
    });
    y += 48;
  }

  // ── Input Summary ─────────────────────────────────────────
  if (data.inputs) {
    sectionHeader(doc, "Your Financial Inputs", y, pageW);
    y += 14;
    const inp = data.inputs;
    const rows = [
      ["Monthly Income",   FMT(inp.monthlyIncome)],
      ["Monthly Expenses", FMT(inp.monthlyExpenses)],
      ["EMI Payments",     FMT(inp.emi)],
      ["Current Savings",  FMT(inp.savings)],
      ["Employment Type",  inp.jobType ? inp.jobType.charAt(0).toUpperCase() + inp.jobType.slice(1) : "—"],
      ["City Tier",        inp.cityTier ? `Tier ${inp.cityTier}` : "—"],
      ["Dependents",       inp.dependents ?? "—"],
      ["Health Insurance", inp.hasHealthInsurance === "yes" ? "Yes" : "No"],
    ];
    const half = Math.ceil(rows.length / 2);
    rows.forEach((r, i) => {
      const col  = i < half ? 0 : 1;
      const row  = i < half ? i : i - half;
      const rx   = ML + col * 90;
      const ry   = y + row * 7;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(r[0] + ":", rx, ry);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(226, 232, 240);
      doc.text(String(r[1]), rx + 40, ry);
    });
    y += half * 7 + 8;
  }

  /* ── PAGE 2 ─────────────────────────────────────────────────────────────── */
  doc.addPage();
  // Page 2 header strip
  doc.setFillColor(28, 0, 60);
  doc.rect(0, 0, pageW, 18, "F");
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 4, 18, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("SafetyNet.ai  ·  Emergency Fund Report", ML + 2, 11);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Page 2  ·  ${today}`, pageW - MR, 11, { align: "right" });

  y = 28;

  // ── Action Steps ──────────────────────────────────────────
  if (data.actionSteps?.length) {
    sectionHeader(doc, "Recommended Action Steps", y, pageW);
    y += 14;
    data.actionSteps.slice(0, 8).forEach((step, i) => {
      const ur = urgencyRGB(step.urgency);
      // urgency badge
      const bgUr = ab(ur, 0.12);
      doc.setFillColor(bgUr[0], bgUr[1], bgUr[2]);
      roundedRect(doc, ML, y - 2, 18, 5.5, 1.5, "F");
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(ur[0], ur[1], ur[2]);
      doc.text((step.urgency || "").toUpperCase(), ML + 9, y + 2, { align: "center" });
      // Title
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(226, 232, 240);
      doc.text(`${i + 1}. ${step.title || ""}`, ML + 22, y + 1.5);
      // Description
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const desc = doc.splitTextToSize(step.description || step.action || "", CW - 24);
      doc.text(desc.slice(0, 2), ML + 22, y + 6.5);
      y += 8 + desc.slice(0, 2).length * 4;
    });
  }

  y += 4;

  // ── Risk & Protective Factors ─────────────────────────────
  const showFactors = (data.riskFactors?.length || data.protectiveFactors?.length);
  if (showFactors && y < pageH - 80) {
    sectionHeader(doc, "Risk Factors Analysis", y, pageW);
    y += 14;
    const half = Math.ceil((data.riskFactors?.length || 0) / 2);
    const rf = data.riskFactors || [];
    rf.slice(0, 6).forEach((f, i) => {
      const col = i < 3 ? 0 : 1;
      const row = i < 3 ? i : i - 3;
      const rx  = ML + col * 90;
      const ry  = y + row * 8;
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(244, 63, 94);
      doc.text("▲", rx, ry);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      const txt = doc.splitTextToSize(f.detail || f.factor || String(f), 82);
      doc.text(txt.slice(0, 1), rx + 4, ry);
    });
    y += Math.min(rf.length, 3) * 8 + 6;
    const pf = data.protectiveFactors || [];
    if (pf.length) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text("Protective Factors:", ML, y);
      y += 5;
      pf.slice(0, 4).forEach((f, i) => {
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const txt = doc.splitTextToSize(`✓  ${f.detail || f.factor || String(f)}`, CW - 4);
        doc.text(txt.slice(0, 1), ML + 2, y);
        y += 5;
      });
    }
  }

  y += 6;

  // ── Benchmarks ────────────────────────────────────────────
  if (data.benchmarks && y < pageH - 60) {
    const bm = data.benchmarks;
    sectionHeader(doc, "National Benchmarks", y, pageW);
    y += 14;
    const bmRows = [
      ["National Avg. Coverage",   `${bm.nationalAvgMonths ?? "—"} months`],
      ["National Avg. Fund",       FMT(bm.nationalAvgFund)],
      ["Recommended Coverage",     `${bm.recommendedMonths ?? "—"} months`],
      ["Your Percentile Rank",     bm.percentileRank ? `${bm.percentileRank}th percentile` : "—"],
      ["Typical Fund Range",       bm.typicalMin && bm.typicalMax ? `${FMT(bm.typicalMin)} – ${FMT(bm.typicalMax)}` : "—"],
    ];
    const bmHalf = Math.ceil(bmRows.length / 2);
    bmRows.forEach((r, i) => {
      const col = i < bmHalf ? 0 : 1;
      const row = i < bmHalf ? i : i - bmHalf;
      const rx  = ML + col * 90;
      const ry  = y + row * 7;
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(r[0] + ":", rx, ry);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(226, 232, 240);
      doc.text(r[1], rx + 52, ry);
    });
    y += bmHalf * 7 + 8;
  }

  // ── Projection ────────────────────────────────────────────
  if (data.projection?.length && y < pageH - 50) {
    sectionHeader(doc, "12-Month Savings Projection", y, pageW);
    y += 14;
    const last  = data.projection[data.projection.length - 1];
    const first = data.projection[0];
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Starting balance: ${FMT(first?.balance)}  →  Month 12 projected: ${FMT(last?.balance)}`, ML, y);
    y += 5;
    if (last?.percentFunded != null) {
      doc.text(`Funded at Month 12: ${pct(last.percentFunded)}  of  ${FMT(last?.target)} target`, ML, y);
      y += 5;
    }
    const targetMonth = data.projection.find(p => (p.percentFunded || 0) >= 100);
    if (targetMonth) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(`🎯 Target achieved at Month ${targetMonth.month || "—"}`, ML, y);
      y += 5;
    }
  }

  // ── Footer ────────────────────────────────────────────────
  const footerY = pageH - 14;
  doc.setDrawColor(40, 40, 60);
  doc.setLineWidth(0.3);
  doc.line(ML, footerY - 4, pageW - MR, footerY - 4);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("SafetyNet.ai  ·  For educational purposes only. Not financial advice. Data is private and never stored on our servers.", ML, footerY);
  doc.text("v3.0 · India", pageW - MR, footerY, { align: "right" });

  // Use blob URL so Chrome opens the PDF correctly (avoids ERR_FAILED on file://)
  const blob = doc.output("blob");
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `safetynet-report-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
