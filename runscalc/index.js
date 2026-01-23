// Trailer capacity definitions (in kg)
const TRAILER_CAPACITIES = {
	trailerswb: { name: "MK1", capacity: 400 },
	trailerlogs2: { name: "MK3", capacity: 600 },
	botdumptr: { name: "MK4", capacity: 775 },
	drybulktr: { name: "MK5", capacity: 1000 },
	dumptr: { name: "MK6", capacity: 1500 },
	docktrailer2: { name: "MK7", capacity: 2200 },
	docktrailer: { name: "MK8", capacity: 2500 },
	trailers2: { name: "MK9", capacity: 2750 },
	trailerswb2: { name: "MK10", capacity: 3000 },
	tvtrailer: { name: "MK11", capacity: 3500 },
	tvtrailer2: { name: "MK12", capacity: 5000 },
	boxlongtr: { name: "MK13", capacity: 8500 },
	trailerlarge: { name: "MK14", capacity: 9000 },
	mk15: { name: "MK15", capacity: 6000 }
};

// Post OP perk multiplier
const POST_OP_MULTIPLIER = 1.15;
// Premium multiplier
const PREMIUM_MULTIPLIER = 1.15;

// Item weights (in kg) - trucking items only
const ITEM_WEIGHTS = {
	scrap_acid: { name: "Acid", weight: 5 },
	crafted_batteries: { name: "Batteries", weight: 30 },
	mechanicals_battery: { name: "Car Battery", weight: 20 },
	crafted_cardboard: { name: "Cardboard", weight: 10 },
	crafted_cement: { name: "Cement Mix", weight: 25 },
	crafted_ceramictiles: { name: "Ceramic Tiles", weight: 10 },
	mechanicals_chassis: { name: "Chassis", weight: 80 },
	military_chemicals: { name: "Chemicals", weight: 25 },
	crafted_circuit: { name: "Circuit Boards", weight: 20 },
	crafted_computer: { name: "Computers", weight: 35 },
	crafted_concrete: { name: "Concrete", weight: 160 },
	mining_copper: { name: "Copper Ore", weight: 1 },
	crafted_copperwire: { name: "Copper Wire Spool", weight: 20 },
	petrochem_oil: { name: "Crude Oil", weight: 150 },
	petrochem_diesel: { name: "Diesel", weight: 25 },
	tcargosmall: { name: "Erasers", weight: 3 },
	military_explosives: { name: "Explosives", weight: 250 },
	crafted_fiberglass: { name: "Fiberglass Spool", weight: 20 },
	refined_flint: { name: "Flint", weight: 5 },
	refined_glass: { name: "Glass", weight: 5 },
	scrap_gravel: { name: "Gravel", weight: 5 },
	mining_iron: { name: "Iron Ore", weight: 1 },
	mechanicals_jumper_cable: { name: "Jumper Cable", weight: 5 },
	petrochem_kerosene: { name: "Kerosene", weight: 25 },
	tcargologs: { name: "Logs", weight: 60 },
	petrochem_petrol: { name: "Petrol", weight: 25 },
	refined_planks: { name: "Planks", weight: 15 },
	petrochem_propane: { name: "Propane", weight: 25 },
	recycled_rubble: { name: "Quarry Rubble", weight: 150 },
	scrap_emerald: { name: "Raw Emeralds", weight: 10 },
	petrochem_gas: { name: "Raw Gas", weight: 150 },
	scrap_ore: { name: "Raw Ore Mix", weight: 15 },
	crafted_rebar: { name: "Rebar", weight: 45 },
	recycled_electronics: { name: "Recycled Electronics", weight: 130 },
	recycled_trash: { name: "Recycled Trash", weight: 90 },
	refined_aluminum: { name: "Refined Aluminum", weight: 10 },
	refined_amalgam: { name: "Refined Amalgam", weight: 15 },
	refined_bronze: { name: "Refined Bronze Alloy", weight: 10 },
	refined_copper: { name: "Refined Copper", weight: 10 },
	refined_gold: { name: "Refined Gold", weight: 20 },
	refined_solder: { name: "Refined Solder", weight: 5 },
	refined_tin: { name: "Refined Tin", weight: 10 },
	refined_zinc: { name: "Refined Zinc", weight: 10 },
	mechanicals_rubber: { name: "Rubber", weight: 8 },
	refined_sand: { name: "Sand", weight: 5 },
	tcargodust: { name: "Sawdust", weight: 3 },
	scrap_aluminum: { name: "Scrap Aluminum", weight: 5 },
	scrap_copper: { name: "Scrap Copper", weight: 5 },
	scrap_gold: { name: "Scrap Gold", weight: 10 },
	scrap_lead: { name: "Scrap Lead", weight: 15 },
	scrap_mercury: { name: "Scrap Mercury", weight: 15 },
	scrap_plastic: { name: "Scrap Plastic", weight: 5 },
	scrap_tin: { name: "Scrap Tin", weight: 5 },
	shipping_crate_empty: { name: "Shipping Container", weight: 100 },
	petrochem_sulfur: { name: "Sulfur", weight: 5 },
	military_titanium: { name: "Titanium", weight: 20 },
	military_titanium_ore: { name: "Titanium Ore", weight: 25 },
	pucargosmall: { name: "Tools", weight: 1 },
	recycled_waste: { name: "Toxic Waste", weight: 110 },
	mechanicals_battery_evb: { name: "Traction Battery", weight: 90 },
	liquid_water: { name: "Treated Water (100L)", weight: 100 },
	liquid_water_raw: { name: "Unfiltered Water (100L)", weight: 100 },
	mechanicals_vehicle_framework: { name: "Vehicle Framework", weight: 200 },
	petrochem_waste: { name: "Waste Water", weight: 50 },
	mechanicals_wheels: { name: "Wheels", weight: 15 }
};

let settingsCollapsed = false;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialX = 0;
let initialY = 0;
let storages = [];
let selectedItems = [];
const DEFAULT_API_URL = "https://tycoon-2epova.users.cfx.re/status/";
const ALTERNATIVE_API_URL = "https://d.ttstats.eu/public-main/status/";
let apiUrl = DEFAULT_API_URL;
let autoRefreshTimer = null;

// In-app console logging
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

