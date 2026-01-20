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
	buttonContainer.addEventListener('mousedown', function(e) {
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
	
	document.addEventListener('mousemove', function(e) {
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
	
	document.addEventListener('mouseup', function() {
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
	
	// Determine which trailer to use
	if (mk15Checked) {
		capacity = TRAILER_CAPACITIES.mk15.capacity;
	} else if (trailerSelect && TRAILER_CAPACITIES[trailerSelect]) {
		capacity = TRAILER_CAPACITIES[trailerSelect].capacity;
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

function calculateRuns() {
	const itemType = document.getElementById("itemType").value;
	const currentItems = parseInt(document.getElementById("currentItems").value) || 0;
	const moveAll = document.getElementById("moveAll").checked;
	const moveAmount = parseInt(document.getElementById("moveAmount").value) || 0;
	const capacity = calculateCapacity();
	
	// Get item weight
	let itemWeight = 0;
	if (itemType && ITEM_WEIGHTS[itemType]) {
		itemWeight = ITEM_WEIGHTS[itemType].weight;
	}
	
	// Calculate total weight
	const totalWeight = currentItems * itemWeight;
	
	// Determine items to move
	let itemsToMove = 0;
	if (moveAll) {
		itemsToMove = currentItems;
	} else {
		itemsToMove = Math.min(moveAmount, currentItems);
	}
	
	// Calculate weight to move
	const weightToMove = itemsToMove * itemWeight;
	
	// Calculate runs required based on weight
	let runsRequired = 0;
	if (capacity > 0 && weightToMove > 0) {
		runsRequired = Math.ceil(weightToMove / capacity);
	}
	
	// Update display
	document.getElementById("total-items").textContent = currentItems.toLocaleString();
	document.getElementById("item-weight").textContent = itemWeight.toLocaleString();
	document.getElementById("total-weight").textContent = totalWeight.toLocaleString();
	document.getElementById("trailer-capacity").textContent = capacity.toLocaleString();
	document.getElementById("items-to-move").textContent = itemsToMove.toLocaleString();
	document.getElementById("weight-to-move").textContent = weightToMove.toLocaleString();
	document.getElementById("runs-required").textContent = runsRequired.toLocaleString();
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

function setupEventListeners() {
	// Toggle move all / specific amount
	document.getElementById("moveAll").addEventListener("change", function() {
		const moveAmountInput = document.getElementById("moveAmount");
		if (this.checked) {
			moveAmountInput.disabled = true;
			moveAmountInput.value = 0;
		} else {
			moveAmountInput.disabled = false;
		}
		calculateRuns();
	});
	
	// Calculate on input changes
	document.getElementById("mk15").addEventListener("change", function() {
		if (this.checked) {
			document.getElementById("trailer").value = "";
		}
		calculateRuns();
	});
	
	document.getElementById("trailer").addEventListener("change", function() {
		if (this.value) {
			document.getElementById("mk15").checked = false;
		}
		calculateRuns();
	});
	
	document.getElementById("postop").addEventListener("change", calculateRuns);
	document.getElementById("premium").addEventListener("change", calculateRuns);
	document.getElementById("itemType").addEventListener("change", calculateRuns);
	document.getElementById("currentItems").addEventListener("input", calculateRuns);
	document.getElementById("moveAmount").addEventListener("input", calculateRuns);
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
	populateItemDropdown();
	setupEventListeners();
	initDragging();
	calculateRuns();
});
