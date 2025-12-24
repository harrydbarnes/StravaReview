## 2024-05-20 - Insecure Client Secret Storage
**Vulnerability:** The application stores the Strava Client Secret in `localStorage`, which persists indefinitely and is accessible to any script running on the same domain.
**Learning:** In client-side only applications (like this one using Authorization Code Flow without a backend proxy), secrets are inevitably exposed to the user. However, using `localStorage` increases the risk in shared environments.
**Prevention:** Use `sessionStorage` instead of `localStorage` for sensitive tokens to ensure they are cleared when the session ends.
