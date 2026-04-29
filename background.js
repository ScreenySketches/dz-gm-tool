// D&amp;Z GM Tool — Background Service Worker (Manifest v3)
// Handles OBR room metadata sync + chrome.storage bridge

const OBR_NAMESPACE = &#39;com.dzgm.tool&#39;;
const OBR_ROOM_KEY = OBR_NAMESPACE + &#39;/sync&#39;;
const STORAGE_KEY = &#39;dz-gm-tool-v1&#39;;

// Bridge: Listen for storage changes from popup/content script → push to OBR room
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== &#39;local&#39; &amp;&amp; area !== &#39;sync&#39;) return;
  
  if (changes[STORAGE_KEY]) {
    await pushStateToOBR();
  }
});

// On install/update: Migrate localStorage → chrome.storage.local
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === &#39;install&#39; || details.reason === &#39;update&#39;) {
    try {
      // Legacy migration (if localStorage accessible in SW context)
  // localStorage not available in SW context; skip legacy migration
      if (legacy) {
        const state = JSON.parse(legacy);
        await chrome.storage.local.set({ [STORAGE_KEY]: state });
        console.log(&#39;Migrated legacy localStorage to chrome.storage.local&#39;);
      }
    } catch (e) {
      console.warn(&#39;Legacy migration failed (expected in SW context):&#39;, e);
    }
  }
});

// OBR Context Detection + Room Listener (GM syncs to players)
chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name !== &#39;dz-obr-bridge&#39;) return;
  
  port.onMessage.addListener(async (msg, port) => {
    if (msg.action === &#39;pushToOBR&#39;) {
      await pushStateToOBR();
      port.postMessage({ success: true });
    } else if (msg.action === &#39;pullFromOBR&#39;) {
      const metadata = await pullOBRMetadata();
      port.postMessage({ metadata });
    }
  });
});

async function pushStateToOBR() {
  try {
    const { OBR } = await getOBRRuntime();
    if (!OBR || !OBR.room) return;
    
    const { [STORAGE_KEY]: state } = await chrome.storage.local.get(STORAGE_KEY);
    if (!state) return;
    
    // Strip sensitive data for player sync (GM-only: infectionPoints, bloodType, notes)
    const syncState = {
      combatants: (state.combatants || []).map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        initiative: c.initiative,
        hp: c.hp,
        ac: c.ac,
        speed: c.speed,
        economy: c.economy,
        conditions: c.conditions || [],
        // Skip: abilities, ammo, weapons, infectionPoints, bloodType, notes (GM local)
      })),
      activeTurn: state.activeTurn,
      round: state.round || 1,
      ts: Date.now()
    };
    
    // Size check (room metadata ~16KB limit)
    const json = JSON.stringify(syncState);
    if (json.length > 14000) {
      console.warn(&#39;Sync payload too large, skipping push&#39;);
      return;
    }
    
    await OBR.room.setMetadata({ [OBR_ROOM_KEY]: syncState });
    console.log(&#39;Pushed combat sync to OBR room&#39;);
  } catch (e) {
    console.error(&#39;OBR push failed:&#39;, e);
  }
}

async function pullOBRMetadata() {
  try {
    const { OBR } = await getOBRRuntime();
    if (!OBR?.room) return null;
    
    const metadata = await OBR.room.getMetadata();
    return metadata[OBR_ROOM_KEY] || null;
  } catch (e) {
    console.error(&#39;OBR metadata pull failed:&#39;, e);
    return null;
  }
}

// Background context: OBR not available (content scripts handle OBR)
// Proxy requests via runtime messaging to injected scripts
async function getOBRRuntime() {
  return { OBR: null }; // SW can&#39;t access OBR; use content script ports
}

// Auto-push on storage changes (debounced)
let pushDebounce;
chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEY] &amp;&amp; !pushDebounce) {
    pushDebounce = setTimeout(async () => {
      await pushStateToOBR();
      pushDebounce = null;
    }, 300);
  }
});

console.log(&#39;D&amp;Z GM Tool background service worker loaded&#39;);

