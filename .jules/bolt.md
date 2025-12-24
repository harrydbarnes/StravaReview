## 2024-05-23 - Date String Optimization
**Learning:** `new Date().toISOString().split('T')[0]` is expensive in loops.
- For max speed on known ISO strings: `isoString.substring(0, 10)` (~600x faster).
- For safety with mixed types: Check type first or use `date.toISOString().substring(0, 10)`.
- Standardizing on UTC for all derived metrics (Month, Day, Hour) ensures consistent analytics regardless of the user's timezone.
**Action:** Always check input types before optimizing. Prefer raw string manipulation for ISO dates but include fallbacks. Use `timeZone: 'UTC'` in Intl formatters for consistency.
