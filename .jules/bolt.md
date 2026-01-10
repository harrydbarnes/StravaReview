## 2024-05-23 - Date String Optimization
**Learning:** `(new Date(dateString)).toISOString().split('T')[0]` is expensive in loops.
- For max speed on known ISO strings: `isoString.substring(0, 10)` (~600x faster).
- For safety with mixed types: Check type first or use `date.toISOString().substring(0, 10)`.
- Standardizing on UTC for all derived metrics (Month, Day, Hour) ensures consistent analytics regardless of the user's timezone.
**Action:** Always check input types before optimizing. Prefer raw string manipulation for ISO dates but include fallbacks. Use `timeZone: 'UTC'` in Intl formatters for consistency.

## 2024-05-23 - Integer Math for Date Calculations
**Learning:** Replacing `new Date()` with integer math (Zeller's algorithm, integer ISO week logic) yields massive performance gains (~13x faster).
- However, optimizations must respect existing data types (e.g., maintaining `Date` objects vs strings) to avoid breaking downstream consumers.
- Precision matters: "Optimization" via string truncation (`YYYY-MM-DD`) caused data loss (time component) and logic errors (same-day sorting).
**Action:** When implementing low-level math optimizations, explicitly verify that the output data structure matches the original API contract exactly (types, precision, and content). Use full timestamp strings for comparisons to preserve time precision while avoiding object allocation.
