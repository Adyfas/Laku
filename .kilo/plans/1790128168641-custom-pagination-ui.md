# Plan: Implement Custom Pagination UI Across All Laku Modules

## Goal
Replace the existing pagination UI in all five modules (HPP, Kas, Utang, Inventory, Produksi) with a custom pagination UI design provided by the user, while maintaining functionality through the shared pagination controller.

## User-Provided Pagination UI Template
The user has supplied a preferred pagination UI structure with the following characteristics:
- Uses icon-based navigation buttons (arrowRight) instead of text labels
- Includes a rotation transform on the previous button
- Features specific spacing and layout classes
- Maintains all necessary ID hooks for the shared pagination controller
- Follows the module-specific ID naming convention (e.g., hpp*, kas*, utang*, etc.)

## Modules to Update
1. **HPP** (Hitung Modal & Harga Jual) - `javascript/apps/hpp/hppApp.js`
2. **Kas** (Catat Keuangan Harian) - `javascript/apps/kas/kasApp.js`  
3. **Utang** (Catat Utang & Piutang) - `javascript/apps/utang/utangApp.js`
4. **Inventory** (Stok Barang & Bahan) - `javascript/apps/inventory/inventoryApp.js`
5. **Produksi** (Produksi Barang) - `javascript/apps/produksi/produksiApp.js`

## Implementation Approach
For each module, replace the existing pagination controls section in the App.js file with a customized version of the user's template, where:
- All ID attributes use the module-specific prefix (e.g., `hpp` → `kas` for Kas module)
- The icon references `${I.svg("arrowRight")}` remain unchanged (assuming window.LakuIcons is available)
- All other classes, structure, and attributes are preserved exactly as provided
- The shared pagination controller in `javascript/core/pagination.js` remains unchanged (already handles always-visible behavior)

## Required Changes per Module

### HPP Module
File: `javascript/apps/hpp/hppApp.js`
- Locate existing pagination controls (around lines 341-361)
- Replace with user's template using `hpp` prefix:
  - `id="hppPagination"`
  - `id="hppPageSizeSelect"`
  - `id="hppPrevPage"` 
  - `id="hppNextPage"`
  - `id="hppCurrentPage"`
  - `id="hppTotalPages"`
  - `id="hppStartIndex"`
  - `id="hppEndIndex"`
  - `id="hppTotalCount"`

### Kas Module
File: `javascript/apps/kas/kasApp.js`
- Locate existing pagination controls (around lines 115-135)
- Replace with user's template using `kas` prefix:
  - `id="kasPagination"`
  - `id="kasPageSizeSelect"`
  - `id="kasPrevPage"`
  - `id="kasNextPage"`
  - `id="kasCurrentPage"`
  - `id="kasTotalPages"`
  - `id="kasStartIndex"`
  - `id="kasEndIndex"`
  - `id="kasTotalCount"`

### Utang Module
File: `javascript/apps/utang/utangApp.js`
- Locate existing pagination controls (around lines 135-147)
- Replace with user's template using `utang` prefix:
  - `id="utangPagination"`
  - `id="utangPageSizeSelect"`
  - `id="utangPrevPage"`
  - `id="utagNextPage"`
  - `id="utangCurrentPage"`
  - `id="utangTotalPages"`
  - `id="utangStartIndex"`
  - `id="utangEndIndex"`
  - `id="utangTotalCount"`

### Inventory Module
File: `javascript/apps/inventory/inventoryApp.js`
- Locate existing pagination controls (around lines 152-172)
- Replace with user's template using `inv` prefix:
  - `id="invPagination"`
  - `id="invPageSizeSelect"`
  - `id="invPrevPage"`
  - `id="invNextPage"`
  - `id="invCurrentPage"`
  - `id="invTotalPages"`
  - `id="invStartIndex"`
  - `id="invEndIndex"`
  - `id="invTotalCount"`

### Produksi Module
File: `javascript/apps/produksi/produksiApp.js`
- Locate existing pagination controls (around lines 35-55)
- Replace with user's template using `produksi` prefix:
  - `id="produksiPagination"`
  - `id="produksiPageSizeSelect"`
  - `id="produksiPrevPage"`
  - `id="produksiNextPage"`
  - `id="produksiCurrentPage"`
  - `id="produksiTotalPages"`
  - `id="produksiStartIndex"`
  - `id="produksiEndIndex"`
  - `id="produksiTotalCount"`

## Validation Checklist
After implementing these changes, verify for each module:
1. Pagination UI renders correctly with the new icon-based design
2. All ID attributes match the module-specific prefix
3. Page size selector contains options: 3, 10, 20, 30, 40, 50
4. Pagination controls are always visible (due to prior always-visible fix)
5. Page info displays correctly: "Menampilkan X sampai Y dari Z data"
6. Navigation buttons update state and disable/enable appropriately
7. Changing page size via dropdown updates display and triggers refresh
8. Search/filter interactions reset to page 1 and update pagination UI
9. State persistence (localStorage) continues to function
10. Existing module functionality (CRUD operations) remains unaffected

## Dependencies
- This plan assumes the shared pagination controller (`javascript/core/pagination.js`) is already implemented with:
  - Always-visible behavior (container never hidden)
  - Proper state management and event binding
  - Module-specific storage keys
- The user has already added `<option value="3">3</option>` to Kas and Utang page size selectors in previous changes
- All modules continue to use `window.LakuIcons.svg("arrowRight")` for navigation icons

## Risk Mitigation
- Changes are limited to UI template replacement in App.js files
- No modifications to pagination logic, state management, or event handling
- Preserves all existing ID references expected by the shared controller
- Maintains backward compatibility with all existing functionality