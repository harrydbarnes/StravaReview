## 2024-05-23 - Date String Optimization
**Learning:** `new Date().toISOString().split('T')[0]` is a common pattern but extremely expensive inside loops compared to simple string manipulation like `.substring(0, 10)` when the input is known to be an ISO string.
**Action:** Always check if the source date is already a string before creating Date objects just for formatting. Benchmarks showed ~600x improvement.