function addToConsole(message, type = 'log') {
	const consoleOutput = document.getElementById('console-output');
	if (!consoleOutput) return;

	const logEntry = document.createElement('div');
	logEntry.className = `console-log ${type}`;

	// Format the message - handle arrays of arguments
	let formattedMessage = '';
	if (Array.isArray(message)) {
		formattedMessage = message.map(arg => {
			if (typeof arg === 'object' && arg !== null) {
				try {
					return JSON.stringify(arg, null, 2);
				} catch (e) {
					return String(arg);
				}
			}
			return String(arg);
		}).join(' ');
	} else if (typeof message === 'object' && message !== null) {
		try {
			formattedMessage = JSON.stringify(message, null, 2);
		} catch (e) {
			formattedMessage = String(message);
		}
	} else {
		formattedMessage = String(message);
	}

	const timestamp = new Date().toLocaleTimeString();
	logEntry.textContent = `[${timestamp}] ${formattedMessage}`;

	consoleOutput.appendChild(logEntry);
	consoleOutput.scrollTop = consoleOutput.scrollHeight;

	// Keep only last 100 entries
	while (consoleOutput.children.length > 100) {
		consoleOutput.removeChild(consoleOutput.firstChild);
	}
}

// Override console methods
console.log = function (...args) {
	originalConsoleLog.apply(console, args);
	addToConsole(args, 'info');
};

console.error = function (...args) {
	originalConsoleError.apply(console, args);
	addToConsole(args, 'error');
};

console.warn = function (...args) {
	originalConsoleWarn.apply(console, args);
	addToConsole(args, 'warn');
};

// Real-time storage update handler
function updateStorageFromMessage(messageData) {
	console.log("📨 Received storage update message:", messageData);

	// Handle different message formats from FiveM
	let storageData = null;

	// Check if it's a direct storage update
	if (messageData.type === "storageUpdate" && messageData.data) {
		storageData = messageData.data;
	} else if (messageData.storages) {
		// Full storage list update
		storageData = messageData;
	} else if (messageData.storage && messageData.inventory) {
		// Single storage update
		storageData = { storages: [{ name: messageData.storage, inventory: messageData.inventory }] };
	}

	if (!storageData || !storageData.storages) {
		console.log("⚠️ Unknown message format, ignoring");
		return;
	}

	const userId = localStorage.getItem("userId");
	if (!userId) {
		console.log("⚠️ No user ID set, cannot update storage");
		return;
	}

	// Update each storage in the message
	storageData.storages.forEach(updatedStorage => {
		const parsed = parseStorage(updatedStorage.name, updatedStorage.inventory || {}, userId);
		if (!parsed) return;

		// Find existing storage and update it
		const existingIndex = storages.findIndex(s => s.storage.id === parsed.storage.id);
		if (existingIndex !== -1) {
			console.log(`✓ Updated storage: ${parsed.storage.name}`);
			storages[existingIndex] = parsed;
		} else {
			console.log(`✓ Added new storage: ${parsed.storage.name}`);
			storages.push(parsed);
		}
	});

	// Refresh UI to show updated amounts
	populateStorageDropdowns();
	
	// Verify and fix originalAmount for any items that might be missing it
	selectedItems.forEach(item => {
		if (!item.originalAmount) {
			const currentInStorage = getRemainingInStorage(item.itemId);
			if (currentInStorage !== null) {
				item.originalAmount = Math.max(item.amount, currentInStorage);
				console.log(`🔧 Fixed missing originalAmount for ${item.itemId}: ${item.originalAmount}`);
			}
		}
	});
	if (selectedItems.some(item => !item.originalAmount)) {
		saveSelectedItems(); // Save any fixes
	}
	
	renderSelectedItems(); // This will update "items left" counts
	calculateRuns(); // This will recalculate runs with new amounts

	console.log("✓ Storage data updated, UI refreshed");
}

function toggleSettings() {
	const userInput = document.getElementById("main").querySelector(".user-input");
	settingsCollapsed = !settingsCollapsed;

	if (settingsCollapsed) {
		userInput.classList.add("collapsed");
	} else {
		userInput.classList.remove("collapsed");
	}
}

function initDragging() {
	const userInput = document.getElementById("main").querySelector(".user-input");
	const buttonContainer = userInput.querySelector(".button-container");

	// Load saved position
	const savedX = localStorage.getItem('runsCalcPosX');
	const savedY = localStorage.getItem('runsCalcPosY');
	if (savedX !== null && savedY !== null) {
		userInput.style.left = savedX + 'px';
		userInput.style.top = savedY + 'px';
	}

	// Make button container draggable
	buttonContainer.addEventListener('mousedown', function (e) {
		// Don't drag if clicking on the button itself or its children
		if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

		isDragging = true;
		userInput.classList.add('dragging');

		dragStartX = e.clientX;
		dragStartY = e.clientY;

		const rect = userInput.getBoundingClientRect();
		initialX = rect.left;
		initialY = rect.top;

		e.preventDefault();
		e.stopPropagation();
	});

	document.addEventListener('mousemove', function (e) {
		if (!isDragging) return;

		const deltaX = e.clientX - dragStartX;
		const deltaY = e.clientY - dragStartY;

		let newX = initialX + deltaX;
		let newY = initialY + deltaY;

		// Keep within viewport bounds
		const maxX = window.innerWidth - userInput.offsetWidth;
		const maxY = window.innerHeight - userInput.offsetHeight;

		newX = Math.max(0, Math.min(newX, maxX));
		newY = Math.max(0, Math.min(newY, maxY));

		userInput.style.left = newX + 'px';
		userInput.style.top = newY + 'px';

		// Save position
		localStorage.setItem('runsCalcPosX', newX);
		localStorage.setItem('runsCalcPosY', newY);
	});

	document.addEventListener('mouseup', function () {
		if (isDragging) {
			isDragging = false;
			userInput.classList.remove('dragging');
		}
	});
}

function toggleSubmenu(header) {
	const content = header.nextElementSibling;
	const toggle = header.querySelector(".submenu-toggle");

	if (content.classList.contains("collapsed")) {
		content.classList.remove("collapsed");
		toggle.classList.remove("collapsed");
	} else {
		content.classList.add("collapsed");
		toggle.classList.add("collapsed");
	}
}

