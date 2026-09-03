# XSS Demo

## Run

```bash
npm install
npm start
```

Open `http://localhost:3001`.

## Live classroom sequence

1. Stay in **VULNERABLE** mode.
2. Submit the harmless payload shown on the page: `<img src=x onerror="alert('XSS demo')">`.
3. Explain that the browser interpreted the untrusted value as HTML.
4. Switch to **SAFE** mode and submit the same value.
5. The markup is displayed as text because it is escaped.

### Key concept

React's normal `{value}` rendering escapes HTML. `dangerouslySetInnerHTML` bypasses that protection, so it should never receive untrusted HTML without appropriate sanitization.
