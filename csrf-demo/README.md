# CSRF Demo

## Run

```bash
npm install
npm start
```

Open `http://localhost:3002/login` first. This creates a synthetic session cookie and a per-session CSRF token.

Then open `http://localhost:3002/attacker.html` and click **Trigger CSRF demo**.

### What students should observe

- The attacker's page does not know the session cookie.
- The browser still sends the authentication cookie with the request.
- The vulnerable endpoint trusts the cookie alone and accepts the request.
- The protected endpoint requires an additional unpredictable CSRF token, so the attacker page cannot create a valid request.

The demo uses `SameSite=Lax` as a realistic cookie setting and still demonstrates why a CSRF defense belongs on state-changing endpoints.