function calculateCapacity() {
	const mk15Checked = document.getElementById("mk15").checked;
	const trailerSelect = document.getElementById("trailer").value;
	const postOpChecked = document.getElementById("postop").checked;
	const premiumChecked = document.getElementById("premium").checked;

	let capacity = 0;

	// MK15 is a cab that can be used WITH a trailer (both capacities add together)
	if (mk15Checked) {
		capacity += TRAILER_CAPACITIES.mk15.capacity;
	}

	if (trailerSelect && TRAILER_CAPACITIES[trailerSelect]) {
		capacity += TRAILER_CAPACITIES[trailerSelect].capacity;
	}

	// Apply multipliers (same as Dogg folder: 1 + premium*0.15 + postop*0.15)
	if (capacity > 0) {
		let multiplier = 1;
		if (premiumChecked) multiplier += 0.15;
		if (postOpChecked) multiplier += 0.15;
		capacity = Math.round(capacity * multiplier);
	}

	return capacity;
}

function updateAmountFromStorage() {
	const sourceStorageId = document.getElementById("sourceStorage").value;
	const itemType = document.getElementById("itemType").value;

	if (sourceStorageId && itemType) {
		const storage = storages.find(s => s.storage.id === sourceStorageId);
		if (storage) {
			const item = storage.items.find(i => i.item && i.item.id === itemType);
			if (item && item.amount > 0) {
				// Show the ORIGINAL storage amount, not remaining
				document.getElementById("itemAmount").value = item.amount;
				return;
			}
		}
	}
	document.getElementById("itemAmount").value = 0;
}

function addItem() {
	const itemType = document.getElementById("itemType").value;
	const inputAmount = parseInt(document.getElementById("itemAmount").value) || 0;
	const sourceStorageId = document.getElementById("sourceStorage").value;

	if (!itemType) {
		showError("Please select an item type");
		return;
	}

	if (!sourceStorageId) {
		showError("Please select a source storage first");
		return;
	}

	// Get current amount from storage automatically
	const storage = storages.find(s => s.storage.id === sourceStorageId);
	if (!storage) {
		showError("Storage not found");
		return;
	}

	const item = storage.items.find(i => i.item && i.item.id === itemType);
	if (!item || item.amount <= 0) {
		showError(`No ${ITEM_WEIGHTS[itemType]?.name || 'item'} found in selected storage`);
		return;
	}

	const currentInStorage = item.amount;

	// Use input amount if provided, otherwise use full storage amount
	const amountToTrack = inputAmount > 0 ? inputAmount : currentInStorage;

	// Check if item already tracked
	const existingIndex = selectedItems.findIndex(i => i.itemId === itemType);
	if (existingIndex !== -1) {
		showError(`${ITEM_WEIGHTS[itemType]?.name} is already being tracked`);
		return;
	}

	// Add new item - store ORIGINAL storage amount for tracking
	// IMPORTANT: originalAmount should NEVER be changed after this point
	selectedItems.push({
		itemId: itemType,
		amount: amountToTrack, // How much user wants to move
		originalAmount: currentInStorage // Original amount in storage when item was added (NEVER CHANGE THIS)
	});

	saveSelectedItems(); // Save immediately to preserve originalAmount
	renderSelectedItems();
	document.getElementById("itemAmount").value = 0; // Reset input
	showError("");
	console.log(`✓ Tracking ${ITEM_WEIGHTS[itemType]?.name}: ${amountToTrack} to move, originalAmount=${currentInStorage} (saved to localStorage)`);
}

function removeItem(index) {
	selectedItems.splice(index, 1);
	renderSelectedItems();
	showError("");
}

function updateSelectedItemAmount(index, newAmount) {
	const amount = parseInt(newAmount) || 0;
	if (amount < 0) return;

	// Update amount but NEVER change originalAmount
	const item = selectedItems[index];
	if (!item) return;
	
	item.amount = amount;
	// originalAmount should remain unchanged - it's the baseline for tracking
	saveSelectedItems();
	calculateRuns(); // Recalculate with new amount
	console.log(`✏️ Updated amount to ${amount} (originalAmount=${item.originalAmount} preserved)`);
}

function getRemainingInStorage(itemId) {
	const sourceStorageId = document.getElementById("sourceStorage").value;
	if (!sourceStorageId) return null;

	// Use the EXACT same logic as updateAmountFromStorage()
	const storage = storages.find(s => s.storage.id === sourceStorageId);
	if (!storage) return null;

	const item = storage.items.find(i => i.item && i.item.id === itemId);
	if (!item) return null;

	// Return the ACTUAL amount in storage from API (real-time data)
	// This is what's actually left in storage right now, not calculated
	const actualAmount = item.amount || 0;

	return actualAmount;
}

function renderSelectedItems() {
	const itemsList = document.getElementById("selected-items-list");

	if (selectedItems.length === 0) {
		itemsList.innerHTML = '<div class="no-items-message">No items selected. Add items above.</div>';
		// Recalculate runs when list is empty
		calculateRuns();
		return;
	}

	itemsList.innerHTML = "";

	// Track items to remove (when storage is empty)
	const itemsToRemove = [];

	selectedItems.forEach((item, index) => {
		const itemData = ITEM_WEIGHTS[item.itemId];
		if (!itemData) return;

		const currentInStorage = getRemainingInStorage(item.itemId);
		
		// Ensure originalAmount exists - if not, use item.amount as fallback
		// But log a warning since this shouldn't happen if items were added correctly
		if (!item.originalAmount) {
			console.warn(`⚠️ ${itemData.name} missing originalAmount! Using item.amount=${item.amount} as fallback`);
			item.originalAmount = item.amount;
			saveSelectedItems(); // Save the fixed originalAmount
		}
		
		const originalAmount = item.originalAmount;

		// Auto-remove if storage is empty (all items moved)
		if (currentInStorage !== null && currentInStorage === 0) {
			itemsToRemove.push(index);
			console.log(`🗑️ Auto-removing ${itemData.name} (storage empty)`);
			return; // Skip rendering this item
		}

		// Calculate how many were moved (original - current)
		// Handle case where items might be added back (current > original)
		let movedAmount = 0;
		if (currentInStorage !== null && originalAmount !== null) {
			movedAmount = Math.max(0, originalAmount - currentInStorage);
		}

		console.log(`📊 ${itemData.name}: originalAmount=${originalAmount}, currentInStorage=${currentInStorage}, moved=${movedAmount}, item.amount=${item.amount}`);

		const storageText = currentInStorage !== null
			? ` <span style="color: #888; font-size: 0.85em;">(${currentInStorage.toLocaleString()} in storage, ${movedAmount > 0 ? movedAmount.toLocaleString() + ' moved' : 'none moved'})</span>`
			: '';

		const entry = document.createElement("div");
		entry.className = "item-entry";

		entry.innerHTML = `
			<span class="item-name">${itemData.name}</span>
			<div class="item-amount-edit-container">
				<input 
					type="number" 
					class="item-amount-inline-edit" 
					value="${item.amount}" 
					min="0"
					max="${currentInStorage || 999999}"
					onchange="updateSelectedItemAmount(${index}, this.value)"
					onclick="this.select()"
				/>
				${storageText}
			</div>
			<div class="item-controls">
				<button class="remove-item" onclick="removeItem(${index})" title="Remove item">×</button>
			</div>
		`;

		itemsList.appendChild(entry);
	});

	// Remove items with empty storage (in reverse order to maintain indices)
	for (let i = itemsToRemove.length - 1; i >= 0; i--) {
		selectedItems.splice(itemsToRemove[i], 1);
	}

	// If items were removed, save and re-render
	if (itemsToRemove.length > 0) {
		saveSelectedItems();
		renderSelectedItems(); // Re-render without removed items
		return;
	}

	saveSelectedItems();
	// Force immediate recalculation
	calculateRuns();
}

