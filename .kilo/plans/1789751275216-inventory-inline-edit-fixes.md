---
name: Inventory Inline Edit Fixes
description: Fix empty row deletion, delete in mobile view, and mobile list rendering
type: plan
status: ready
---

# Plan: Inventory Inline Edit Bug Fixes

## Tujuan

Memperbaiki 3 bug yang ditemukan setelah implementasi inline edit inventory:
1. Barang dengan nested level (anak) yang kosong tidak bisa dihapus
2. Tombol delete tidak berfungsi di mobile view
3. List mobile tidak terlihat saat mode mobile

## Root Causes

### Bug 1: Empty nested level row cannot be deleted
- **File**: `javascript/apps/inventory/inventoryClient.js` ~line 737-755
- **Cause**: Remove handler checks `if (!id) return` where `id` comes from `parseInt(row.querySelector("[data-edit-nesting-unit]")?.getAttribute("data-edit-nesting-unit"))`. When row is empty/unfilled, querySelector returns null, `?.getAttribute()` returns undefined, `parseInt(undefined)` returns NaN, `!NaN` is true → early return, deletion blocked.
- **Fix**: Change guard from `if (!id) return` to `if (!Number.isFinite(index)) return`. Check index (always present via `data-nesting-index`) instead of id (which can be NaN).

### Bug 2: Delete doesn't work in mobile view
- **File**: `javascript/apps/inventory/inventoryClient.js` ~line 793-822
- **Cause**: `document.querySelector("#inventoryTableBody, #inventoryMobileList")` only returns the FIRST matching element (`#inventoryTableBody`). Delete listener only attached to table body, not mobile list.
- **Fix**: Find common parent container using `document.querySelector("#inventoryTableBody")?.parentElement` or `document.getElementById("inventoryMobileList")?.parentElement` and attach listener there. Event delegation will then cover both views.

### Bug 3: Mobile list not visible
- **File**: `javascript/apps/inventory/inventoryClient.js` ~line 626
- **Cause**: Original code `if (mobileList) mobileHtml ? (mobileList.innerHTML = mobileHtml) : null` could skip assignment when mobileHtml is empty string.
- **Fix (already applied)**: Changed to `if (mobileList) { mobileList.innerHTML = mobileHtml || ""; }`
- **Remaining**: Verify with browser dev tools. If still not visible, check CSS class `block lg:hidden` on `#inventoryMobileList` in `javascript/apps/inventory/inventoryApp.js:129`.

## Task List

### Task 1 — Fix empty row deletion in nested levels

**File**: `javascript/apps/inventory/inventoryClient.js`

1. Find the `remove-nesting-edit` event handler
2. Replace `if (!id) return` with `if (!Number.isFinite(index)) return`
3. Change id-based draft update to index-based (allow null id)
4. Make re-indexing more robust by using parentElement.id instead of hardcoded selector

**Acceptance**:
- Empty nested level row can be deleted via X button
- Filled nested level row can still be deleted
- Re-indexing works correctly after deletion

### Task 2 — Fix delete event delegation for mobile view

**File**: `javascript/apps/inventory/inventoryClient.js`

1. Find delete event listener binding
2. Change from `querySelector("#inventoryTableBody, #inventoryMobileList")` to finding common parent:
   ```javascript
   const tableBody = document.getElementById("inventoryTableBody");
   const mobileList = document.getElementById("inventoryMobileList");
   let deleteTarget = tableBody?.parentElement;
   if (mobileList && mobileList.parentElement) {
     deleteTarget = mobileList.parentElement;
   }
   ```
3. Use `deleteTarget` for addEventListener/removeEventListener

**Acceptance**:
- Delete works in desktop view
- Delete works in mobile view (dev tools mobile or actual mobile)

### Task 3 — Verify mobile list rendering

**Files**: `javascript/apps/inventory/inventoryClient.js`, `javascript/apps/inventory/inventoryApp.js`

1. Verify `#inventoryMobileList` has `class="block lg:hidden"` in app template
2. Verify `renderTable()` sets `mobileList.innerHTML = mobileHtml || ""`
3. Test with browser dev tools device toolbar

**Acceptance**:
- Mobile list visible when viewport < 1024px
- Mobile list hidden when viewport >= 1024px
- Data renders correctly in mobile list

## Validation Checklist

- [ ] Empty nested level row can be deleted
- [ ] Filled nested level row can be deleted
- [ ] Delete works on desktop view
- [ ] Delete works on mobile view (dev tools)
- [ ] Mobile list visible on small screens
- [ ] Mobile list hidden on large screens
- [ ] No console errors
- [ ] Nested levels save correctly with data
- [ ] Nested levels save correctly without data (empty rows removed)
