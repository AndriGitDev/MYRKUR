document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map-container').setView([64.9631, -19.0208], 6);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    console.log('Map initialized with dark tiles.');

    const attackTypes = [
        "DDoS", "Malware Infection", "Phishing Attempt", "Ransomware Attack",
        "SQL Injection", "Man-in-the-Middle", "Zero-Day Exploit"
    ];

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

    const attackStats = {};
    let overallLastAttackTimestamp = null;
    const sourceCountryStats = {};

    const attackCountsContainer = document.getElementById('attack-type-counts');
    const overallTimeSinceLastAttackElement = document.getElementById('time-since-last-attack');
    const countryAttackStatsContainer = document.getElementById('country-attack-stats');

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

    sourceCountries.forEach(country => {
        sourceCountryStats[country.name] = { count: 0 };
    });

    const attackListElement = document.getElementById('attack-list');
    const MAX_LIST_ITEMS = 20;
    const MAX_MAP_LINES = 15;
    let displayedMapAttacks = [];

    function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function getRandomWeightedElement(weightedArr) {
        if (!weightedArr || weightedArr.length === 0) {
            console.error("Attempted to get random weighted element from empty or undefined array.");
            return null;
        }
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
        let chosenTargetCity = getRandomWeightedElement(targetCities);

        if (!source) {
            console.error("Failed to get a source country. Skipping attack generation.");
            return null;
        }
        if (!chosenTargetCity) {
            console.warn("Failed to get a target city. Defaulting to Reykjavik.");
            chosenTargetCity = targetCities[0] || { name: "Reykjavik", latitude: 64.1466, longitude: -21.9426 };
        }

        const type = getRandomElement(attackTypes);
        const timestamp = new Date();
        const severityLevels = ["Low", "Medium", "High", "Critical"];
        const severity = getRandomElement(severityLevels);
        const fakeIpSegment = () => Math.floor(Math.random() * 255) + 1;
        const fakeSourceIp = `${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}.${fakeIpSegment()}`;

        attackStats[type].count++;
        attackStats[type].lastAttackTimestamp = timestamp;
        overallLastAttackTimestamp = timestamp;

        if (sourceCountryStats[source.name]) {
            sourceCountryStats[source.name].count++;
        } else {
            sourceCountryStats[source.name] = { count: 1 };
            console.warn(`Source country ${source.name} was not pre-initialized for stats. Added dynamically.`);
        }

        return {
            id: `attack-${timestamp.getTime()}-${Math.random().toString(16).slice(2)}`,
            sourceCountry: source.name, sourceCoords: { lat: source.latitude, lng: source.longitude },
            targetCity: chosenTargetCity.name, targetCountry: "Iceland",
            targetCoords: { lat: chosenTargetCity.latitude, lng: chosenTargetCity.longitude },
            attackType: type, timestamp: timestamp, severity: severity, sourceIp: fakeSourceIp,
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
        if (!attackData) return;

        const currentPlaceholder = document.querySelector('.attack-item-placeholder');
        if (currentPlaceholder) {
            currentPlaceholder.remove();
        }

        const listItem = document.createElement('li');
        listItem.classList.add('attack-item');
        listItem.setAttribute('data-attack-id', attackData.id);
        const severityColor = getAttackColor(attackData.severity);

        listItem.innerHTML = `
            <strong>${attackData.attackType}</strong> <span style="color:${severityColor}; font-weight:bold;">(${attackData.severity})</span><br>
            <small>From: ${attackData.sourceCountry} (IP: ${attackData.sourceIp})</small><br>
            <small>Target: ${attackData.targetCity}, ${attackData.targetCountry}</small><br> 
            <small>Time: ${attackData.timestamp.toLocaleTimeString()}</small>
        `;
        listItem.style.borderLeft = `4px solid ${severityColor}`;

        if (attackListElement) {
            attackListElement.insertBefore(listItem, attackListElement.firstChild);
            if (attackListElement.children.length > MAX_LIST_ITEMS) {
                attackListElement.removeChild(attackListElement.lastChild);
            }
        } else {
            console.error("Error: attack-list element not found in HTML for addAttackToList.");
        }
    }

    function drawAttackOnMap(attackData) {
        if (!attackData) return;
        
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

    function formatTimeSince(timestamp) {
        if (!timestamp) return "N/A";
        const now = new Date();
        const secondsAgo = Math.round((now - timestamp) / 1000);

        if (secondsAgo < 1) return "just now";
        if (secondsAgo < 60) return `${secondsAgo}s ago`;
        if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
        if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
        return `${Math.floor(secondsAgo / 86400)}d ago`;
    }
    
    function updateOverviewUI() {
        attackTypes.forEach(type => {
            const typeId = type.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const countElement = document.getElementById(`count-${typeId}`);
            const timeSinceElement = document.getElementById(`time-since-${typeId}`);

            if (countElement && attackStats[type]) {
                countElement.innerText = attackStats[type].count;
            }
            if (timeSinceElement && attackStats[type]) {
                timeSinceElement.innerText = formatTimeSince(attackStats[type].lastAttackTimestamp);
            }
        });

        if (countryAttackStatsContainer) {
            const sortedCountries = [];
            for (const countryName in sourceCountryStats) {
                sortedCountries.push({
                    name: countryName,
                    count: sourceCountryStats[countryName].count
                });
            }

            sortedCountries.sort((a, b) => b.count - a.count);

            const existingItems = countryAttackStatsContainer.querySelectorAll('.country-stat-item');
            existingItems.forEach(item => item.remove());

            sortedCountries.forEach(country => {
                const countryId = country.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const countryStatElement = document.createElement('div');
                countryStatElement.classList.add('country-stat-item');
                countryStatElement.innerHTML = `
                    <span class="country-name">${country.name}:</span>
                    <span class="country-count" id="country-count-${countryId}">${country.count}</span>
                `;
                countryAttackStatsContainer.appendChild(countryStatElement);
            });
        }

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
            if (newAttack) {
                addAttackToList(newAttack);
                drawAttackOnMap(newAttack);
            }
            updateOverviewUI(); 
        }, simulationInterval);
        setInterval(updateOverviewUI, 1000);
    }
    startSimulation();

    // --- Disclaimer Modal Logic (from Step 13) ---
    const disclaimerButton = document.getElementById('disclaimer-button');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    
    // Check if disclaimerModal itself exists before querying its child
    if (disclaimerModal) {
        const modalCloseButton = disclaimerModal.querySelector('.modal-close-button');

        if (disclaimerButton && modalCloseButton) { // modalCloseButton is only defined if disclaimerModal exists
            disclaimerButton.addEventListener('click', function(event) {
                event.preventDefault(); 
                disclaimerModal.classList.add('visible'); 
            });

            modalCloseButton.addEventListener('click', function() {
                disclaimerModal.classList.remove('visible'); 
            });

            disclaimerModal.addEventListener('click', function(event) {
                if (event.target === disclaimerModal) { 
                    disclaimerModal.classList.remove('visible'); 
                }
            });

            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && disclaimerModal.classList.contains('visible')) {
                    disclaimerModal.classList.remove('visible'); 
                }
            });
        } else {
            if (!disclaimerButton) console.warn("Disclaimer button not found.");
            if (!modalCloseButton) console.warn("Modal close button not found (likely because modal itself or child is missing).");
        }
    } else {
        console.warn("Disclaimer modal (#disclaimer-modal) not found in HTML.");
    }
    // --- END: Disclaimer Modal Logic ---

}); // End of DOMContentLoaded