function saveSelectedItems() {
	localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
}

function loadSelectedItems() {
	try {
		const saved = localStorage.getItem("selectedItems");
		if (saved) {
			selectedItems = JSON.parse(saved);
			selectedItems = selectedItems.filter(item => ITEM_WEIGHTS[item.itemId] !== undefined);
			
			// Initialize originalAmount for items that don't have it (backward compatibility)
			selectedItems.forEach(item => {
				if (!item.originalAmount) {
					// Try to get current storage amount first
					const currentInStorage = getRemainingInStorage(item.itemId);
					
					// If storage data is available and current < item.amount, items were moved
					// In this case, item.amount was likely the original amount
					// If current >= item.amount, use current as original (items might have been added)
					if (currentInStorage !== null) {
						// Use the larger of item.amount or currentInStorage as original
						// This handles both cases: items moved (current < item.amount) or items added (current >= item.amount)
						item.originalAmount = Math.max(item.amount, currentInStorage);
						console.log(`⚠️ Restored originalAmount for ${item.itemId}: ${item.originalAmount} (current=${currentInStorage}, item.amount=${item.amount})`);
					} else {
						// Storage data not available yet, use item.amount as fallback
						item.originalAmount = item.amount;
						console.log(`⚠️ Restored originalAmount for ${item.itemId}: ${item.originalAmount} (from item.amount, storage data not available)`);
					}
					
					// Save the fixed originalAmount
					saveSelectedItems();
				}
			});
			
			renderSelectedItems();
		}
	} catch (e) {
		console.error("Failed to load selected items:", e);
		selectedItems = [];
	}
}

function calculateRuns() {
	const capacity = calculateCapacity();
	const perItemRunsDiv = document.getElementById("per-item-runs");
	const totalRunsElement = document.getElementById("total-runs-required");
	const trailerCapacityElement = document.getElementById("trailer-capacity");

	if (!perItemRunsDiv || !totalRunsElement || !trailerCapacityElement) {
		console.error("Results elements not found!");
		return;
	}

	// Update trailer capacity always
	trailerCapacityElement.textContent = capacity.toLocaleString();

	if (capacity === 0) {
		perItemRunsDiv.innerHTML = '<div class="no-items-message">Select a trailer to calculate runs</div>';
		totalRunsElement.textContent = "0";
		return;
	}

	const sourceStorageId = document.getElementById("sourceStorage").value;
	if (!sourceStorageId) {
		perItemRunsDiv.innerHTML = '<div class="no-items-message">Select source storage to calculate runs</div>';
		totalRunsElement.textContent = "0";
		return;
	}

	const storage = storages.find(s => s.storage.id === sourceStorageId);
	if (!storage || !storage.items || storage.items.length === 0) {
		perItemRunsDiv.innerHTML = '<div class="no-items-message">No items in selected storage</div>';
		totalRunsElement.textContent = "0";
		console.log("⚠️ No storage found or storage is empty");
		return;
	}

	let totalRuns = 0;
	let totalWeight = 0;
	perItemRunsDiv.innerHTML = "";

	// If items are selected, calculate runs for selected items only
	// If no items selected, calculate runs for ALL items in storage
	if (selectedItems.length > 0) {
		console.log(`📊 Calculating runs for ${selectedItems.length} selected items`);
		// Calculate runs based on items ACTUALLY LEFT in storage
		selectedItems.forEach(item => {
			const itemData = ITEM_WEIGHTS[item.itemId];
			if (!itemData) return;

			// Get current amount in source storage (real-time from API)
			const currentInStorage = getRemainingInStorage(item.itemId);
			const originalAmount = item.originalAmount || item.amount;

			// If we can't get current storage, skip this item
			if (currentInStorage === null) {
				console.log(`  - ${itemData.name}: skipped (storage data unavailable)`);
				return;
			}

			// Calculate how many were already moved (original storage - current storage)
			const alreadyMoved = Math.max(0, originalAmount - currentInStorage);

			// Calculate how much is LEFT to move
			// Use the minimum of: (target - already moved) OR (what's actually in storage)
			// This ensures we don't calculate runs for more items than actually exist
			const remainingTarget = Math.max(0, item.amount - alreadyMoved);
			const amountToCalculate = Math.min(remainingTarget, currentInStorage);

			// Skip if nothing left to move
			if (amountToCalculate <= 0) {
				console.log(`  - ${itemData.name}: completed (${item.amount} target reached, ${alreadyMoved} moved)`);
				return;
			}

			const weight = amountToCalculate * itemData.weight;
			const runs = Math.ceil(weight / capacity);

			// Skip items with 0 runs (shouldn't happen due to check above, but safety)
			if (runs === 0) {
				return;
			}

			totalRuns += runs;
			totalWeight += weight;

			const runDiv = document.createElement("div");
			runDiv.className = "per-item-run";
			runDiv.innerHTML = `<span class="item-name">${itemData.name}:</span> <span class="run-count">${runs}</span> run${runs !== 1 ? 's' : ''}`;
			perItemRunsDiv.appendChild(runDiv);

			console.log(`  - ${itemData.name}: ${runs} runs (${amountToCalculate} left to move: ${currentInStorage} in storage, ${alreadyMoved} already moved, ${item.amount} target)`);
		});
	} else {
		console.log(`📊 Calculating runs for ALL items in storage (${storage.items.length} items)`);
		// No items selected, show runs for ALL items in storage
		storage.items.forEach(storageItem => {
			if (!storageItem.item || !storageItem.amount) return;

			const itemData = ITEM_WEIGHTS[storageItem.item.id];
			if (!itemData) return;

			const amountToCalculate = storageItem.amount;
			const weight = amountToCalculate * itemData.weight;
			const runs = Math.ceil(weight / capacity);
			totalRuns += runs;
			totalWeight += weight;

			const remainingText = ` <span style="color: #888; font-size: 0.9em;">(${amountToCalculate.toLocaleString()} left)</span>`;

			const runDiv = document.createElement("div");
			runDiv.className = "per-item-run";
			runDiv.innerHTML = `<span class="item-name">${itemData.name}:</span> <span class="run-count">${runs}</span> run${runs !== 1 ? 's' : ''}${remainingText}`;
			perItemRunsDiv.appendChild(runDiv);
		});
	}

	if (perItemRunsDiv.innerHTML === "") {
		perItemRunsDiv.innerHTML = '<div class="no-items-message">No items to calculate</div>';
	}

	// Update total runs immediately
	totalRunsElement.textContent = totalRuns.toLocaleString();
	console.log(`✓ Total runs: ${totalRuns}`);
}

