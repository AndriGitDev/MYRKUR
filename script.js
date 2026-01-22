document.addEventListener('DOMContentLoaded', function () {
    // Initialize map without default zoom controls
    const map = L.map('map-container', {
        zoomControl: false
    }).setView([64.9631, -19.0208], 6);

    // Add dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    console.log('MYRKUR initialized - Monitoring cyber threats targeting Iceland...');

    // Attack types with realistic weights
    const attackTypes = [
        { name: "DDoS Attack", weight: 25, severity_weight: {Low: 10, Medium: 40, High: 35, Critical: 15} },
        { name: "Credential Stuffing", weight: 20, severity_weight: {Low: 30, Medium: 45, High: 20, Critical: 5} },
        { name: "Phishing Campaign", weight: 18, severity_weight: {Low: 40, Medium: 35, High: 20, Critical: 5} },
        { name: "Ransomware", weight: 8, severity_weight: {Low: 5, Medium: 15, High: 40, Critical: 40} },
        { name: "SQL Injection", weight: 10, severity_weight: {Low: 20, Medium: 40, High: 30, Critical: 10} },
        { name: "XSS Attack", weight: 8, severity_weight: {Low: 35, Medium: 40, High: 20, Critical: 5} },
        { name: "Zero-Day Exploit", weight: 3, severity_weight: {Low: 0, Medium: 10, High: 30, Critical: 60} },
        { name: "Supply Chain Attack", weight: 2, severity_weight: {Low: 0, Medium: 5, High: 35, Critical: 60} },
        { name: "DNS Hijacking", weight: 3, severity_weight: {Low: 10, Medium: 30, High: 40, Critical: 20} },
        { name: "Cryptojacking", weight: 3, severity_weight: {Low: 40, Medium: 40, High: 15, Critical: 5} }
    ];

    // Source countries with attack preferences
    const sourceCountries = [
        { name: "Russia", latitude: 61.5240, longitude: 105.3188, weight: 18 },
        { name: "China", latitude: 35.8617, longitude: 104.1954, weight: 16 },
        { name: "North Korea", latitude: 40.3399, longitude: 127.5101, weight: 8 },
        { name: "Iran", latitude: 32.4279, longitude: 53.6880, weight: 7 },
        { name: "USA", latitude: 38.9637, longitude: -95.7129, weight: 6 },
        { name: "India", latitude: 20.5937, longitude: 78.9629, weight: 5 },
        { name: "Brazil", latitude: -14.2350, longitude: -51.9253, weight: 5 },
        { name: "Turkey", latitude: 38.9637, longitude: 35.2433, weight: 4 },
        { name: "Vietnam", latitude: 14.0583, longitude: 108.2772, weight: 4 },
        { name: "Romania", latitude: 45.9432, longitude: 24.9668, weight: 4 },
        { name: "Germany", latitude: 51.1657, longitude: 10.4515, weight: 3 },
        { name: "Netherlands", latitude: 52.1326, longitude: 5.2913, weight: 3 },
        { name: "United Kingdom", latitude: 55.3781, longitude: -3.4360, weight: 3 },
        { name: "Ukraine", latitude: 48.3794, longitude: 31.1656, weight: 3 },
        { name: "Poland", latitude: 51.9194, longitude: 19.1451, weight: 2 },
        { name: "Unknown (Tor)", latitude: 0, longitude: 0, weight: 9 }
    ];

    // Target cities in Iceland
    const targetCities = [
        { name: "Reykjavik", latitude: 64.1466, longitude: -21.9426, weight: 45, 
          sectors: ["Government", "Financial", "Healthcare", "Energy"] },
        { name: "Keflavik", latitude: 64.0049, longitude: -22.5624, weight: 15, 
          sectors: ["Aviation", "Defense"] },
        { name: "Akureyri", latitude: 65.6835, longitude: -18.1000, weight: 10, 
          sectors: ["Healthcare", "Education"] },
        { name: "Hafnarfjordur", latitude: 64.0671, longitude: -21.9377, weight: 8, 
          sectors: ["Industrial", "Maritime"] }
    ];

    // Target sectors
    const targetSectors = {
        "Government": ["Parliament Network", "Municipal Systems"],
        "Financial": ["Landsbankinn", "Arion Bank", "Islandsbanki"],
        "Healthcare": ["Landspitali Hospital", "Health Records System"],
        "Energy": ["ON Power", "Landsvirkjun"],
        "Aviation": ["Keflavik International", "Air Traffic Control"],
        "Defense": ["NATO Systems", "Coast Guard"],
        "Industrial": ["Aluminum Smelters", "Manufacturing"],
        "Maritime": ["Port Authority", "Shipping Systems"],
        "Education": ["University of Iceland", "School Networks"]
    };

    // Global variables
    const attackStats = {};
    let overallLastAttackTimestamp = null;
    const sourceCountryStats = {};
    let totalAttacksCount = 0;
    let blockedAttacksCount = 0;
    let feedPaused = false;
    const MAX_LIST_ITEMS = 20;
    const MAX_MAP_LINES = 15;
    let displayedMapAttacks = [];

    // Initialize stats
    attackTypes.forEach(type => {
        attackStats[type.name] = { count: 0, lastAttackTimestamp: null, blocked: 0 };
    });

    sourceCountries.forEach(country => {
        sourceCountryStats[country.name] = { count: 0, blocked: 0 };
    });

    // Initialize attack type display circles
    const attackCountsContainer = document.getElementById('attack-type-counts');
    if (attackCountsContainer) {
        // Find or create the grid container
        let gridContainer = attackCountsContainer.querySelector('.attack-types-grid');
        if (!gridContainer) {
            gridContainer = document.createElement('div');
            gridContainer.classList.add('attack-types-grid');
            attackCountsContainer.appendChild(gridContainer);
        }

        attackTypes.forEach(type => {
            const typeId = type.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const circleDiv = document.createElement('div');
            circleDiv.classList.add('attack-circle');
            circleDiv.innerHTML = `
                <h5 class="circle-attack-name">${type.name}</h5>
                <p class="circle-attack-count" id="count-${typeId}">0</p>
                <p class="circle-last-attack-time">
                    <span id="time-since-${typeId}">--</span>
                </p>
            `;
            gridContainer.appendChild(circleDiv);
        });
    }

    // Helper functions
    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomWeightedElement(weightedArr) {
        if (!weightedArr || weightedArr.length === 0) return null;
        let totalWeight = weightedArr.reduce((sum, item) => sum + (item.weight || 1), 0);
        let randomNum = Math.random() * totalWeight;
        for (let item of weightedArr) {
            const weight = item.weight || 1;
            if (randomNum < weight) return item;
            randomNum -= weight;
        }
        return weightedArr[weightedArr.length - 1];
    }

    function getWeightedSeverity(attackType) {
        const attack = attackTypes.find(a => a.name === attackType);
        if (!attack) return "Medium";
        
        const weights = attack.severity_weight;
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (const [severity, weight] of Object.entries(weights)) {
            if (random < weight) return severity;
            random -= weight;
        }
        return "Medium";
    }

    function generateRealisticIP(country) {
        const ipRanges = {
            "Russia": ["91.", "92.", "94."],
            "China": ["1.", "14.", "27."],
            "USA": ["3.", "4.", "8."],
            "Unknown (Tor)": ["192.168.", "10."]
        };
        
        const prefixes = ipRanges[country] || ["185.", "194."];
        const prefix = getRandomElement(prefixes);
        const octets = [];
        
        const remainingOctets = 4 - prefix.split('.').length + 1;
        for (let i = 0; i < remainingOctets; i++) {
            octets.push(Math.floor(Math.random() * 254) + 1);
        }
        
        return prefix + octets.join('.');
    }

    function getAttackPort(attackType) {
        const portMappings = {
            "DDoS Attack": [80, 443, 53],
            "SQL Injection": [1433, 3306],
            "Credential Stuffing": [22, 23, 21, 3389],
            "Phishing Campaign": [25, 587, 443],
            "Ransomware": [445, 139, 3389],
            "XSS Attack": [80, 443],
            "DNS Hijacking": [53],
            "Cryptojacking": [3333, 8333],
            "Zero-Day Exploit": [0, 135, 445],
            "Supply Chain Attack": [443, 22]
        };
        
        const ports = portMappings[attackType] || [443, 80];
        return getRandomElement(ports);
    }

    function calculateBlockProbability(severity, attackType) {
        const baseBlockRates = {
            "DDoS Attack": 0.75,
            "Phishing Campaign": 0.65,
            "SQL Injection": 0.70,
            "XSS Attack": 0.72,
            "Credential Stuffing": 0.60,
            "Ransomware": 0.55,
            "Zero-Day Exploit": 0.25,
            "Supply Chain Attack": 0.30,
            "DNS Hijacking": 0.50,
            "Cryptojacking": 0.68
        };
        
        const severityModifiers = {
            "Low": 0.15,
            "Medium": 0.05,
            "High": -0.10,
            "Critical": -0.25
        };
        
        const baseRate = baseBlockRates[attackType] || 0.5;
        const modifier = severityModifiers[severity] || 0;
        
        return Math.max(0.1, Math.min(0.95, baseRate + modifier));
    }

    function generateSimulatedAttack() {
        const source = getRandomWeightedElement(sourceCountries);
        if (!source) return null;

        const attackTypeObj = getRandomWeightedElement(attackTypes);
        const attackType = attackTypeObj.name;

        let targetCity = getRandomWeightedElement(targetCities);
        if (!targetCity) targetCity = targetCities[0];

        const targetSector = getRandomElement(targetCity.sectors);
        const targetSystem = getRandomElement(targetSectors[targetSector] || ["Unknown System"]);

        const timestamp = new Date();
        const severity = getWeightedSeverity(attackType);
        const sourceIp = generateRealisticIP(source.name);
        const targetPort = getAttackPort(attackType);
        
        const blockProbability = calculateBlockProbability(severity, attackType);
        const isBlocked = Math.random() < blockProbability;
        
        totalAttacksCount++;
        if (isBlocked) blockedAttacksCount++;
        
        attackStats[attackType].count++;
        attackStats[attackType].lastAttackTimestamp = timestamp;
        if (isBlocked) attackStats[attackType].blocked++;
        
        overallLastAttackTimestamp = timestamp;

        sourceCountryStats[source.name].count++;
        if (isBlocked) sourceCountryStats[source.name].blocked++;

        return {
            id: `attack-${timestamp.getTime()}-${Math.random().toString(16).slice(2)}`,
            sourceCountry: source.name,
            sourceCoords: { lat: source.latitude, lng: source.longitude },
            targetCity: targetCity.name,
            targetCountry: "Iceland",
            targetCoords: { lat: targetCity.latitude, lng: targetCity.longitude },
            targetSector: targetSector,
            targetSystem: targetSystem,
            attackType: attackType,
            timestamp: timestamp,
            severity: severity,
            sourceIp: sourceIp,
            targetPort: targetPort,
            isBlocked: isBlocked
        };
    }

    function getAttackColor(severity, isBlocked = false) {
        // Modern color palette matching CSS variables
        const colors = {
            Low: { active: '#00d4aa', blocked: '#007a63' },
            Medium: { active: '#ffd23f', blocked: '#b39200' },
            High: { active: '#ff8c42', blocked: '#b35f2d' },
            Critical: { active: '#ff3a5e', blocked: '#b32941' }
        };

        const colorSet = colors[severity] || colors.Medium;
        return isBlocked ? colorSet.blocked : colorSet.active;
    }

    function addAttackToList(attackData) {
        if (!attackData || feedPaused) return;

        const attackListElement = document.getElementById('attack-list');
        if (!attackListElement) return;

        const placeholder = attackListElement.querySelector('.attack-item-placeholder');
        if (placeholder) placeholder.remove();

        const listItem = document.createElement('li');
        listItem.classList.add('attack-item');
        if (attackData.isBlocked) listItem.classList.add('blocked-attack');

        const severityColor = getAttackColor(attackData.severity, attackData.isBlocked);
        const statusIcon = attackData.isBlocked ? '[+]' : '[!]';
        const statusText = attackData.isBlocked ? 'BLOCKED' : 'ACTIVE';

        // Severity badge colors for text
        const severityTextColors = {
            Low: '#0a0a0f',
            Medium: '#0a0a0f',
            High: '#0a0a0f',
            Critical: '#ffffff'
        };

        listItem.innerHTML = `
            <div class="attack-header">
                <strong>${attackData.attackType}</strong>
                <span class="attack-status ${attackData.isBlocked ? 'blocked' : 'active'}">${statusIcon} ${statusText}</span>
            </div>
            <div class="attack-details">
                <span class="severity-badge" style="background-color:${severityColor}; color:${severityTextColors[attackData.severity] || '#0a0a0f'}">${attackData.severity.toUpperCase()}</span>
                <small class="attack-target">${attackData.targetSystem}</small>
            </div>
            <small class="attack-meta">
                ${attackData.sourceCountry} &gt; ${attackData.targetCity} // ${attackData.sourceIp}:${attackData.targetPort}
            </small>
            <small class="attack-time">${attackData.timestamp.toLocaleTimeString('en-US', { hour12: false })}</small>
        `;
        listItem.style.setProperty('--attack-color', severityColor);
        listItem.querySelector('.attack-item::before')?.style.setProperty('background', severityColor);

        // Set the left border color using inline style
        listItem.style.borderLeftColor = severityColor;
        listItem.style.borderLeftWidth = '3px';
        listItem.style.borderLeftStyle = 'solid';

        attackListElement.insertBefore(listItem, attackListElement.firstChild);

        while (attackListElement.children.length > MAX_LIST_ITEMS) {
            attackListElement.removeChild(attackListElement.lastChild);
        }
    }

    function drawAttackOnMap(attackData) {
        if (!attackData) return;
        
        const sourceLatLng = L.latLng(attackData.sourceCoords.lat, attackData.sourceCoords.lng);
        const targetLatLng = L.latLng(attackData.targetCoords.lat, attackData.targetCoords.lng);
        const lineColor = getAttackColor(attackData.severity, attackData.isBlocked);

        const polyline = L.polyline([sourceLatLng, targetLatLng], {
            color: lineColor,
            weight: attackData.isBlocked ? 1.5 : 2.5,
            opacity: attackData.isBlocked ? 0.4 : 0.7,
            dashArray: attackData.isBlocked ? '5, 10' : null
        }).addTo(map);

        const sourceMarker = L.circleMarker(sourceLatLng, {
            radius: 4,
            fillColor: lineColor,
            color: "#fff",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.7
        }).addTo(map);

        if (!attackData.isBlocked) {
            const targetPulse = L.circleMarker(targetLatLng, {
                radius: 8,
                fillColor: lineColor,
                color: lineColor,
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.5
            }).addTo(map);

            let pulseRadius = 8;
            let pulseOpacity = 0.5;
            const pulseInterval = setInterval(() => {
                pulseRadius += 3;
                pulseOpacity -= 0.04;
                if (pulseOpacity <= 0) {
                    map.removeLayer(targetPulse);
                    clearInterval(pulseInterval);
                } else {
                    targetPulse.setRadius(pulseRadius);
                    targetPulse.setStyle({fillOpacity: pulseOpacity, opacity: pulseOpacity});
                }
            }, 50);
        }

        const attackVisualization = {
            id: attackData.id,
            line: polyline,
            sourceMarker: sourceMarker,
            timestamp: attackData.timestamp
        };
        
        displayedMapAttacks.push(attackVisualization);
        
        if (displayedMapAttacks.length > MAX_MAP_LINES) {
            const oldestAttack = displayedMapAttacks.shift();
            map.removeLayer(oldestAttack.line);
            map.removeLayer(oldestAttack.sourceMarker);
        }
    }

    function formatTimeSince(timestamp) {
        if (!timestamp) return "Never";
        const now = new Date();
        const secondsAgo = Math.round((now - timestamp) / 1000);
        if (secondsAgo < 1) return "0s";
        if (secondsAgo < 60) return `${secondsAgo}s`;
        if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m`;
        if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h`;
        return `${Math.floor(secondsAgo / 86400)}d`;
    }

    function updateOverviewUI() {
        // Update attack type circles
        attackTypes.forEach(type => {
            const typeId = type.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const countElement = document.getElementById(`count-${typeId}`);
            const timeSinceElement = document.getElementById(`time-since-${typeId}`);

            if (countElement && attackStats[type.name]) {
                const stats = attackStats[type.name];
                const blockRate = stats.count > 0 ? Math.round((stats.blocked / stats.count) * 100) : 0;
                countElement.innerHTML = `${stats.count} <span style="font-size:0.6em;color:#00d4aa;display:block">${blockRate}%</span>`;
            }
            if (timeSinceElement && attackStats[type.name]) {
                timeSinceElement.innerText = formatTimeSince(attackStats[type.name].lastAttackTimestamp);
            }
        });

        // Update country stats
        const countryContainer = document.getElementById('country-attack-stats');
        if (countryContainer) {
            const sortedCountries = Object.entries(sourceCountryStats)
                .map(([name, stats]) => ({ name, ...stats }))
                .filter(c => c.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 8);

            // Find or create the country list container
            let countryList = countryContainer.querySelector('.country-list');
            if (!countryList) {
                countryList = document.createElement('div');
                countryList.classList.add('country-list');
                countryContainer.appendChild(countryList);
            }

            countryList.innerHTML = '';
            sortedCountries.forEach((country, index) => {
                const blockRate = country.count > 0 ? Math.round((country.blocked / country.count) * 100) : 0;
                const statDiv = document.createElement('div');
                statDiv.classList.add('country-stat-item');
                statDiv.innerHTML = `
                    <span class="country-name"><span style="color:#5a5a6a;margin-right:6px">${String(index + 1).padStart(2, '0')}</span>${country.name}</span>
                    <span class="country-count">${country.count}</span>
                `;
                countryList.appendChild(statDiv);
            });
        }

        // Update system status
        const lastAttackElement = document.getElementById('time-since-last-attack');
        if (lastAttackElement) {
            const timeSince = formatTimeSince(overallLastAttackTimestamp);
            lastAttackElement.textContent = timeSince === 'Never' ? '--:--' : timeSince + ' ago';
        }

        // Update total attacks
        const totalAttacksElement = document.getElementById('total-attacks');
        if (totalAttacksElement) {
            totalAttacksElement.textContent = totalAttacksCount.toLocaleString();
        }

        // Update block rate
        const blockRateElement = document.getElementById('block-rate');
        if (blockRateElement) {
            const rate = totalAttacksCount > 0 ? Math.round((blockedAttacksCount / totalAttacksCount) * 100) : 0;
            blockRateElement.textContent = rate + '%';
        }

        // Update threat level indicator
        const threatBar = document.querySelector('.threat-bar');
        const threatText = document.getElementById('threat-level-text');
        if (threatBar && threatText) {
            // Calculate threat level based on recent activity
            // Thresholds adjusted for MAX_MAP_LINES of 15
            const recentAttacks = displayedMapAttacks.length;
            let threatLevel, threatWidth;

            if (recentAttacks <= 5) {
                threatLevel = 'NOMINAL';
                threatWidth = '15%';
            } else if (recentAttacks <= 9) {
                threatLevel = 'ELEVATED';
                threatWidth = '35%';
            } else if (recentAttacks <= 13) {
                threatLevel = 'HIGH';
                threatWidth = '60%';
            } else {
                threatLevel = 'CRITICAL';
                threatWidth = '85%';
            }

            threatBar.style.width = threatWidth;
            threatText.textContent = threatLevel;
        }

        // Update live counter
        const activeThreatsCount = document.getElementById('active-threats-count');
        if (activeThreatsCount) {
            activeThreatsCount.textContent = displayedMapAttacks.length;
        }
    }

    // Attack frequency calculation (30% faster)
    function getAttackFrequency() {
        // Base interval 1.5-3.8 seconds
        return 1500 + Math.random() * 2300;
    }

    // Start simulation
    function startSimulation() {
        console.log("MYRKUR Active - Starting attack simulation...");
        
        function scheduleNextAttack() {
            setTimeout(() => {
                const newAttack = generateSimulatedAttack();
                if (newAttack) {
                    drawAttackOnMap(newAttack);
                    addAttackToList(newAttack);
                }
                updateOverviewUI();
                scheduleNextAttack();
            }, getAttackFrequency());
        }
        
        // Start the loop
        scheduleNextAttack();
        
        // Update UI every second
        setInterval(updateOverviewUI, 1000);
    }

    // Start the simulation
    startSimulation();

    // UI Controls
    const disclaimerModal = document.getElementById('disclaimer-modal');
    const disclaimerButton = document.getElementById('disclaimer-button');
    const acknowledgeBtn = document.getElementById('acknowledge-btn');
    const modalCloseButton = disclaimerModal ? disclaimerModal.querySelector('.modal-close-button') : null;

    if (disclaimerModal) {
        // Show on load
        setTimeout(() => {
            disclaimerModal.classList.add('visible');
        }, 500);

        // Close functions
        function closeDisclaimer() {
            disclaimerModal.classList.remove('visible');
        }

        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', closeDisclaimer);
        }

        if (modalCloseButton) {
            modalCloseButton.addEventListener('click', closeDisclaimer);
        }

        if (disclaimerButton) {
            disclaimerButton.addEventListener('click', function(e) {
                e.preventDefault();
                disclaimerModal.classList.add('visible');
            });
        }

        disclaimerModal.addEventListener('click', function(e) {
            if (e.target === disclaimerModal) {
                closeDisclaimer();
            }
        });
    }

    // Feed controls
    const pauseFeedBtn = document.getElementById('pause-feed');
    const clearFeedBtn = document.getElementById('clear-feed');

    if (pauseFeedBtn) {
        pauseFeedBtn.addEventListener('click', function() {
            feedPaused = !feedPaused;
            const btnSymbol = pauseFeedBtn.querySelector('.btn-symbol');
            if (btnSymbol) {
                btnSymbol.textContent = feedPaused ? '>' : '||';
            } else {
                pauseFeedBtn.textContent = feedPaused ? '>' : '||';
            }
            console.log('Feed', feedPaused ? 'paused' : 'resumed');
        });
    }

    if (clearFeedBtn) {
        clearFeedBtn.addEventListener('click', function() {
            const attackList = document.getElementById('attack-list');
            if (attackList) {
                attackList.innerHTML = '<li class="attack-item-placeholder">> Feed cleared. Awaiting threat data...</li>';
            }
        });
    }

    // Map controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => map.zoomIn());
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => map.zoomOut());
    }

    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => map.setView([64.9631, -19.0208], 6));
    }

    // Stats modal
    const statsToggle = document.getElementById('stats-toggle');
    const statsModal = document.getElementById('stats-modal');

    if (statsToggle && statsModal) {
        statsToggle.addEventListener('click', function() {
            statsModal.classList.toggle('visible');
        });

        const statsClose = statsModal.querySelector('.modal-close-button');
        if (statsClose) {
            statsClose.addEventListener('click', function() {
                statsModal.classList.remove('visible');
            });
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (pauseFeedBtn) pauseFeedBtn.click();
                break;
            case 'Escape':
                if (disclaimerModal && disclaimerModal.classList.contains('visible')) {
                    disclaimerModal.classList.remove('visible');
                }
                if (statsModal && statsModal.classList.contains('visible')) {
                    statsModal.classList.remove('visible');
                }
                break;
        }
    });

    console.log('MYRKUR fully initialized - All systems operational');
});
