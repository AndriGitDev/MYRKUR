document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map-container').setView([64.9631, -19.0208], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    console.log('Map initialized.');

    const attackTypes = [
        "DDoS", "Malware Infection", "Phishing Attempt", "Ransomware Attack",
        "SQL Injection", "Man-in-the-Middle", "Zero-Day Exploit"
    ];

    const sourceCountries = [ // Ensure this list is comprehensive for display
        { name: "Russia", latitude: 61.5240, longitude: 105.3188, weight: 3 },
        { name: "China", latitude: 35.8617, longitude: 104.1954, weight: 3 },
        { name: "USA", latitude: 38.9637, longitude: -95.7129, weight: 2 },
        { name: "Brazil", latitude: -14.2350, longitude: -51.9253, weight: 1 },
        { name: "Germany", latitude: 51.1657, longitude: 10.4515, weight: 2 },
        { name: "Iran", latitude: 32.4279, longitude: 53.6880, weight: 2 },
        { name: "North Korea", latitude: 40.3399, longitude: 127.5101, weight: 2 },
        { name: "United Kingdom", latitude: 55.3781, longitude: -3.4360, weight: 1 },
        { name: "Netherlands", latitude: 52.1326, longitude: 5.2913, weight: 1 },
        { name: "Unknown Attacker Group", latitude: 20.0, longitude: 0.0, weight: 1 }
    ];

    // --- Overview Section Variables & Initialization ---
    const attackStats = {}; 
    let overallLastAttackTimestamp = null; 
    const sourceCountryStats = {}; // NEW: To store counts like {"Russia": { count: 0 }, ...}

    const attackCountsContainer = document.getElementById('attack-type-counts');
    const overallTimeSinceLastAttackElement = document.getElementById('time-since-last-attack');
    const countryAttackStatsContainer = document.getElementById('country-attack-stats'); // NEW: Container for country stats

    // Initialize attack type stats and create HTML for circles
    attackTypes.forEach(type => {
        attackStats[type] = { count: 0, lastAttackTimestamp: null };
        const typeId = type.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const circleDiv = document.createElement('div');
        circleDiv.classList.add('attack-circle');
        circleDiv.setAttribute('data-attack-type', typeId);
        circleDiv.innerHTML = `
            <h5 class="circle-attack-name">${type}</h5>
            <p class="circle-attack-count" id="count-${typeId}">0</p>
            <p class="circle-last-attack-time">
                Last: <span id="time-since-${typeId}">N/A</span>
            </p>
        `;
        if (attackCountsContainer) {
            attackCountsContainer.appendChild(circleDiv);
        }
    });

    // NEW: Initialize source country stats and create HTML elements for them
    if (countryAttackStatsContainer) { // Check if the main container exists
        sourceCountries.forEach(country => {
            sourceCountryStats[country.name] = { count: 0 }; // Initialize count
            const countryId = country.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            
            const countryStatElement = document.createElement('div');
            countryStatElement.classList.add('country-stat-item');
            countryStatElement.innerHTML = `
                <span class="country-name">${country.name}:</span> 
                <span class="country-count" id="country-count-${countryId}">0</span>
            `;
            countryAttackStatsContainer.appendChild(countryStatElement);
        });
    }
    // --- END: Overview Section Initialization ---

    const targetCities = [ /* ... (as before) ... */ ];
    const attackListElement = document.getElementById('attack-list');
    const MAX_LIST_ITEMS = 20;
    const MAX_MAP_LINES = 15;
    let displayedMapAttacks = [];

    function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function getRandomWeightedElement(weightedArr) { /* ... (as before) ... */ }

    function generateSimulatedAttack() {
        const source = getRandomWeightedElement(sourceCountries); // source is { name: "Russia", ... }
        const chosenTargetCity = getRandomWeightedElement(targetCities);
        const type = getRandomElement(attackTypes);
        const timestamp = new Date();
        const severityLevels = ["Low", "Medium", "High", "Critical"];
        const severity = getRandomElement(severityLevels);
        const fakeIpSegment = () => Math.floor(Math.random() * 255) + 1;
        const fakeSourceIp = `${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}`;

        // Update attack type stats
        attackStats[type].count++;
        attackStats[type].lastAttackTimestamp = timestamp;
        overallLastAttackTimestamp = timestamp; 

        // NEW: Update source country stats
        if (sourceCountryStats[source.name]) {
            sourceCountryStats[source.name].count++;
        } else {
            // This case would happen if a country appears that's not in the initial sourceCountries list
            // For simplicity, we're assuming all simulated sources are in the initial list
            console.warn(`Source country ${source.name} not pre-initialized for stats.`);
        }

        return { /* ... (return object as before, no changes needed here) ... */ };
    }

    function getAttackColor(severity) { /* ... (as before) ... */ }
    function addAttackToList(attackData) { /* ... (as before) ... */ }
    function drawAttackOnMap(attackData) { /* ... (as before) ... */ }
    function formatTimeSince(timestamp) { /* ... (as before) ... */ }
    
    function updateOverviewUI() {
        // Update attack type stats in circles
        attackTypes.forEach(type => {
            const typeId = type.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const countElement = document.getElementById(`count-${typeId}`);
            const timeSinceElement = document.getElementById(`time-since-${typeId}`);

            if (countElement) {
                countElement.innerText = attackStats[type].count;
            }
            if (timeSinceElement) {
                timeSinceElement.innerText = formatTimeSince(attackStats[type].lastAttackTimestamp);
            }
        });

        // NEW: Update source country counts
        for (const countryName in sourceCountryStats) {
            const countryId = countryName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const countElement = document.getElementById(`country-count-${countryId}`);
            if (countElement) {
                countElement.innerText = sourceCountryStats[countryName].count;
            }
        }

        // Update overall "time since last attack" 
        if (overallTimeSinceLastAttackElement) { /* ... (as before) ... */ }
    }
    
    const simulationInterval = 3000;
    function startSimulation() { /* ... (as before) ... */ }
    startSimulation();
});