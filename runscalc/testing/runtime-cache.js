// Runtime cache system for FiveM integration (0 API charges)

// Debounced refresh function - applies runtime cache to storages
function scheduleRuntimeRefresh() {
    if (pendingRefresh) return;

    pendingRefresh = true;

    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
    }

    refreshTimeout = setTimeout(() => {
        applyRuntimeCacheToStorages();
        pendingRefresh = false;
        storagesUpdatedSinceLastRefresh = false;
    }, REFRESH_IMMEDIATE_DELAY);
}

// Apply runtime cache to storage items
function applyRuntimeCacheToStorages() {
    if (!runningInGame || Object.keys(runtimeCache).length === 0) return;

    let updated = false;

    storages.forEach(storage => {
        if (storage && storage.items) {
            storage.items.forEach(storageItem => {
                if (storageItem.item) {
                    const itemName = storageItem.item.name;
                    const itemId = storageItem.item.id;

                    // Check all cached chests for this item
                    for (const chestKey in runtimeCache) {
                        const chestData = runtimeCache[chestKey];

                        if (chestData[itemName] !== undefined) {
                            const newAmount = parseInt(chestData[itemName]) || 0;
                            if (storageItem.amount !== newAmount) {
                                storageItem.amount = newAmount;
                                updated = true;
                            }
                        } else if (chestData[itemId] !== undefined) {
                            const newAmount = parseInt(chestData[itemId]) || 0;
                            if (storageItem.amount !== newAmount) {
                                storageItem.amount = newAmount;
                                updated = true;
                            }
                        }
                    }
                }
            });
        }
    });

    if (updated) {
        renderSelectedItems();
        calculateRuns();
        console.log("✅ Runtime update applied (0 API charges)");
    }
}

// Listen for FiveM messages and update runtime cache
window.addEventListener("message", function (event) {
    if (!event.data || typeof event.data !== 'object') return;

    const data = event.data;

    // FiveM sends storage data as chest_[id] keys
    for (const key in data) {
        if (key.startsWith("chest_")) {
            try {
                let chestInventory = data[key];
                if (typeof chestInventory === 'string') {
                    chestInventory = JSON.parse(chestInventory);
                }

                // Update runtime cache
                if (chestInventory && typeof chestInventory === 'object') {
                    runtimeCache[key] = chestInventory;
                    storagesUpdatedSinceLastRefresh = true;

                    // Schedule debounced refresh
                    scheduleRuntimeRefresh();
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
    }
});

// Request data from FiveM to start receiving updates
try {
    window.postMessage({ type: "getData" }, "*");
    console.log("📡 Requested runtime data from FiveM");
} catch (e) {
    runningInGame = false;
    console.log("Not running in FiveM - use manual refresh");
}
