document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map and set its view to Iceland's coordinates
    const map = L.map('map-container').setView([64.9631, -19.0208], 5); // Zoom level 5

    // Add a tile layer to the map (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    console.log('Map initialized.');

    // --- DATA SIMULATION LOGIC STARTS HERE ---

    const attackTypes = [
        "DDoS", "Malware Infection", "Phishing Attempt", "Ransomware Attack", 
        "SQL Injection", "Man-in-the-Middle", "Zero-Day Exploit"
    ];

    // Approximate coordinates for potential source countries
    // Lat/Lng are approximate and mostly for visual variety on a map later
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
        { name: "Unknown Attacker Group", latitude: 20.0, longitude: 0.0, weight: 1 } // Generic point
    ];

    const targetLocation = {
        name: "Iceland",
        latitude: 64.9631, // For map centering
        longitude: -19.0208
    };

    const attackListElement = document.getElementById('attack-list');
    const placeholderListItem = document.querySelector('.attack-item-placeholder');
    const MAX_LIST_ITEMS = 20; // Max number of attacks to show in the list

    // Helper function to get a random element from an array
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Helper function to get a random weighted element from an array
    function getRandomWeightedElement(weightedArr) {
        let totalWeight = weightedArr.reduce((sum, item) => sum + item.weight, 0);
        let randomNum = Math.random() * totalWeight;
        for (let item of weightedArr) {
            if (randomNum < item.weight) {
                return item;
            }
            randomNum -= item.weight;
        }
        return weightedArr[weightedArr.length - 1]; // Fallback
    }

    // Function to generate a single simulated attack
    function generateSimulatedAttack() {
        const source = getRandomWeightedElement(sourceCountries);
        const type = getRandomElement(attackTypes);
        const timestamp = new Date();
        const severityLevels = ["Low", "Medium", "High", "Critical"];
        const severity = getRandomElement(severityLevels);

        // Simulate a plausible but fake source IP (simplified)
        const fakeIpSegment = () => Math.floor(Math.random() * 255) + 1;
        const fakeSourceIp = `${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}`;

        return {
            id: `attack-${timestamp.getTime()}-${Math.random().toString(16).slice(2)}`, // Unique ID
            sourceCountry: source.name,
            sourceCoords: { lat: source.latitude, lng: source.longitude },
            targetCountry: targetLocation.name,
            targetCoords: { lat: targetLocation.latitude, lng: targetLocation.longitude },
            attackType: type,
            timestamp: timestamp,
            severity: severity,
            sourceIp: fakeSourceIp,
            description: `${type} from ${source.name} targeting ${targetLocation.name}. Severity: ${severity}. (IP: ${fakeSourceIp})`
        };
    }

    // Function to add an attack to the HTML list
    function addAttackToList(attackData) {
        if (placeholderListItem) {
            placeholderListItem.remove(); // Remove "Waiting for attack data..."
        }

        const listItem = document.createElement('li');
        listItem.classList.add('attack-item');
        listItem.setAttribute('data-attack-id', attackData.id); // Store ID for potential future use

        // Simple coloring based on severity
        let severityColor = '#333'; // Default
        switch(attackData.severity) {
            case "Medium": severityColor = '#ffa000'; break; // Orange
            case "High": severityColor = '#d32f2f'; break;   // Red
            case "Critical": severityColor = '#b71c1c'; break; // Darker Red
        }

        listItem.innerHTML = `
            <strong>${attackData.attackType}</strong> (${attackData.severity})<br>
            <small>From: ${attackData.sourceCountry} (IP: ${attackData.sourceIp})</small><br>
            <small>Time: ${attackData.timestamp.toLocaleTimeString()}</small>
        `;
        listItem.style.borderLeft = `4px solid ${severityColor}`;


        // Add new item to the top of the list
        attackListElement.insertBefore(listItem, attackListElement.firstChild);

        // Keep the list size manageable
        if (attackListElement.children.length > MAX_LIST_ITEMS) {
            attackListElement.removeChild(attackListElement.lastChild);
        }
    }

    // --- Simulation Loop ---
    const simulationInterval = 3000; // Generate an attack every 3 seconds (3000ms)

    function startSimulation() {
        console.log("Starting cyberattack simulation...");
        setInterval(() => {
            const newAttack = generateSimulatedAttack();
            console.log("New Attack Generated:", newAttack);
            addAttackToList(newAttack);
            // In the next step, we'll also pass newAttack to a function to draw it on the map.
        }, simulationInterval);
    }

    startSimulation(); // Start the simulation

});