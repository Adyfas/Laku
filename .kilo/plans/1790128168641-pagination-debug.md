# Plan: Debug Pagination Not Showing in Laku Modules

## Goal
Identify why pagination controls (navigation, page info, page size selector) are not appearing in Laku modules despite having sufficient data and modified `defaultPageSize`.

## Affected Modules
All modules (HPP, Kas, Utang, Inventory, Produksi) use the shared pagination controller (`javascript/core/pagination.js`). The issue is most noticeable when `defaultPageSize` is set to a low value (e.g., 3) but pagination remains hidden.

## Common Causes
1. **Filtered item count ≤ pageSize** – After applying search/type/date filters, the number of matching items may be less than or equal to the current `pageSize`, resulting in `totalPages = 1` (pagination hidden).
2. **State persistence overriding defaultPageSize** – Saved UI state in `localStorage` (e.g., `laku_utang_ui_state`) may contain a `pageSize` value that overrides the `defaultPageSize` specified in the controller.
3. **Mismatch between defaultPageSize and `<select>` options** – If `defaultPageSize` is set to a value not present in the page size `<select>` (options: 10, 20, 30, 40, 50), the UI may show no selection, and the change handler may receive an empty string, leading to unexpected `pageSize` values.
4. **Pagination container not updated** – Rare: CSS or JS errors preventing the container from being shown (e.g., another script re-adding `hidden` class).

## Diagnostic Steps
For the module being tested (e.g., Utang), perform the following checks:

### 1. Verify Filtered Item Count > PageSize
- Open the browser console.
- Temporarily add a log in the pagination controller’s `getPaginatedData` method (in `pagination.js`) to output:
  ```js
  console.log('Filtered items:', filtered.length, 'PageSize:', state.pageSize);
  ```
- Reload the module and note the printed values.
- If `filtered.length <= state.pageSize`, pagination will be hidden by design. Increase the dataset or adjust filters (clear search, set typeFilter to "all") to increase the filtered count.

### 2. Check defaultPageSize Setting
- Locate the controller call in the module’s client file (e.g., `javascript/apps/utang/utangClient.js`):
  ```js
  const pagination = window.LakuPagination.createPaginationController({
    // ...
    defaultPageSize: 3, // <-- ensure this is your intended value
    debounceMs: 300,
  });
  ```
- Confirm the value matches what you expect.

### 3. Clear Persisted UI State
- Open Application > Local Storage in DevTools.
- Remove the key for the module’s UI state (e.g., `laku_utang_ui_state`).
- Reload the module. This forces the controller to use the `defaultPageSize` from step 2.

### 4. Validate Page Size Select Options
- Ensure the `<select id="utangPageSizeSelect">` in `utangApp.js` contains an option matching the `defaultPageSize`:
  ```html
  <option value="3">3</option> <!-- add if missing -->
  ```
- If the `defaultPageSize` is not in the list, either:
  - Add the matching option to the `<select>`, **or**
  - Change `defaultPageSize` to one of the existing values (10, 20, 30, 40, 50).

### 5. Inspect Pagination Container State
- In the Elements panel, locate the pagination container (e.g., `<div id="utangPagination">`).
- Check its class list:
  - If it contains `hidden`, pagination is being suppressed because `totalPages <= 1`.
  - If it does **not** contain `hidden` but you still see no controls, look for overlapping elements or `display: none` styles.
- Optionally, add a temporary log in `updatePaginationUI` (in `pagination.js`):
  ```js
  console.log('totalPages:', pagination.totalPages, 'container classList:', paginationEl.classList);
  ```

### 6. Reset to Known-Good Configuration (Optional)
- If the issue persists, temporarily revert `defaultPageSize` to `10` and verify pagination appears with sufficient data.
- Then gradually adjust to your desired value, ensuring the `<select>` options are updated accordingly.

## Expected Outcome
After confirming that `filtered.length > pageSize` and that the controller’s `defaultPageSize` is correctly loaded (and not overridden by stale state), the pagination controls should appear:
- Page size selector shows the current `pageSize`.
- “Menampilkan X sampai Y dari Z data” updates correctly.
- Prev/Next buttons are enabled/disabled based on current page.
- Container lacks the `hidden` class when `totalPages > 1`.

## Validation Plan
1. Clear localStorage for the module’s UI state.
2. Set `defaultPageSize` to a value present in the `<select>` (e.g., 10).
   - Add at least 11 items to the module.
   - Pagination should show (totalPages = 2).
3. Change `defaultPageSize` to 3 and add a matching `<option value="3">3</option>`.
   - Add at least 4 items.
   - Pagination should show (totalPages = ceil(items/3) > 1 when items > 3).
4. Test search/filter interactions ensure pagination updates correctly and stays visible when appropriate.

## Questions for User (if needed)
- Which module are you observing the issue in? (You showed Utang snippet.)
- Have you modified the `defaultPageSize` in the controller call (not just the HTML)?
- Did you clear the module’s localStorage after changing `defaultPageSize`?
- Is the filtered item count (after search/type/date filters) greater than the current `pageSize`?

Once you confirm the above, pagination should behave as expected.