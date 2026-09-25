/**
 * pagination.js — Shared pagination utility for Laku modules
 * Centralizes pagination logic: filtering, slicing, UI updates, event binding
 */
(function () {
  "use strict";

  /**
   * Create a pagination controller for a module
   * @param {Object} config
   * @param {string} config.storageKey - localStorage key for UI state persistence
   * @param {Function} config.getData - Function returning raw data array
   * @param {Function} config.filterFn - Function(item, state) => boolean for custom filtering
   * @param {Object} config.elements - DOM element IDs
   * @param {string} config.elements.searchInput
   * @param {string} [config.elements.typeFilter]
   * @param {string} [config.elements.statusFilter]
   * @param {string} [config.elements.dateStart]
   * @param {string} [config.elements.dateEnd]
   * @param {string} config.elements.pageSizeSelect
   * @param {string} config.elements.prevPage
   * @param {string} config.elements.nextPage
   * @param {string} config.elements.currentPage
   * @param {string} config.elements.totalPages
   * @param {string} config.elements.startIndex
   * @param {string} config.elements.endIndex
   * @param {string} config.elements.totalCount
   * @param {string} config.elements.paginationContainer
   * @param {string} [config.elements.clearFilters]
   * @param {Function} config.onChange - Callback when page/data changes (receives paginated items)
   * @param {number} [config.defaultPageSize=10]
   * @param {number} [config.debounceMs=300]
   * @returns {Object} Controller with { refresh, getState, setState, destroy }
   */
  function createPaginationController(config) {
    const {
      storageKey,
      getData,
      filterFn,
      elements,
      onChange,
      defaultPageSize = 10,
      debounceMs = 300,
    } = config;

    const el = (id) => document.getElementById(id);

    // Default UI state
    let state = {
      searchTerm: "",
      typeFilter: "all",
      statusFilter: "all",
      dateStart: "",
      dateEnd: "",
      currentPage: 1,
      pageSize: defaultPageSize,
    };

    // Load persisted state
    function loadState() {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          state = { ...state, ...parsed };
        }
      } catch (e) {
        console.warn(`Failed to load pagination state for ${storageKey}`, e);
      }
    }

    // Save state
    function saveState() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (e) {
        console.warn(`Failed to save pagination state for ${storageKey}`, e);
      }
    }

    // Apply filters and pagination
    function getPaginatedData() {
      const data = getData();
      let filtered = data.filter((item) => filterFn(item, state));

      const pageSize = state.pageSize || defaultPageSize;
      const currentPage = state.currentPage || 1;
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize) || 1;
      const startIdx = (currentPage - 1) * pageSize;
      const endIdx = Math.min(startIdx + pageSize, totalItems);
      const items = filtered.slice(startIdx, endIdx);

      return {
        items,
        totalItems,
        totalPages,
        currentPage,
        pageSize,
        startIdx: totalItems > 0 ? startIdx + 1 : 0,
        endIdx,
      };
    }

    // Update pagination UI — always show pagination controls
    function updatePaginationUI(pagination) {
      const container = el(elements.paginationContainer);
      if (!container) return;

      container.classList.remove("hidden");

      const startIndexEl = el(elements.startIndex);
      if (startIndexEl) startIndexEl.textContent = pagination.startIdx;
      const endIndexEl = el(elements.endIndex);
      if (endIndexEl) endIndexEl.textContent = pagination.endIdx;
      const totalCountEl = el(elements.totalCount);
      if (totalCountEl) totalCountEl.textContent = pagination.totalItems;
      const currentPageEl = el(elements.currentPage);
      if (currentPageEl) currentPageEl.textContent = pagination.currentPage;
      const totalPagesEl = el(elements.totalPages);
      if (totalPagesEl) totalPagesEl.textContent = pagination.totalPages;

      const prevBtn = el(elements.prevPage);
      if (prevBtn) prevBtn.disabled = pagination.currentPage <= 1;
      const nextBtn = el(elements.nextPage);
      if (nextBtn) nextBtn.disabled = pagination.currentPage >= pagination.totalPages;
    }

    // Update filter/input controls from state
    function updateControls() {
      const searchInput = el(elements.searchInput);
      if (searchInput) searchInput.value = state.searchTerm || "";

      if (elements.typeFilter) {
        const typeFilter = el(elements.typeFilter);
        if (typeFilter) typeFilter.value = state.typeFilter || "all";
      }

      if (elements.statusFilter) {
        const statusFilter = el(elements.statusFilter);
        if (statusFilter) statusFilter.value = state.statusFilter || "all";
      }

      if (elements.dateStart) {
        const dateStart = el(elements.dateStart);
        if (dateStart) dateStart.value = state.dateStart || "";
      }

      if (elements.dateEnd) {
        const dateEnd = el(elements.dateEnd);
        if (dateEnd) dateEnd.value = state.dateEnd || "";
      }

      const pageSizeSelect = el(elements.pageSizeSelect);
      if (pageSizeSelect) pageSizeSelect.value = String(state.pageSize || defaultPageSize);
    }

    // Debounce helper
    function debounce(fn, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    }

    // Bind all event listeners
    let bound = false;
    function bindEvents() {
      if (bound) return;
      bound = true;

      // Search input
      const searchInput = el(elements.searchInput);
      if (searchInput) {
        searchInput.addEventListener("input", debounce((e) => {
          state.searchTerm = e.target.value;
          state.currentPage = 1;
          saveState();
          refresh();
        }, debounceMs));
      }

      // Type filter
      if (elements.typeFilter) {
        const typeFilter = el(elements.typeFilter);
        if (typeFilter) {
          typeFilter.addEventListener("change", (e) => {
            state.typeFilter = e.target.value;
            state.currentPage = 1;
            saveState();
            refresh();
          });
        }
      }

      // Status filter
      if (elements.statusFilter) {
        const statusFilter = el(elements.statusFilter);
        if (statusFilter) {
          statusFilter.addEventListener("change", (e) => {
            state.statusFilter = e.target.value;
            state.currentPage = 1;
            saveState();
            refresh();
          });
        }
      }

      // Date start
      if (elements.dateStart) {
        const dateStart = el(elements.dateStart);
        if (dateStart) {
          dateStart.addEventListener("change", (e) => {
            state.dateStart = e.target.value;
            state.currentPage = 1;
            saveState();
            refresh();
          });
        }
      }

      // Date end
      if (elements.dateEnd) {
        const dateEnd = el(elements.dateEnd);
        if (dateEnd) {
          dateEnd.addEventListener("change", (e) => {
            state.dateEnd = e.target.value;
            state.currentPage = 1;
            saveState();
            refresh();
          });
        }
      }

      // Page size
      const pageSizeSelect = el(elements.pageSizeSelect);
      if (pageSizeSelect) {
        pageSizeSelect.addEventListener("change", (e) => {
          state.pageSize = parseInt(e.target.value, 10);
          state.currentPage = 1;
          saveState();
          refresh();
        });
      }

      // Clear filters
      if (elements.clearFilters) {
        const clearBtn = el(elements.clearFilters);
        if (clearBtn) {
          clearBtn.addEventListener("click", () => {
            state = {
              searchTerm: "",
              typeFilter: "all",
              statusFilter: "all",
              dateStart: "",
              dateEnd: "",
              currentPage: 1,
              pageSize: defaultPageSize,
            };
            saveState();
            refresh();
          });
        }
      }

      // Prev page
      const prevBtn = el(elements.prevPage);
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (state.currentPage > 1) {
            state.currentPage--;
            saveState();
            refresh();
          }
        });
      }

      // Next page
      const nextBtn = el(elements.nextPage);
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          const pagination = getPaginatedData();
          if (state.currentPage < pagination.totalPages) {
            state.currentPage++;
            saveState();
            refresh();
          }
        });
      }
    }

    // Public refresh: recompute + update UI + call onChange
    function refresh() {
      const pagination = getPaginatedData();
      updateControls();
      updatePaginationUI(pagination);
      if (onChange) onChange(pagination.items, pagination);
    }

    // Initialize
    loadState();
    bindEvents();

    return {
      refresh,
      getState: () => ({ ...state }),
      setState: (newState) => {
        state = { ...state, ...newState };
        saveState();
        refresh();
      },
      getPaginatedData,
      destroy: () => {
        // Note: Event listeners not removed for simplicity; would need to store references
        bound = false;
      },
    };
  }

  // Expose globally
  window.LakuPagination = { createPaginationController };
})();