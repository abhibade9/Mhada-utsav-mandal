/**
 * Real-time Live Synchronization Service for MHADA Towers Festival Portal
 * Enables instantaneous sync across tabs, windows, and component trees
 * when admin performs any Add, Edit, Delete, or Post actions.
 */

const SYNC_CHANNEL_NAME = "mhada_live_sync_bus";
const SYNC_STORAGE_KEY = "mhada_live_sync_tick";

let broadcastChannel = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (err) {
  console.warn("BroadcastChannel not supported, using storage event fallback:", err);
}

// Subscribers list
const subscribers = new Set();

// Listen to BroadcastChannel messages
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event?.data) {
      subscribers.forEach((cb) => {
        try {
          cb(event.data);
        } catch (e) {
          console.error("Error in sync subscriber:", e);
        }
      });
    }
  };
}

// Listen to window storage events (cross-tab fallback)
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === SYNC_STORAGE_KEY && e.newValue) {
      try {
        const payload = JSON.parse(e.newValue);
        subscribers.forEach((cb) => cb(payload));
      } catch (err) {
        // ignore
      }
    }
  });
}

/**
 * Trigger a real-time live sync notification
 * @param {string} entity - "announcements" | "events" | "contacts" | "config" | "all"
 * @param {any} [extraData] - optional payload
 */
export const triggerLiveSync = (entity = "all", extraData = null) => {
  const payload = {
    entity,
    timestamp: Date.now(),
    data: extraData
  };

  // Broadcast to same window subscribers immediately
  subscribers.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      console.error(e);
    }
  });

  // Broadcast across tabs via BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(payload);
    } catch (e) {
      // ignore
    }
  }

  // Cross-tab fallback via localStorage tick
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Subscribe to real-time sync updates
 * @param {function(payload): void} callback
 * @returns {function(): void} unsubscribe cleanup
 */
export const subscribeLiveSync = (callback) => {
  if (typeof callback !== "function") return () => {};
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
};
