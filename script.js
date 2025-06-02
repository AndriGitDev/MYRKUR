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

    // --- START: Overview Section Variables ---
    const attackTypeCounts = {};
    let lastAttackTimestamp = null;
    const attackCountsContainer = document.getElementById('attack-type-counts');
    const timeSinceLastAttackElement = document.getElementById('time-since-last-attack');

    // Initialize attack counts and create HTML elements for them
    attackTypes.forEach(type => {
        attackTypeCounts[type] = 0;
        const typeId = type.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''); // Sanitize ID
        const p = document.createElement('p');
        // CORRECTED LINE: Ensure this is a clean template literal
        p.innerHTML = `${type}: <span id="count-${typeId}">${attackTypeCounts[type]}</span>`;
        if (attackCountsContainer) {
            attackCountsContainer.appendChild(p);
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
            if (randomNum < weight) {
                return item;
            }
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
        
        // CORRECTED FAKE IP GENERATION
        const fakeIpSegment = () => Math.floor(Math.random() * 255) + 1;
        const fakeSourceIp = `${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}`;

        attackTypeCounts[type]++;
        lastAttackTimestamp = timestamp;

        // CORRECTED ID GENERATION
        return {
            id: `attack-${timestamp.getTime()}-${Math.random().toString(16).slice(2)}`,
            sourceCountry: source.name,
            sourceCoords: { lat: source.latitude, lng: source.longitude },
            targetCity: chosenTargetCity.name,
            targetCountry: "Iceland",
            targetCoords: { lat: chosenTargetCity.latitude, lng: chosenTargetCity.longitude },
            attackType: type,
            timestamp: timestamp,
            severity: severity,
            sourceIp: fakeSourceIp, // This will now be the clean IP string
            description: `${type} from ${source.name} targeting ${chosenTargetCity.name}, Iceland. Severity: ${severity}. (IP: ${fakeSourceIp})`
        };
    }

    function getAttackColor(severity) {
        switch(severity) {
            case "Low": return '#4caf50';
            case "Medium": return '#ffc107';
            case "High": return '#ff9800';
            case "Critical": return '#f44336';
            default: return '#9e9e9e';
        }
    }

    function addAttackToList(attackData) {
        const currentPlaceholder = document.querySelector('.attack-item-placeholder');
        if (currentPlaceholder) {
            currentPlaceholder.remove();
        }
        const listItem = document.createElement('li');
        listItem.classList.add('attack-item');
        listItem.setAttribute('data-attack-id', attackData.id);
        const severityColor = getAttackColor(attackData.severity);

        // CORRECTED listItem.innerHTML
        listItem.innerHTML = `
            <strong>${attackData.attackType}</strong> <span style="color:${severityColor}; font-weight:bold;">(${attackData.severity})</span><br>
            <small>From: ${attackData.sourceCountry} (IP: ${attackData.sourceIp})</small><br>
            <small>Target: ${attackData.targetCity}, ${attackData.targetCountry}</small><br> 
            <small>Time: ${attackData.timestamp.toLocaleTimeString()}</small>
        `;
        listItem.style.borderLeft = `4px solid ${severityColor}`;
        attackListElement.insertBefore(listItem, attackListElement.firstChild);
        if (attackListElement.children.length > MAX_LIST_ITEMS) {
            attackListElement.removeChild(attackListElement.lastChild);
        }
    }

    function drawAttackOnMap(attackData) {
        const sourceLatLng = L.latLng(attackData.sourceCoords.lat, attackData.sourceCoords.lng);
        const targetLatLng = L.latLng(attackData.targetCoords.lat, attackData.targetCoords.lng);
        const lineColor = getAttackColor(attackData.severity);
        const polyline = L.polyline([sourceLatLng, targetLatLng], {
            color: lineColor, weight: 2, opacity: 0.7
        }).addTo(map);
        const sourceMarker = L.circleMarker(sourceLatLng, {
            radius: 4, fillColor: lineColor, color: "#fff", weight: 1, opacity: 0.8, fillOpacity: 0.7
        }).addTo(map);
        const targetPulse = L.circleMarker(targetLatLng, {
            radius: 8, fillColor: lineColor, color: lineColor, weight: 2, opacity: 0.8, fillOpacity: 0.5
        }).addTo(map);
        let pulseRadius = 8; let pulseOpacity = 0.5;
        const pulseInterval = setInterval(() => {
            pulseRadius += 4; pulseOpacity -= 0.05;
            if (pulseOpacity <= 0) {
                map.removeLayer(targetPulse); clearInterval(pulseInterval);
            } else {
                targetPulse.setRadius(pulseRadius); targetPulse.setStyle({fillOpacity: pulseOpacity, opacity: pulseOpacity});
            }
        }, 50);
        const attackVisualization = { id: attackData.id, line: polyline, sourceMarker: sourceMarker };
        displayedMapAttacks.push(attackVisualization);
        if (displayedMapAttacks.length > MAX_MAP_LINES) {
            const oldestAttack = displayedMapAttacks.shift();
            map.removeLayer(oldestAttack.line); map.removeLayer(oldestAttack.sourceMarker);
        }
    }

    function updateOverviewUI() {
        attackTypes.forEach(type => {
            const typeId = type.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const countElement = document.getElementById(`count-${typeId}`);
            if (countElement) {
                countElement.innerText = attackTypeCounts[type];
            }
        });

        if (lastAttackTimestamp && timeSinceLastAttackElement) {
            const now = new Date();
            const secondsAgo = Math.round((now - lastAttackTimestamp) / 1000);
            
            // CORRECTED "Time Since Last Attack" string generation
            if (secondsAgo < 1) {
                 timeSinceLastAttackElement.innerText = "just now";
            } else if (secondsAgo < 60) {
                timeSinceLastAttackElement.innerText = `${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`;
            } else {
                const minutesAgo = Math.floor(secondsAgo / 60);
                const remainingSeconds = secondsAgo % 60;
                timeSinceLastAttackElement.innerText = `${minutesAgo} min${minutesAgo === 1 ? '' : 's'}, ${remainingSeconds} sec${remainingSeconds === 1 ? '' : 's'} ago`;
            }
        } else if (timeSinceLastAttackElement) {
            timeSinceLastAttackElement.innerText = "No attacks yet.";
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

        setInterval(updateOverviewUI, 1000);
    }

    startSimulation();
});