# Web Security Demo — XSS & CSRF

A small, local-only classroom demo showing how XSS and CSRF happen and how common defenses stop them.

## Structure

- `xss-demo/` — standalone Express server + browser page for reflected/stored-style XSS demonstration.
- `csrf-demo/` — standalone Express server, victim page, and attacker page for cookie-based CSRF demonstration.

## Safety

Run only on your own machine / classroom lab. The examples use `localhost`, synthetic data, and visible browser effects. They do not collect credentials or make real-world requests.

## Requirements

- Node.js 18+

## XSS demo

```bash
cd xss-demo
npm install
npm start
```

Open <http://localhost:3001>.

The demo has a vulnerable rendering mode and a safe rendering mode. Try the built-in harmless payloads and then switch to the safe mode.

## CSRF demo

```bash
cd csrf-demo
npm install
npm start
```

Open <http://localhost:3002> in one tab and <http://localhost:3002/attacker.html> in another.

Login first, then trigger the attacker page. The vulnerable endpoint accepts the forged request because the browser automatically attaches the authentication cookie. The protected endpoint requires an anti-CSRF token and rejects the forged request.

## Important concepts

### XSS

The application accidentally treats untrusted input as HTML/JavaScript. The browser executes attacker-controlled code in the application's origin.

Primary defenses:

- Prefer normal React rendering / HTML escaping.
- Avoid `dangerouslySetInnerHTML` for untrusted content.
- Sanitize HTML when HTML really must be accepted.
- Add a strong Content Security Policy as defense in depth.

### CSRF

A browser may automatically attach cookies to a cross-site request. If a state-changing endpoint authenticates only with a cookie and has no CSRF defense, another site can attempt to trigger an action on behalf of the logged-in user.

Primary defenses:

- SameSite cookies where appropriate.
- CSRF tokens for state-changing requests.
- Origin / Referer validation as additional protection.
- Do not use GET for state-changing operations.
