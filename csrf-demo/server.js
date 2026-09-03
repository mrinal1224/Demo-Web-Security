import express from "express";
import cookieParser from "cookie-parser";
import crypto from "node:crypto";

const app = express();
const port = 3002;
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const csrfTokens = new Map();

const victimPage = (req, res) => {
  const token = req.cookies.session;
  const csrfToken = token ? csrfTokens.get(token) : null;
  const balance = req.query.balance ?? "₹10,000";
  const status = req.query.status ?? "";

  res.type("html").send(`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CSRF Demo</title>
<style>body{font-family:system-ui,sans-serif;max-width:820px;margin:40px auto;padding:0 20px}.card{border:1px solid #ddd;border-radius:12px;padding:18px;margin:16px 0}button{padding:10px 14px;cursor:pointer}code{background:#f4f4f4;padding:2px 5px;border-radius:4px}.v{background:#fff5f5}.s{background:#f3fff6}</style></head>
<body>
<h1>CSRF Classroom Demo</h1>
<div class="card"><strong>Demo account balance:</strong> ${balance}</div>
<div class="card"><strong>Session:</strong> ${token ? "Logged in" : "Logged out"}</div>
${status ? `<div class="card"><strong>${status}</strong></div>` : ""}
<div class="card v"><h2>1. Vulnerable endpoint</h2><p>Authentication is cookie-based and there is no CSRF token check.</p>
<form method="post" action="/transfer-vulnerable"><input type="hidden" name="amount" value="1000"><input type="hidden" name="to" value="classroom-demo"><button>Transfer ₹1,000</button></form></div>
<div class="card s"><h2>2. Protected endpoint</h2><p>A secret per-session CSRF token is required.</p>
<form method="post" action="/transfer-protected"><input type="hidden" name="amount" value="1000"><input type="hidden" name="to" value="classroom-demo"><input type="hidden" name="csrfToken" value="${csrfToken ?? ""}"><button>Transfer ₹1,000 safely</button></form></div>
<p><a href="/login">Reset / Login</a> · <a href="/attacker.html">Open attacker page</a></p>
</body></html>`);
};

app.get("/", victimPage);

app.get("/login", (req, res) => {
  const session = crypto.randomBytes(18).toString("hex");
  const csrfToken = crypto.randomBytes(32).toString("hex");
  csrfTokens.set(session, csrfToken);
  // Lax is deliberately retained so the demo reflects a common cookie configuration;
  // the protected endpoint additionally requires a CSRF token.
  res.cookie("session", session, { httpOnly: true, sameSite: "lax" });
  res.redirect("/?status=Logged%20in%20as%20Demo%20User");
});

const requireSession = (req, res) => {
  const session = req.cookies.session;
  if (!session) {
    res.status(401).send("Not logged in. Open /login first.");
    return null;
  }
  return session;
};

app.post("/transfer-vulnerable", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;
  // Intentionally vulnerable: cookie authentication only.
  res.redirect("/?balance=₹9,000&status=VULNERABLE%20endpoint%20accepted%20the%20request");
});

app.post("/transfer-protected", (req, res) => {
  const session = requireSession(req, res);
  if (!session) return;

  const expected = csrfTokens.get(session);
  const supplied = String(req.body.csrfToken ?? "");
  if (!expected || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
    return res.status(403).send("403 — CSRF token missing or invalid");
  }

  res.redirect("/?balance=₹9,000&status=Protected%20transfer%20accepted%20with%20a%20valid%20CSRF%20token");
});

app.get("/attacker.html", (req, res) => {
  res.type("html").send(`<!doctype html><html><head><meta charset="utf-8"><title>Attacker Site — CSRF Demo</title><style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px}.card{border:1px solid #ddd;border-radius:12px;padding:18px;margin:16px 0}code{background:#f4f4f4;padding:2px 5px;border-radius:4px}</style></head><body>
<h1>Attacker Page (Local Demo)</h1><div class="card"><p>This page automatically submits a cross-origin-style form to the vulnerable endpoint.</p>
<form id="attack" method="post" action="http://localhost:3002/transfer-vulnerable"><input type="hidden" name="amount" value="1000"><input type="hidden" name="to" value="classroom-demo"></form>
<p><button onclick="document.getElementById('attack').submit()">Trigger CSRF demo</button></p></div>
<div class="card"><p>Notice what is <strong>not</strong> present: the secret CSRF token. The protected endpoint requires that additional value.</p>
<p><a href="/">Back to victim app</a></p></div></body></html>`);
});

app.listen(port, () => console.log(`CSRF demo running at http://localhost:${port}`));
