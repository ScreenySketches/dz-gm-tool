// Storage polyfill: chrome.storage.local fallback to localStorage (pre/post-migration)
window.dzStorage = {
  _legacyMigrated: false,
  async get(keys) {
    return new Promise((resolve) => {
      if (chrome?.storage?.local) {
        chrome.storage.local.get(keys, resolve);
      } else {
        const data = {};
        keys.forEach(k => { data[k] = localStorage.getItem(k); });
        resolve(data);
      }
    });
  },
  async set(data) {
    return new Promise((resolve) => {
      if (chrome?.storage?.local) {
        chrome.storage.local.set(data, resolve);
      } else {
        Object.entries(data).forEach(([k,v]) => localStorage.setItem(k, v));
        resolve();
      }
    });
  },
  migrate() {
    if (this._legacyMigrated) return;
    const key = STORAGE_KEY;
    if (chrome?.storage?.local) {
      chrome.storage.local.get([key], (res) => {
        if (!res[key] && localStorage.getItem(key)) {
          const state = JSON.parse(localStorage.getItem(key));
          chrome.storage.local.set({[key]: state});
          localStorage.removeItem(key);
          this._legacyMigrated = true;
          console.log('Migrated localStorage → chrome.storage.local');
        }
      });
    }
  }
};