function populateItemDropdown() {
	const itemSelect = document.getElementById("itemType");
	itemSelect.innerHTML = '<option value="">Select Item</option>';

	// Sort items by name for easier selection
	const sortedItems = Object.entries(ITEM_WEIGHTS).sort((a, b) =>
		a[1].name.localeCompare(b[1].name)
	);

	sortedItems.forEach(([id, item]) => {
		const option = document.createElement("option");
		option.value = id;
		option.textContent = `${item.name} (${item.weight} kg)`;
		itemSelect.appendChild(option);
	});
}

function populateStorageDropdowns() {
	const sourceSelect = document.getElementById("sourceStorage");
	const destSelect = document.getElementById("destinationStorage");

	// Clear existing options except first
	sourceSelect.innerHTML = '<option value="">Select Source Storage</option>';
	destSelect.innerHTML = '<option value="">Select Destination Storage</option>';

	// Add storages
	storages.forEach(storage => {
		const sourceOption = document.createElement("option");
		sourceOption.value = storage.storage.id;
		sourceOption.textContent = storage.storage.name;
		sourceSelect.appendChild(sourceOption);

		const destOption = document.createElement("option");
		destOption.value = storage.storage.id;
		destOption.textContent = storage.storage.name;
		destSelect.appendChild(destOption);
	});
}

async function apiFetch(endpoint, apiKey) {
	const response = await fetch(apiUrl + endpoint, {
		headers: {
			"X-Tycoon-Key": apiKey
		}
	});

	if (!response.ok) {
		let errorMsg;
		if (response.status === 402) {
			errorMsg = "No api charges remaining";
		} else if (response.status === 403) {
			errorMsg = "Invalid api key";
		} else {
			errorMsg = await response.text().catch(() => "Unknown");
		}
		throw new Error(`Failed to fetch api: (${response.status}) ${errorMsg || response.statusText}`);
	}

	return response.json();
}

async function fetchStorages() {
	const apiKey = localStorage.getItem("apiKey");
	const userId = localStorage.getItem("userId");

	if (!apiKey || !userId) {
		showError("Please enter API Key and User ID");
		return;
	}

	// Check if we have cached data
	const cacheKey = `storages_${userId}`;
	const cachedData = localStorage.getItem(cacheKey);
	const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

	// Use cached data if it exists and is less than 5 minutes old
	const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	if (cachedData && cacheTimestamp) {
		const age = Date.now() - parseInt(cacheTimestamp);
		if (age < CACHE_DURATION) {
			console.log("📦 Using cached storage data (no API charge!)");
			try {
				const storageList = JSON.parse(cachedData);
				storages = storageList.map(storage => {
					const parsed = parseStorage(storage.name, storage.inventory || {}, userId);
					if (!parsed) console.warn(`❌ Failed to parse storage: ${storage.name}`);
					return parsed;
				}).filter(s => s !== null);

				console.log("✓ Successfully loaded", storages.length, "storages from cache");
				populateStorageDropdowns();
				renderSelectedItems();
				calculateRuns();
				showError("");
				return;
			} catch (e) {
				console.warn("Failed to load cache, fetching from API");
			}
		}
	}

	try {
		console.log("🌐 Fetching from API (1 API charge)");
		const data = await apiFetch(`storages/${userId}`, apiKey);
		const storageList = data.storages || [];

		// Cache the data
		localStorage.setItem(cacheKey, JSON.stringify(storageList));
		localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
		console.log("💾 Cached storage data for 5 minutes");

		console.log("📦 API returned", storageList.length, "storage names:", storageList.map(s => s.name));

		storages = storageList.map(storage => {
			const parsed = parseStorage(storage.name, storage.inventory || {}, userId);
			if (!parsed) console.warn(`❌ Failed to parse storage: ${storage.name}`);
			return parsed;
		}).filter(s => s !== null);

		console.log("✓ Successfully parsed", storages.length, "storages");

		populateStorageDropdowns();
		// Update remaining counts and recalculate when storage is refreshed
		renderSelectedItems();
		calculateRuns();
		showError("");
	} catch (error) {
		console.error("Failed to fetch storages:", error);
		showError(`Failed to fetch storages: ${error.message}`);
	}
}

