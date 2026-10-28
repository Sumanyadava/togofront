## 2024-10-28 - Cryptic Button Accessibility
**Learning:** Cryptic buttons (like single letters "L" or "S") need tooltips and ARIA labels. They confuse users otherwise and are fully inaccessible to screen readers.
**Action:** Always verify small button components for `aria-label` and `title` tags if the button content isn't self-explanatory.
