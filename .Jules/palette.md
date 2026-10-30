## 2024-10-30 - Missing Accessible Names on Icon-Only Elements
**Learning:** Found a widespread pattern across the application where icon-only buttons (like navigation triggers, settings, and back buttons) lacked `aria-label` attributes, making them inaccessible to screen readers.
**Action:** When adding new icon-only buttons or reviewing PRs, verify that an `aria-label` is always provided for accessibility.