// Update storage from FiveM chest data (NO API CALLS!)
function updateStorageFromChest(chestId, chestData) {
	console.log(`📦 Processing chest data for: ${chestId}`, chestData);

	const userId = localStorage.getItem("userId");
	if (!userId) return;

	if (!chestData || typeof chestData !== "object") {
		console.warn("Invalid chest data");
		return;
	}

	// Chest data is inventory format: {itemName: amount, ...}
	// We need to update our storages with this data
	let updated = false;

	storages.forEach(storage => {
		if (storage && storage.items) {
			storage.items.forEach(storageItem => {
				if (!storageItem.item) return;

				// Try to find matching item in chest data by name
				const itemName = storageItem.item.name;
				const itemId = storageItem.item.id;

				// Check both name and id
				if (chestData[itemName] !== undefined) {
					const newAmount = parseInt(chestData[itemName]) || 0;
					if (storageItem.amount !== newAmount) {
						console.log(`  ✓ ${itemName}: ${storageItem.amount} → ${newAmount}`);
						storageItem.amount = newAmount;
						updated = true;
					}
				} else if (chestData[itemId] !== undefined) {
					const newAmount = parseInt(chestData[itemId]) || 0;
					if (storageItem.amount !== newAmount) {
						console.log(`  ✓ ${itemName}: ${storageItem.amount} → ${newAmount}`);
						storageItem.amount = newAmount;
						updated = true;
					}
				}
			});
		}
	});

	if (updated) {
		// Refresh UI with updated data
		renderSelectedItems();
		calculateRuns();
		console.log("✅ Storage updated from FiveM (no API charge!)");
	} else {
		console.log("⚠️ No matching items found in chest data");
	}
}

// Silent refresh for auto-polling (ALWAYS fetches fresh data)
async function silentRefreshStorages() {
	const apiKey = localStorage.getItem("apiKey");
	const userId = localStorage.getItem("userId");

	if (!apiKey || !userId) return;

	try {
		const data = await apiFetch(`storages/${userId}`, apiKey);
		const storageList = data.storages || [];

		storages = storageList.map(storage => {
			const parsed = parseStorage(storage.name, storage.inventory || {}, userId);
			return parsed;
		}).filter(s => s !== null);

		renderSelectedItems();
		calculateRuns();
	} catch (error) {
		console.error("Silent refresh failed:", error);
	}
}


