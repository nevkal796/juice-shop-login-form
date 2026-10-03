# Juice Shop Style Login Form

A minimal HTML + JavaScript login form built for a cybersecurity coursework
assignment exploring client-side validation, server-side validation
concepts, and common web vulnerabilities (XSS, SQL Injection) using
OWASP Juice Shop as a reference application.

## What this project does

- Renders a simple email + password login form styled after Juice Shop's
  login page.
- Performs client-side validation on submit:
  - Rejects empty email or password fields.
  - Requires the email field to contain an "@" character.
  - Requires the password to be at least 8 characters long.
- On successful validation, displays a "Welcome, {email}" message on the
  page.

## Running it

No build step or server required.

1. Clone this repo.
2. Open `index.html` directly in any browser.
3. Enter an email and password and submit the form.

## Server-side validation (why it matters)

This project only implements client-side validation, which is enough to
demonstrate the concept for this assignment, but client-side checks alone
are not a real security control: a user can disable JavaScript or send
requests directly to a server's API, bypassing any checks written only in
the browser. A production version of this form would need the exact same
checks (and more, like email format verification, rate limiting Login
attempts, and credential checks) repeated on the server before it accepts
a submission, since the server is the only place validation cannot be
bypassed by the client.

Example of secure password handling on a real server (Node.js, using
bcrypt to hash passwords before storing them, never storing plaintext):

```javascript
const bcrypt = require('bcrypt');

async function registerUser(email, plainTextPassword) {
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(plainTextPassword, saltRounds);
  // store `email` and `passwordHash` in the database — never the raw password
}

async function verifyLogin(plainTextPassword, storedHash) {
  return bcrypt.compare(plainTextPassword, storedHash);
}
```

## Known vulnerability (intentional, for Part 3 of this assignment)

The welcome message is rendered using `element.innerHTML = 'Welcome, ' +
email + '!'`, which inserts the raw value of the email field directly into
the page's HTML. If the email field contains HTML or JavaScript instead of
a plain email address, the browser will render or execute it. This is a
reflected Cross-Site Scripting (XSS) pattern: the page reflects
unsanitized input straight back into the DOM.

### Fix

Replace the vulnerable line with:

```javascript
welcomeEl.textContent = 'Welcome, ' + email + '!';
```

`.textContent` inserts the value as plain text rather than parsing it as
HTML, so any injected markup or script tags are displayed literally
instead of being executed. For input that does need to render as HTML,
the correct fix is to sanitize it first (e.g. with a library like
DOMPurify) rather than inserting it unescaped.
