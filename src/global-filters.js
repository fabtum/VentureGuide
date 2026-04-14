/**
 * Global Filter Store
 * -------------------
 * Stores Location & Industry filters that are shared across all tabs.
 * Set once on the landing page; can be updated from any tab's PFB.
 */

const state = {
  location: '',
  industry: '',
  investorLocation: '',
};

const listeners = [];

export function getGlobalFilters() {
  return { ...state };
}

export function setGlobalFilters({ location, industry, investorLocation }) {
  let changed = false;
  if (location !== undefined && location !== state.location) {
    state.location = location;
    changed = true;
  }
  if (industry !== undefined && industry !== state.industry) {
    state.industry = industry;
    changed = true;
  }
  if (investorLocation !== undefined && investorLocation !== state.investorLocation) {
    state.investorLocation = investorLocation;
    changed = true;
  }
  if (changed) {
    listeners.forEach(fn => fn({ ...state }));
  }
}

/**
 * Register a callback that fires whenever global filters change.
 * Returns an unsubscribe function.
 */
export function onGlobalFiltersChange(callback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}
