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

    // --- MODIFIED: Overview Section Variables & Initialization ---
    const attackStats = {}; // Will store { "DDoS": { count: 0, lastAttackTimestamp: null }, ... }
    let overallLastAttackTimestamp = null; // For the separate "Last Attack" display

    const attackCountsContainer = document.getElementById('attack-type-counts'); // Container for circles
    const overallTimeSinceLastAttackElement = document.getElementById('time-since-last-attack'); // For the overall last attack

    // Initialize attack stats and create HTML elements for circles
    attackTypes.forEach(type => {
        attackStats[type] = { count: 0, lastAttackTimestamp: null };
        const typeId = type.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

        const circleDiv = document.createElement('div');
        circleDiv.classList.add('attack-circle');
        // Add a data attribute for the type, useful for styling or selection if needed
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
    // --- END: Overview Section Variables ---

    const sourceCountries = [
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

    const targetCities = [
        { name: "Reykjavik", latitude: 64.1466, longitude: -21.9426, weight: 8 },
        { name: "Akureyri", latitude: 65.6835, longitude: -18.1000, weight: 2 }
    ];

    const attackListElement = document.getElementById('attack-list');
    const MAX_LIST_ITEMS = 20;
    const MAX_MAP_LINES = 15;
    let displayedMapAttacks = [];

    function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function getRandomWeightedElement(weightedArr) {
        let totalWeight = weightedArr.reduce((sum, item) => sum + (item.weight || 1), 0);
        let randomNum = Math.random() * totalWeight;
        for (let item of weightedArr) {
            const weight = item.weight || 1;
            if (randomNum < weight) { return item; }
            randomNum -= weight;
        }
        return weightedArr[weightedArr.length - 1];
    }

    function generateSimulatedAttack() {
        const source = getRandomWeightedElement(sourceCountries);
        const chosenTargetCity = getRandomWeightedElement(targetCities);
        const type = getRandomElement(attackTypes);
        const timestamp = new Date();
        const severityLevels = ["Low", "Medium", "High", "Critical"];
        const severity = getRandomElement(severityLevels);
        const fakeIpSegment = () => Math.floor(Math.random() * 255) + 1;
        const fakeSourceIp = `${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}`;

        // MODIFIED: Update new attackStats structure and overallLastAttackTimestamp
        attackStats[type].count++;
        attackStats[type].lastAttackTimestamp = timestamp;
        overallLastAttackTimestamp = timestamp; // For the global "Last Attack" display

        return {
            id: `attack-${timestamp.getTime()}-${Math.random().toString(16).slice(2)}`,
            sourceCountry: source.name, sourceCoords: { lat: source.latitude, lng: source.longitude },
            targetCity: chosenTargetCity.name, targetCountry: "Iceland",
            targetCoords: { lat: chosenTargetCity.latitude, lng: chosenTargetCity.longitude },
            attackType: type, timestamp: timestamp, severity: severity, sourceIp: fakeSourceIp,
            description: `${type} from ${source.name} targeting ${chosenTargetCity.name}, Iceland. Severity: ${severity}. (IP: ${fakeSourceIp})`
        };
    }

    function getAttackColor(severity) { /* ... (no change) ... */ }
    function addAttackToList(attackData) { /* ... (no change) ... */ }
    function drawAttackOnMap(attackData) { /* ... (no change) ... */ }

    // MODIFIED: Function to Update Overview UI (both circles and overall last attack)
    function formatTimeSince(timestamp) {
        if (!timestamp) return "N/A";
        const now = new Date();
        const secondsAgo = Math.round((now - timestamp) / 1000);

        if (secondsAgo < 1) return "just now";
        if (secondsAgo < 60) return `${secondsAgo}s ago`;
        if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
        if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
        return `${Math.floor(secondsAgo / 86400)}d ago`; // Days
    }
    
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

        // Update overall "time since last attack" (if element exists)
        if (overallTimeSinceLastAttackElement) {
            if (overallLastAttackTimestamp) {
                const now = new Date();
                const secondsAgo = Math.round((now - overallLastAttackTimestamp) / 1000);
                if (secondsAgo < 1) {
                    overallTimeSinceLastAttackElement.innerText = "just now";
                } else if (secondsAgo < 60) {
                    overallTimeSinceLastAttackElement.innerText = `${secondsAgo} sec${secondsAgo === 1 ? '' : 's'} ago`;
                } else {
                    const minutesAgo = Math.floor(secondsAgo / 60);
                    const remainingSeconds = secondsAgo % 60;
                    overallTimeSinceLastAttackElement.innerText = `${minutesAgo} min${minutesAgo === 1 ? '' : 's'}, ${remainingSeconds} sec${remainingSeconds === 1 ? '' : 's'} ago`;
                }
            } else {
                overallTimeSinceLastAttackElement.innerText = "No attacks yet.";
            }
        }
    }
    
    const simulationInterval = 3000;
    function startSimulation() {
        console.log("Starting cyberattack simulation...");
        setInterval(() => {
            const newAttack = generateSimulatedAttack();
            addAttackToList(newAttack);
            drawAttackOnMap(newAttack);
            updateOverviewUI();
        }, simulationInterval);
        setInterval(updateOverviewUI, 1000); // Refresh times every second
    }
    startSimulation();
});