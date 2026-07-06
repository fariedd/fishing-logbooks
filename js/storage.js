/* Trip persistence — localStorage, autosaves on every change. */

const STORE_KEY = "dsl_trips_v1";

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

  listTrips() {
    return this._readAll().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
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

  deleteTrip(id) {
    this._writeAll(this._readAll().filter(t => t.id !== id));
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
