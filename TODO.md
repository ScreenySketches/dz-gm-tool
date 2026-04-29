# D&amp;Z GM Tool OBR Fix TODO

## ✅ Done
- [x] User approved plan  
- [x] Created TODO.md

## ✅ Done\n- [x] Step 1: manifest.json (v3, content_scripts, local popup)\n- [x] Step 2: background.js (service worker + minor lint fixes)\n\n## ⏳ Steps Remaining\n### 3. **dz-gm-tool.html**\n   - chrome.storage.local/sync over localStorage\n   - Content script detection + OBR overlay mode\n   - Runtime messaging to background\n   - Fix OBR builders/refs\n\n### 4. **Cleanup**\n   - DELETE index.html\n\n### 5. **Testing**\n   - Chrome unpacked → OBR popup/injection\n   - Verify banner "Connected", sync\n\n**Current Step**: 3/5 - dz-gm-tool.html

### 2. **background.js** (NEW)
   - Service worker: chrome.storage sync bridge
   - OBR room metadata listener for players

### 3. **dz-gm-tool.html**
   - Detect content_script vs popup mode
   - chrome.storage.local/sync over localStorage
   - Overlay UI in OBR tab (if injected)
   - Fix OBR builders/refs

### 4. **Cleanup**
   - DELETE index.html (redundant)
   - Verify icon.svg sizes

### 5. **Testing**
   - Chrome: Load unpacked → OBR tab → popup works + injection
   - Firefox: Temporary add-on → same
   - Verify: OBR banner "Connected", token link, combat sync

### 6. **Polish**
   - Update TODO progress after each step
   - attempt_completion when OBR integration live

**Current Step**: 1/6 - manifest.json

