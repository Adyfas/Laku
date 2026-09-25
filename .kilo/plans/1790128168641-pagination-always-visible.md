# Plan: Always Show Pagination Controls in Laku Modules

## Goal
Modify the shared pagination controller to always display the pagination UI (container, page info, navigation controls, page size selector) regardless of the number of filtered items or current page count. This ensures users can interact with pagination controls even when there is zero or minimal data.

## Changes Required

### File: `javascript/core/pagination.js`
Locate the `updatePaginationUI` function inside the `createPaginationController` closure.

**Current code:**
```js
/** Update pagination UI */
const updatePaginationUI = (pagination) => {
  const paginationEl = document.getElementById("pagination");
  if (!paginationEl) return;

  if (pagination.totalPages > 1) {
    paginationEl.classList.remove("hidden");
  } else {
    paginationEl.classList.add("hidden");
  }

  // ... rest of UI updates (startIndex, endIndex, etc.)
};
```

**Modified code:**
```js
/** Update pagination UI - always show container */
const updatePaginationUI = (pagination) => {
  const paginationEl = document.getElementById("pagination");
  if (!paginationEl) return;

  // Always show pagination container regardless of totalPages
  paginationEl.classList.remove("hidden");

  // ... rest of UI updates (startIndex, endIndex, etc.) remain unchanged
};
```

### Rationale
- The pagination container starts with `class="... hidden"` in each module's HTML template.
- Previously, the container was only shown when `totalPages > 1` (i.e., more than one page of data).
- After this change, the container will always be visible, allowing users to:
  - See page info like "Menampilkan 0 sampai 0 dari 0 data" when no items match filters.
  - Change the page size via the dropdown even with zero items.
  - Observe disabled Prev/Next buttons appropriately (logic unchanged).
- This matches the user's request to "munculkan saja opsi paginationnya" (always show pagination options) regardless of data count.

## Validation Steps
After applying this change, verify in each module (HPP, Kas, Utang, Inventory, Produksi):
1. With zero items:
   - Pagination container is visible (not hidden).
   - Page info shows "Menampilkan 0 sampai 0 dari 0 data".
   - Page size selector shows default value (e.g., 10).
   - Prev button disabled, Next button disabled.
2. With items fewer than pageSize (e.g., 3 items, pageSize=10):
   - Pagination container visible.
   - Page info shows "Menampilkan 1 sampai 3 dari 3 data".
   - Prev/Next buttons disabled.
3. With items exceeding pageSize (e.g., 25 items, pageSize=10):
   - Pagination container visible.
   - Page info updates correctly per page.
   - Prev/Next buttons enabled/disabled as appropriate.
4. Changing page size via dropdown updates state and re-renders correctly.
5. Search/filter interactions reset to page 1 and update pagination UI.
6. State persistence (localStorage) continues to work as expected.

## Notes
- This change affects all five modules (HPP, Kas, Utang, Inventory, Produksi) since they share the same pagination controller.
- No changes are needed to individual module HTML templates or client files beyond the shared controller update.
- Ensure the `defaultPageSize` value in each module's controller call matches an existing `<option>` in the page size `<select>` to avoid undefined behavior.

## Implementation
This plan is ready for execution by an implementation-capable agent.