import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { Verdict } from "../types/verdict.js";
import { ArtifactBundle } from "../types/artifacts.js";

function sendHtml(res: ServerResponse, html: string): void {
  res.statusCode = 200;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(html);
}

function encode(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function buildHtml(verdict: Verdict, artifacts: ArtifactBundle): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>ESTH Validation Dashboard</title>
<style>
:root { --bg:#f8fafc; --card:#ffffff; --text:#0f172a; --muted:#475569; --ok:#16a34a; --err:#dc2626; --warn:#ca8a04; --border:#e2e8f0; }
body{margin:0;padding:24px;font-family:Inter,Segoe UI,system-ui,sans-serif;background:var(--bg);color:var(--text)}
.wrap{max-width:1100px;margin:0 auto}.hero{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}
.badge{padding:8px 14px;border-radius:999px;font-weight:700;background:${verdict.status === "PASS" ? "#dcfce7;color:#166534" : "#fee2e2;color:#991b1b"}}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:16px 0}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(2,6,23,.03)}
.small{font-size:12px;color:var(--muted)}
ul{padding-left:20px}.violation{margin:10px 0;padding:10px;border-radius:10px;border:1px solid var(--border);background:#fff}
.sev-ERROR{border-color:#fecaca;background:#fef2f2}.sev-WARN{border-color:#fde68a;background:#fffbeb}
code{background:#f1f5f9;padding:1px 6px;border-radius:6px}
</style>
</head>
<body>
<div class="wrap">
  <div class="hero">
    <div>
      <h1 style="margin:0">ESTH Validation Dashboard</h1>
      <div class="small">Cycle: ${artifacts.executionPlan.cycle_id} · Network: ${artifacts.executionPlan.network} · Version: ${artifacts.executionPlan.version}</div>
    </div>
    <div class="badge">${verdict.status}</div>
  </div>

  <div class="grid">
    <div class="card"><div class="small">Plan Steps</div><div style="font-size:28px;font-weight:800">${artifacts.executionPlan.steps.length}</div></div>
    <div class="card"><div class="small">Violations</div><div style="font-size:28px;font-weight:800">${verdict.violations.length}</div></div>
    <div class="card"><div class="small">Contracts</div><div style="font-size:28px;font-weight:800">${artifacts.abiRegistry.contracts.length}</div></div>
    <div class="card"><div class="small">Loans</div><div style="font-size:28px;font-weight:800">${artifacts.loanRegistry.loans.length}</div></div>
  </div>

  <div class="card">
    <h2 style="margin-top:0">Violations</h2>
    ${verdict.violations.length === 0 ? "<p>No violations found.</p>" : verdict.violations.map((v) => `<div class=\"violation sev-${v.severity}\"><strong>${v.ruleId}</strong> <span class=\"small\">${v.severity}</span><div>${v.message}</div>${v.stepIds?.length ? `<div class=\"small\">Steps: ${v.stepIds.map((id) => `<code>${id}</code>`).join(" ")}</div>` : ""}</div>`).join("")}
  </div>

  <div class="card" style="margin-top:14px">
    <h2 style="margin-top:0">Raw JSON</h2>
    <details><summary>View machine-readable output</summary><pre id="raw" style="white-space:pre-wrap;word-break:break-word"></pre></details>
  </div>
</div>
<script>
const payload = ${encode({ verdict, artifacts })};
document.getElementById('raw').textContent = JSON.stringify(payload, null, 2);
</script>
</body>
</html>`;
}

export async function serveReport(verdict: Verdict, artifacts: ArtifactBundle, port: number): Promise<void> {
  const html = buildHtml(verdict, artifacts);
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if ((req.url ?? "/") !== "/") {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }
    sendHtml(res, html);
  });

  await new Promise<void>((resolve) => {
    server.listen(port, "0.0.0.0", () => resolve());
  });
  console.error(`ESTH GUI available at http://localhost:${port}`);
}
