import express from "express";

const app = express();
const port = 3001;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// In-memory data keeps the demo self-contained and disposable.
const comments = [];

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const page = ({ safe = false, message = "" } = {}) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>XSS Classroom Demo</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;line-height:1.5}
    .card{border:1px solid #ddd;border-radius:12px;padding:18px;margin:16px 0}
    textarea{width:100%;min-height:90px;box-sizing:border-box}
    button{padding:10px 14px;margin-top:8px;cursor:pointer}
    code{background:#f4f4f4;padding:2px 5px;border-radius:4px}
    .bad{background:#fff3f3}.good{background:#f1fff4}
    .comment{padding:12px;border-top:1px solid #eee}
  </style>
</head>
<body>
  <h1>Stored XSS Classroom Demo</h1>
  <p>This app intentionally contains a vulnerable rendering mode. Use only the harmless payloads shown below.</p>

  <div class="card ${safe ? "good" : "bad"}">
    <strong>Current mode:</strong> ${safe ? "SAFE — HTML is escaped" : "VULNERABLE — untrusted HTML is inserted"}
    <p>
      ${safe
        ? "The server escapes user input before placing it in HTML."
        : "The server puts user input directly inside the HTML response, so browser markup can be interpreted."}
    </p>
    <a href="/?safe=${safe ? "0" : "1"}">Switch to ${safe ? "vulnerable" : "safe"} mode</a>
  </div>

  <div class="card">
    <h2>Add a comment</h2>
    <form method="post" action="/comment">
      <textarea name="text" placeholder="Try: <b>Hello class!</b>"></textarea>
      <input type="hidden" name="safe" value="${safe ? "1" : "0"}" />
      <button type="submit">Post comment</button>
    </form>
    <p><strong>Safe visual payload:</strong> <code>&lt;img src=x onerror=&quot;alert('XSS demo')&quot;&gt;</code></p>
    <p>This payload only shows an alert. Do not replace it with credential/token collection.</p>
  </div>

  ${message ? `<div class="card"><strong>${escapeHtml(message)}</strong></div>` : ""}

  <div class="card">
    <h2>Comments</h2>
    ${comments.length === 0 ? "<p>No comments yet.</p>" : comments.map((comment) => `
      <div class="comment">${safe ? escapeHtml(comment) : comment}</div>
    `).join("")}
  </div>

  <div class="card">
    <h2>What to teach</h2>
    <ol>
      <li>Untrusted input is stored.</li>
      <li>The vulnerable mode inserts it as HTML.</li>
      <li>The browser parses that HTML in the application's origin.</li>
      <li>Escaping converts markup into plain text.</li>
      <li>For rich text, use a well-maintained sanitizer rather than blindly trusting input.</li>
    </ol>
  </div>
</body>
</html>`;

app.get("/", (req, res) => {
  res.type("html").send(page({ safe: req.query.safe === "1" }));
});

app.post("/comment", (req, res) => {
  const text = String(req.body.text ?? "");
  if (text.length > 5000) return res.status(400).send("Comment too long");
  comments.push(text);
  res.redirect(`/?safe=${req.body.safe === "1" ? "1" : "0"}`);
});

app.listen(port, () => {
  console.log(`XSS demo running at http://localhost:${port}`);
});
