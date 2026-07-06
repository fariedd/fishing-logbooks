/* Trip persistence — localStorage, autosaves on every change.
   Deleted trips move to a bin and self-destruct 7 days after deletion. */

const STORE_KEY = "dsl_trips_v1";
const BIN_KEY = "dsl_bin_v1";
const BIN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // exactly 7 days

const Storage = {
  _readAll() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch {
      return [];
    }
  },
  _writeAll(trips) {
    localStorage.setItem(STORE_KEY, JSON.stringify(trips));
  },
  _readBin() {
    try {
      return JSON.parse(localStorage.getItem(BIN_KEY)) || [];
    } catch {
      return [];
    }
  },
  _writeBin(trips) {
    localStorage.setItem(BIN_KEY, JSON.stringify(trips));
  },

  /* Drop any binned trips whose 7-day window has elapsed. Runs on every read,
     so the timer is wall-clock based and unaffected by inactivity. */
  _purgeExpired() {
    const now = Date.now();
    const kept = this._readBin().filter(t => (t.purgeAt || 0) > now);
    if (kept.length !== this._readBin().length) this._writeBin(kept);
    return kept;
  },

  listTrips() {
    return this._readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },

  listBin() {
    return this._purgeExpired().sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  },

  getTrip(id) {
    return this._readAll().find(t => t.id === id) || null;
  },

  createTrip(type) {
    const trip = {
      id: "trip_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type, // 'freezer'
      status: "in_progress", // in_progress | submitted
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cover: {},
      pages: [], // { id, kind: 'header'|'catch', data: {} }
    };
    const trips = this._readAll();
    trips.push(trip);
    this._writeAll(trips);
    return trip;
  },

  saveTrip(trip) {
    trip.updatedAt = Date.now();
    const trips = this._readAll();
    const i = trips.findIndex(t => t.id === trip.id);
    if (i >= 0) trips[i] = trip; else trips.push(trip);
    this._writeAll(trips);
  },

  /* Move a trip to the bin with a fixed 7-day self-destruct timer. */
  binTrip(id) {
    const trips = this._readAll();
    const trip = trips.find(t => t.id === id);
    if (!trip) return;
    this._writeAll(trips.filter(t => t.id !== id));
    trip.deletedAt = Date.now();
    trip.purgeAt = trip.deletedAt + BIN_TTL_MS;
    const bin = this._purgeExpired();
    bin.push(trip);
    this._writeBin(bin);
  },

  /* Restore a binned trip back to the active list. */
  restoreTrip(id) {
    const bin = this._purgeExpired();
    const trip = bin.find(t => t.id === id);
    if (!trip) return;
    this._writeBin(bin.filter(t => t.id !== id));
    delete trip.deletedAt;
    delete trip.purgeAt;
    trip.updatedAt = Date.now();
    const trips = this._readAll();
    trips.push(trip);
    this._writeAll(trips);
  },

  /* Permanently remove a binned trip before its timer ends. */
  purgeTrip(id) {
    this._writeBin(this._purgeExpired().filter(t => t.id !== id));
  },

  addPage(trip, kind) {
    const page = {
      id: "pg_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      kind, // 'header' | 'catch'
      data: kind === "header"
        ? { periods: Array.from({ length: MAX_PERIODS }, () => ({})), remarks: "", skipperName: "", signature: "" }
        : { date: "", masses: {}, others: Array.from({ length: OTHERS_ROWS }, () => ({})), fuel: "" },
    };
    trip.pages.push(page);
    this.saveTrip(trip);
    return page;
  },

  removePage(trip, pageId) {
    trip.pages = trip.pages.filter(p => p.id !== pageId);
    this.saveTrip(trip);
  },
};