function parseStorage(storageName, inventory, userId) {
	// Parse storage ID from name (similar to Dogg's H function)
	let storageId = storageName.replace(/^chest_u\d+/, "").replace(/^chest_self_storage:\d+:(.+):chest$/, "$1").replace(/^_/, "");

	// Handle vehicle storage names
	const vehicleMatch = storageName.match(/^veh_\w+_(.+)$/);
	if (vehicleMatch) {
		storageId = vehicleMatch[1];
	}

	// Skip invalid storage names
	if (/^chest_u\d+/.test(storageName) || /^chest_self_storage:\d+:/.test(storageName)) {
		return null;
	}

	// Handle faq_ storages - treat as valid storage
	if (storageId.startsWith("faq_")) {
		// Create a custom storage entry for faq_ storages
		const customStorage = {
			name: storageId.replace(/^faq_/, "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || storageId,
			id: storageId,
			type: "storage"
		};
		// Parse items from inventory (same logic as below)
		const parsedItems = Object.entries(inventory).map(([itemId, itemData]) => {
			const amount = typeof itemData === 'object' ? itemData.amount : itemData;
			let cleanItemId = itemId.replace(/(<.+?>)|(&#.+?;)/g, "");
			if (cleanItemId.startsWith("gut_knife")) {
				cleanItemId = cleanItemId.split("|")[0];
			} else if (cleanItemId.startsWith("aircargo")) {
				return null;
			}
			const item = ITEM_WEIGHTS[cleanItemId];
			if (!item) {
				if (cleanItemId !== "outfit|ig_furry") {
					console.info(`Unknown item: ${cleanItemId} in ${storageName}`);
				}
				return null;
			}
			return {
				item: { id: cleanItemId, name: item.name, weight: item.weight },
				amount: amount
			};
		}).filter(i => i !== null);

		return {
			storage: customStorage,
			items: parsedItems
		};
	}

	const storage = getStorageById(storageId);
	if (!storage) {
		console.warn(`Unknown storage: '${storageId}', assuming vehicle`);
		return {
			storage: { name: storageName, id: storageId, type: "vehicle" },
			items: []
		};
	}

	// Parse items from inventory
	const parsedItems = Object.entries(inventory).map(([itemId, itemData]) => {
		const amount = typeof itemData === 'object' ? itemData.amount : itemData;

		// Clean item ID (remove HTML tags and entities like Dogg does)
		let cleanItemId = itemId.replace(/(<.+?>)|(&#.+?;)/g, "");

		// Handle special cases
		if (cleanItemId.startsWith("gut_knife")) {
			cleanItemId = cleanItemId.split("|")[0];
		} else if (cleanItemId.startsWith("aircargo")) {
			return null;
		}

		const item = ITEM_WEIGHTS[cleanItemId];
		if (!item) {
			if (cleanItemId !== "outfit|ig_furry") {
				console.info(`Unknown item: ${cleanItemId} in ${storageName}`);
			}
			return null;
		}

		return {
			item: { id: cleanItemId, name: item.name, weight: item.weight },
			amount: amount
		};
	}).filter(i => i !== null);

	return {
		storage: storage,
		items: parsedItems
	};
}

function getStorageById(id) {
	// Common storage IDs from Dogg
	const storageMap = {
		"biz_train": { name: "Trainyard Storage", id: "biz_train", type: "storage" },
		"faction": { name: "Faction Storage", id: "faction", type: "storage" },
		"biz_hookies": { name: "Hookies", id: "biz_hookies", type: "storage" },
		"biz_granny": { name: "Grandma's House", id: "biz_granny", type: "storage" },
		"biz_yellowjack": { name: "Yellowjack", id: "biz_yellowjack", type: "storage" },
		"bctp": { name: "Blaine County Tractor Parts", id: "bctp", type: "storage" },
		"pbsf": { name: "Paleto Bay Self Storage", id: "pbsf", type: "storage" },
		"bhsl": { name: "Big House Storage LSIA", id: "bhsl", type: "storage" },
		"tsu": { name: "The Secure Unit", id: "tsu", type: "storage" },
		"dpss": { name: "Del Perro Self Storage", id: "dpss", type: "storage" },
		"gohq": { name: "Palmer-Taylor Power Station", id: "gohq", type: "storage" },
		"fthq": { name: "Pillbox Hill Storage Unit", id: "fthq", type: "storage" },
		"bats": { name: "Rogers Salvage & Scrap", id: "bats", type: "storage" }
	};

	return storageMap[id] || null;
}

function saveApiKey() {
	const apiKey = document.getElementById("apiKey").value;
	const userId = document.getElementById("userId").value;
	const alternativeApi = document.getElementById("alternativeApi").checked;

	if (!apiKey || !userId) {
		showError("Please enter both API Key and User ID");
		return;
	}

	localStorage.setItem("apiKey", apiKey);
	localStorage.setItem("userId", userId);
	localStorage.setItem("alternativeApi", alternativeApi ? "true" : "false");

	apiUrl = alternativeApi ? ALTERNATIVE_API_URL : DEFAULT_API_URL;

	showError("API Key saved!");
	setTimeout(() => showError(""), 2000);
}

async function refresh() {
	await fetchStorages();
}

function startAutoRefresh() {
	// Clear any existing timer
	if (autoRefreshTimer) {
		clearInterval(autoRefreshTimer);
	}

	// Start polling every 5 seconds
	autoRefreshTimer = setInterval(() => {
		silentRefreshStorages();
	}, 5000); // 5 seconds

	console.log("✓ Auto-refresh enabled (polling every 5 seconds)");
}

function stopAutoRefresh() {
	if (autoRefreshTimer) {
		clearInterval(autoRefreshTimer);
		autoRefreshTimer = null;
		console.log("✓ Auto-refresh disabled");
	}
}

function showError(message) {
	document.getElementById("error").textContent = message;
}

function saveSettings() {
	localStorage.setItem("mk15", document.getElementById("mk15").checked ? "true" : "false");
	localStorage.setItem("trailer", document.getElementById("trailer").value);
	localStorage.setItem("postop", document.getElementById("postop").checked ? "true" : "false");
	localStorage.setItem("premium", document.getElementById("premium").checked ? "true" : "false");
	localStorage.setItem("autoRefresh", document.getElementById("autoRefresh").checked ? "true" : "false");
	localStorage.setItem("sourceStorage", document.getElementById("sourceStorage").value);
	localStorage.setItem("destinationStorage", document.getElementById("destinationStorage").value);
}

function loadSettings() {
	const savedMk15 = localStorage.getItem("mk15") === "true";
	const savedTrailer = localStorage.getItem("trailer") || "";
	const savedPostop = localStorage.getItem("postop") === "true";
	const savedPremium = localStorage.getItem("premium") === "true";
	const savedSourceStorage = localStorage.getItem("sourceStorage") || "";
	const savedDestinationStorage = localStorage.getItem("destinationStorage") || "";

	document.getElementById("mk15").checked = savedMk15;
	document.getElementById("trailer").value = savedTrailer;
	document.getElementById("postop").checked = savedPostop;
	document.getElementById("premium").checked = savedPremium;
	document.getElementById("sourceStorage").value = savedSourceStorage;
	document.getElementById("destinationStorage").value = savedDestinationStorage;
}

function setupEventListeners() {
	// Calculate on input changes
	document.getElementById("mk15").addEventListener("change", function () {
		saveSettings();
		calculateRuns();
	});

	document.getElementById("trailer").addEventListener("change", function () {
		saveSettings();
		calculateRuns();
	});

	document.getElementById("postop").addEventListener("change", function () {
		saveSettings();
		calculateRuns();
	});

	document.getElementById("premium").addEventListener("change", function () {
		saveSettings();
		calculateRuns();
	});

	document.getElementById("sourceStorage").addEventListener("change", function () {
		saveSettings();

		// Force recalculation when storage changes
		renderSelectedItems();
		calculateRuns();
	});


	document.getElementById("destinationStorage").addEventListener("change", function () {
		saveSettings();
		calculateRuns();
	});

	document.getElementById("itemType").addEventListener("change", function () {

		renderSelectedItems(); // Re-render to update remaining counts
		calculateRuns();
	});

	document.getElementById("itemAmount").addEventListener("input", function () {
		calculateRuns();
	});

	// Mini mode and opacity
	document.getElementById("miniMode").addEventListener("change", function () {
		toggleMiniModeUI(this.checked);
		localStorage.setItem("miniMode", this.checked ? "true" : "false");
	});

	// Auto-refresh toggle
	document.getElementById("autoRefresh").addEventListener("change", function () {
		saveSettings();
		if (this.checked) {
			startAutoRefresh();
		} else {
			stopAutoRefresh();
		}
	});
}

function toggleMiniMode() {
	const miniModeCheckbox = document.getElementById("miniMode");
	miniModeCheckbox.checked = !miniModeCheckbox.checked;
	toggleMiniModeUI(miniModeCheckbox.checked);
	localStorage.setItem("miniMode", miniModeCheckbox.checked ? "true" : "false");
}

function toggleMiniModeUI(enabled) {
	const userInput = document.getElementById("main").querySelector(".user-input");
	if (enabled) {
		userInput.classList.add("mini-mode");
		// Expand results submenu in mini mode
		const resultsSubmenu = userInput.querySelector(".results-submenu");
		if (resultsSubmenu) {
			const content = resultsSubmenu.querySelector(".submenu-content");
			const toggle = resultsSubmenu.querySelector(".submenu-toggle");
			if (content.classList.contains("collapsed")) {
				content.classList.remove("collapsed");
				toggle.classList.remove("collapsed");
			}
		}
	} else {
		userInput.classList.remove("mini-mode");
	}
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
	// Load saved API key and user ID
	const savedApiKey = localStorage.getItem("apiKey");
	const savedUserId = localStorage.getItem("userId");
	const savedAlternativeApi = localStorage.getItem("alternativeApi") === "true";
	const savedMiniMode = localStorage.getItem("miniMode") === "true";
	const savedOpacity = localStorage.getItem("panelOpacity");

	if (savedApiKey) document.getElementById("apiKey").value = savedApiKey;
	if (savedUserId) document.getElementById("userId").value = savedUserId;
	if (savedAlternativeApi) {
		document.getElementById("alternativeApi").checked = true;
		apiUrl = ALTERNATIVE_API_URL;
	}
	if (savedMiniMode) {
		document.getElementById("miniMode").checked = true;
		toggleMiniModeUI(true);
	}
	if (savedOpacity) {
		const opacity = parseFloat(savedOpacity);
		document.getElementById("panelOpacity").value = opacity;
		const userInput = document.getElementById("main").querySelector(".user-input");
		userInput.style.opacity = opacity;
	}

	populateItemDropdown();
	setupEventListeners();
	initDragging();
	loadSelectedItems();

	// Load settings after everything is set up
	loadSettings();

	// Panel opacity listener
	document.getElementById("panelOpacity").addEventListener("input", function () {
		const userInput = document.getElementById("main").querySelector(".user-input");
		const opacity = parseFloat(this.value);
		userInput.style.opacity = opacity;
		localStorage.setItem("panelOpacity", opacity.toString());
	});

	// Load storages if API key exists
	if (savedApiKey && savedUserId) {
		fetchStorages().then(() => {
			// Reload settings after storages are loaded to restore storage selections
			loadSettings();
			calculateRuns();
		}).catch(() => {
			populateStorageDropdowns();
			loadSettings();
			calculateRuns();
		});
	} else {
		populateStorageDropdowns();
		loadSettings();
		calculateRuns();
	}

	// Listen for ALL FiveM messages and update storage data in real-time
	window.addEventListener("message", function (event) {
		if (!event.data || typeof event.data !== 'object') return;

		const data = event.data;
		let storageUpdated = false;

		// FiveM sends data as flat key-value pairs
		// Look for chest_ keys which contain storage inventory
		for (const key in data) {
			if (key.startsWith("chest_")) {
				try {
					// Parse the chest data
					let chestInventory = data[key];
					if (typeof chestInventory === 'string') {
						chestInventory = JSON.parse(chestInventory);
					}

					// Update our storage data with this chest's inventory
					if (chestInventory && typeof chestInventory === 'object') {
						// Find matching storage and update item amounts
						storages.forEach(storage => {
							if (storage && storage.items) {
								storage.items.forEach(storageItem => {
									if (storageItem.item) {
										const itemName = storageItem.item.name;
										const itemId = storageItem.item.id;

										// Check if this item is in the chest data
										if (chestInventory[itemName] !== undefined) {
											const newAmount = parseInt(chestInventory[itemName]) || 0;
											if (storageItem.amount !== newAmount) {
												storageItem.amount = newAmount;
												storageUpdated = true;
											}
										} else if (chestInventory[itemId] !== undefined) {
											const newAmount = parseInt(chestInventory[itemId]) || 0;
											if (storageItem.amount !== newAmount) {
												storageItem.amount = newAmount;
												storageUpdated = true;
											}
										}
									}
								});
							}
						});
					}
				} catch (e) {
					// Ignore parse errors
				}
			}
		}

		// If storage was updated, refresh the UI
		if (storageUpdated) {
			renderSelectedItems();
			calculateRuns();
			console.log("✅ Storage updated from FiveM (no API charge)");
		}
	});

	console.log("✓ Runs Calculator initialized");
	console.log("ℹ️ Auto-refresh enabled at 1 second (uses cache - minimal API charges)");

	// Automatic refresh functionality
	let autoRefreshInterval = null;

	function getRefreshInterval() {
		const intervalSelect = document.getElementById('refreshInterval');
		return intervalSelect ? parseInt(intervalSelect.value) : 30000;
	}

	function startAutoRefresh() {
		if (autoRefreshInterval) {
			clearInterval(autoRefreshInterval);
		}

		const interval = getRefreshInterval();
		console.log(`🔄 Auto-refresh enabled - polling API every ${interval / 1000} seconds`);

		// Refresh immediately
		silentRefreshStorages();

		// Then refresh at selected interval
		autoRefreshInterval = setInterval(() => {
			silentRefreshStorages();
		}, interval);
	}

	function stopAutoRefresh() {
		if (autoRefreshInterval) {
			clearInterval(autoRefreshInterval);
			autoRefreshInterval = null;
			console.log("⏸️ Auto-refresh disabled");
		}
	}

	// Auto-refresh toggle handler
	const autoRefreshCheckbox = document.getElementById('autoRefresh');
	const refreshIntervalSelect = document.getElementById('refreshInterval');

	if (autoRefreshCheckbox) {
		autoRefreshCheckbox.addEventListener('change', function () {
			if (this.checked) {
				startAutoRefresh();
			} else {
				stopAutoRefresh();
			}
		});

		// Start if checked by default
		if (autoRefreshCheckbox.checked) {
			startAutoRefresh();
		}
	}

	// Restart auto-refresh when interval changes
	if (refreshIntervalSelect) {
		refreshIntervalSelect.addEventListener('change', function () {
			if (autoRefreshCheckbox && autoRefreshCheckbox.checked) {
				startAutoRefresh(); // Restart with new interval
			}
		});
	}

	console.log("✓ Runs Calculator initialized");
	console.log("ℹ️ Storage data comes from API - click 'Fetch Storages' to update");

	// Console toggle
	const showConsoleCheckbox = document.getElementById('showConsole');
	const debugConsole = document.getElementById('debug-console');
	if (showConsoleCheckbox && debugConsole) {
		showConsoleCheckbox.addEventListener('change', function () {
			debugConsole.style.display = this.checked ? 'block' : 'none';
		});

		// Make console draggable
		const consoleHeader = debugConsole.querySelector('.console-header');
		let isDragging = false;
		let currentX, currentY, initialX, initialY;

		consoleHeader.addEventListener('mousedown', function (e) {
			isDragging = true;
			initialX = e.clientX - debugConsole.offsetLeft;
			initialY = e.clientY - debugConsole.offsetTop;
		});

		document.addEventListener('mousemove', function (e) {
			if (isDragging) {
				e.preventDefault();
				currentX = e.clientX - initialX;
				currentY = e.clientY - initialY;
				debugConsole.style.left = currentX + 'px';
				debugConsole.style.top = currentY + 'px';
				debugConsole.style.bottom = 'auto';
			}
		});

		document.addEventListener('mouseup', function () {
			isDragging = false;
		});
	}

	console.log("✓ Runs Calculator initialized - listening for FiveM storage updates");
});