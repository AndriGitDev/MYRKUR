document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map-container', {
        zoomControl: false  // Disable default Leaflet zoom controls
    }).setView([64.9631, -19.0208], 6);

    // CartoDB Dark Matter tiles for cyber aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    console.log('MYRKUR initialized - Monitoring cyber threats targeting Iceland...');

    // More realistic attack types with actual cyber terminology
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

    // More realistic source countries based on actual cyber threat intelligence
    const sourceCountries = [
        { name: "Russia", latitude: 61.5240, longitude: 105.3188, weight: 18, preferredAttacks: ["DDoS Attack", "Ransomware", "Supply Chain Attack"] },
        { name: "China", latitude: 35.8617, longitude: 104.1954, weight: 16, preferredAttacks: ["Zero-Day Exploit", "Supply Chain Attack", "SQL Injection"] },
        { name: "North Korea", latitude: 40.3399, longitude: 127.5101, weight: 8, preferredAttacks: ["Ransomware", "Cryptojacking", "Zero-Day Exploit"] },
        { name: "Iran", latitude: 32.4279, longitude: 53.6880, weight: 7, preferredAttacks: ["DDoS Attack", "DNS Hijacking", "Ransomware"] },
        { name: "USA", latitude: 38.9637, longitude: -95.7129, weight: 6, preferredAttacks: ["Phishing Campaign", "Credential Stuffing"] },
        { name: "India", latitude: 20.5937, longitude: 78.9629, weight: 5, preferredAttacks: ["Phishing Campaign", "SQL Injection", "XSS Attack"] },
        { name: "Brazil", latitude: -14.2350, longitude: -51.9253, weight: 5, preferredAttacks: ["Credential Stuffing", "Phishing Campaign", "Cryptojacking"] },
        { name: "Turkey", latitude: 38.9637, longitude: 35.2433, weight: 4, preferredAttacks: ["DDoS Attack", "SQL Injection", "XSS Attack"] },
        { name: "Vietnam", latitude: 14.0583, longitude: 108.2772, weight: 4, preferredAttacks: ["Cryptojacking", "Phishing Campaign", "Credential Stuffing"] },
        { name: "Romania", latitude: 45.9432, longitude: 24.9668, weight: 4, preferredAttacks: ["Ransomware", "Phishing Campaign", "Credential Stuffing"] },
        { name: "Germany", latitude: 51.1657, longitude: 10.4515, weight: 3, preferredAttacks: ["Phishing Campaign", "XSS Attack"] },
        { name: "Netherlands", latitude: 52.1326, longitude: 5.2913, weight: 3, preferredAttacks: ["DDoS Attack", "SQL Injection"] },
        { name: "United Kingdom", latitude: 55.3781, longitude: -3.4360, weight: 3, preferredAttacks: ["Phishing Campaign", "Credential Stuffing"] },
        { name: "Ukraine", latitude: 48.3794, longitude: 31.1656, weight: 3, preferredAttacks: ["DDoS Attack", "Ransomware"] },
        { name: "Poland", latitude: 51.9194, longitude: 19.1451, weight: 2, preferredAttacks: ["Phishing Campaign", "SQL Injection"] },
        { name: "Unknown (Tor)", latitude: 0, longitude: 0, weight: 9, preferredAttacks: ["Ransomware", "Zero-Day Exploit", "Cryptojacking"] }
    ];

    // Icelandic critical infrastructure targets
    const targetCities = [
        { name: "Reykjavik", latitude: 64.1466, longitude: -21.9426, weight: 45, 
          sectors: ["Government", "Financial", "Healthcare", "Energy", "Telecom", "Education"] },
        { name: "Keflavik", latitude: 64.0049, longitude: -22.5624, weight: 15, 
          sectors: ["Aviation", "Defense", "Logistics"] },
        { name: "Akureyri", latitude: 65.6835, longitude: -18.1000, weight: 10, 
          sectors: ["Healthcare", "Education", "Maritime"] },
        { name: "Hafnarfjordur", latitude: 64.0671, longitude: -21.9377, weight: 8, 
          sectors: ["Industrial", "Maritime", "Energy"] },
        { name: "Reykjanesbær", latitude: 63.9994, longitude: -22.5565, weight: 7, 
          sectors: ["Defense", "Aviation", "Energy"] },
        { name: "Kopavogur", latitude: 64.1123, longitude: -21.9123, weight: 6, 
          sectors: ["Retail", "Financial", "Healthcare"] },
        { name: "Selfoss", latitude: 63.9333, longitude: -20.9973, weight: 5, 
          sectors: ["Agriculture", "Energy", "Healthcare"] },
        { name: "Akranes", latitude: 64.3218, longitude: -22.0749, weight: 4, 
          sectors: ["Industrial", "Maritime", "Energy"] }
    ];

    // Target sectors with realistic descriptions
    const targetSectors = {
        "Government": ["Parliament Network", "Municipal Systems", "Tax Authority", "Immigration Services"],
        "Financial": ["Landsbankinn", "Arion Bank", "Islandsbanki", "Payment Systems"],
        "Healthcare": ["Landspitali Hospital", "Health Records System", "COVID-19 Database", "Pharmacy Networks"],
        "Energy": ["ON Power", "Landsvirkjun", "HS Orka", "Geothermal Plants"],
        "Telecom": ["Siminn", "Vodafone Iceland", "Nova", "Submarine Cable Landing"],
        "Education": ["University of Iceland", "Reykjavik University", "School Networks"],
        "Aviation": ["Keflavik International", "Air Traffic Control", "Icelandair Systems"],
        "Defense": ["NATO Systems", "Coast Guard Networks", "Radar Installations"],
        "Maritime": ["Port Authority", "Shipping Systems", "Fishing Fleet Networks"],
        "Industrial": ["Aluminum Smelters", "Manufacturing Systems", "Supply Chain"],
        "Retail": ["Payment Processing", "E-commerce Platforms", "POS Systems"],
        "Agriculture": ["Farm Management Systems", "Food Supply Chain", "Export Systems"],
        "Logistics": ["Cargo Tracking", "Customs Systems", "Distribution Networks"]
    };

    // Realistic attack patterns (time-based)
    const attackPatterns = {
        morning: { multiplier: 0.7, start: 6, end: 12 },    // Lower activity
        afternoon: { multiplier: 1.2, start: 12, end: 18 },  // Moderate activity
        evening: { multiplier: 1.5, start: 18, end: 24 },    // Peak activity
        night: { multiplier: 0.5, start: 0, end: 6 }         // Lowest activity
    };

    // Initialize statistics
    const attackStats = {};
    let overallLastAttackTimestamp = null;
    const sourceCountryStats = {};
    let totalAttacksCount = 0;
    let blockedAttacksCount = 0;

    const attackCountsContainer = document.getElementById('attack-type-counts');
    const overallTimeSinceLastAttackElement = document.getElementById('time-since-last-attack');
    const countryAttackStatsContainer = document.getElementById('country-attack-stats');

    // Initialize attack type stats with better structure
    attackTypes.forEach(type => {
        attackStats[type.name] = { count: 0, lastAttackTimestamp: null, blocked: 0 };
        const typeId = type.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const circleDiv = document.createElement('div');
        circleDiv.classList.add('attack-circle');
        circleDiv.setAttribute('data-attack-type', typeId);
        circleDiv.innerHTML = `
            <h5 class="circle-attack-name">${type.name}</h5>
            <p class="circle-attack-count" id="count-${typeId}">0</p>
            <p class="circle-last-attack-time">
                <span id="time-since-${typeId}">N/A</span>
            </p>
        `;
        if (attackCountsContainer) {
            attackCountsContainer.appendChild(circleDiv);
        }
    });

    sourceCountries.forEach(country => {
        sourceCountryStats[country.name] = { count: 0, blocked: 0 };
    });

    const MAX_LIST_ITEMS = 20;
    const MAX_MAP_LINES = 15;
    let displayedMapAttacks = [];

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

    // Generate realistic IP addresses
    function generateRealisticIP(country) {
        // Some realistic IP ranges for different countries (simplified)
        const ipRanges = {
            "Russia": ["91.", "92.", "94.", "95.", "178.", "185.", "194."],
            "China": ["1.", "14.", "27.", "36.", "42.", "58.", "59.", "60.", "61."],
            "USA": ["3.", "4.", "8.", "12.", "15.", "16.", "17.", "18.", "20."],
            "North Korea": ["175.45.", "210.52."],
            "Unknown (Tor)": ["192.168.", "10.", "172."]
        };
        
        const prefixes = ipRanges[country] || ["185.", "194.", "91."];
        const prefix = getRandomElement(prefixes);
        const octets = [];
        
        // Generate remaining octets
        const remainingOctets = 4 - prefix.split('.').length + 1;
        for (let i = 0; i < remainingOctets; i++) {
            octets.push(Math.floor(Math.random() * 254) + 1);
        }
        
        return prefix + octets.join('.');
    }

    // Generate realistic attack port
    function getAttackPort(attackType) {
        const portMappings = {
            "DDoS Attack": [80, 443, 53, 3389],
            "SQL Injection": [1433, 3306, 5432, 1521],
            "Credential Stuffing": [22, 23, 21, 3389, 443],
            "Phishing Campaign": [25, 587, 465, 443],
            "Ransomware": [445, 139, 3389, 22],
            "XSS Attack": [80, 443, 8080, 8443],
            "DNS Hijacking": [53],
            "Cryptojacking": [3333, 8333, 9999],
            "Zero-Day Exploit": [0, 135, 445, 3389],
            "Supply Chain Attack": [443, 22, 3389]
        };
        
        const ports = portMappings[attackType] || [443, 80];
        return getRandomElement(ports);
    }

    // Calculate attack success probability
    function calculateBlockProbability(severity, attackType) {
        // Different attack types have different block rates
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

        // Prefer certain attack types from certain countries
        let attackType;
        if (source.preferredAttacks && Math.random() < 0.7) {
            attackType = getRandomElement(source.preferredAttacks);
        } else {
            const attackTypeObj = getRandomWeightedElement(attackTypes);
            attackType = attackTypeObj.name;
        }

        let targetCity = getRandomWeightedElement(targetCities);
        if (!targetCity) targetCity = targetCities[0];

        // Select target sector based on city
        const targetSector = getRandomElement(targetCity.sectors);
        const targetSystem = getRandomElement(targetSectors[targetSector]);

        const timestamp = new Date();
        const severity = getWeightedSeverity(attackType);
        const sourceIp = generateRealisticIP(source.name);
        const targetPort = getAttackPort(attackType);
        
        // Determine if attack was blocked
        const blockProbability = calculateBlockProbability(severity, attackType);
        const isBlocked = Math.random() < blockProbability;
        
        // Update statistics
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
            isBlocked: isBlocked,
            description: `${attackType} from ${source.name} targeting ${targetSystem} (${targetSector}) in ${targetCity.name}. Port: ${targetPort}`
        };
    }

    function getAttackColor(severity, isBlocked = false) {
        if (isBlocked) {
            // Dimmer colors for blocked attacks
            switch(severity) {
                case "Low": return '#2e7d32';
                case "Medium": return '#f57c00';
                case "High": return '#e65100';
                case "Critical": return '#b71c1c';
                default: return '#616161';
            }
        }
        // Brighter colors for successful attacks
        switch(severity) {
            case "Low": return '#66bb6a';
            case "Medium": return '#ffca28';
            case "High": return '#ff9800';
            case "Critical": return '#ff5252';
            default: return '#9e9e9e';
        }
    }

    function addAttackToList(attackData) {
        if (!attackData) return;
        
        // Skip adding to visual list if feed is paused
        if (feedPaused) return;

        const attackListElement = document.getElementById('attack-list');
        if (!attackListElement) {
            console.error('Attack list element not found');
            return;
        }

        const currentPlaceholder = document.querySelector('.attack-item-placeholder');
        if (currentPlaceholder) currentPlaceholder.remove();

        const listItem = document.createElement('li');
        listItem.classList.add('attack-item');
        if (attackData.isBlocked) listItem.classList.add('blocked-attack');
        
        listItem.setAttribute('data-attack-id', attackData.id);
        const severityColor = getAttackColor(attackData.severity, attackData.isBlocked);
        const statusIcon = attackData.isBlocked ? '🛡️' : '⚠️';
        const statusText = attackData.isBlocked ? 'BLOCKED' : 'DETECTED';

        listItem.innerHTML = `
            <div class="attack-header">
                <strong>${attackData.attackType}</strong>
                <span class="attack-status ${attackData.isBlocked ? 'blocked' : 'active'}">${statusIcon} ${statusText}</span>
            </div>
            <div class="attack-details">
                <span class="severity-badge" style="background-color:${severityColor}">${attackData.severity}</span>
                <small class="attack-target">${attackData.targetSystem}</small>
            </div>
            <small class="attack-meta">
                ${attackData.sourceCountry} → ${attackData.targetCity} | ${attackData.sourceIp}:${attackData.targetPort}
            </small>
            <small class="attack-time">${attackData.timestamp.toLocaleTimeString()}</small>
        `;
        listItem.style.borderLeft = `4px solid ${severityColor}`;

        if (attackListElement) {
            attackListElement.insertBefore(listItem, attackListElement.firstChild);
            if (attackListElement.children.length > MAX_LIST_ITEMS) {
                attackListElement.removeChild(attackListElement.lastChild);
            }
        }
    }

        const listItem = document.createElement('li');
        listItem.classList.add('attack-item');
        if (attackData.isBlocked) listItem.classList.add('blocked-attack');
        
        listItem.setAttribute('data-attack-id', attackData.id);
        const severityColor = getAttackColor(attackData.severity, attackData.isBlocked);
        const statusIcon = attackData.isBlocked ? '🛡️' : '⚠️';
        const statusText = attackData.isBlocked ? 'BLOCKED' : 'DETECTED';

        listItem.innerHTML = `
            <div class="attack-header">
                <strong>${attackData.attackType}</strong>
                <span class="attack-status ${attackData.isBlocked ? 'blocked' : 'active'}">${statusIcon} ${statusText}</span>
            </div>
            <div class="attack-details">
                <span class="severity-badge" style="background-color:${severityColor}">${attackData.severity}</span>
                <small class="attack-target">${attackData.targetSystem}</small>
            </div>
            <small class="attack-meta">
                ${attackData.sourceCountry} → ${attackData.targetCity} | ${attackData.sourceIp}:${attackData.targetPort}
            </small>
            <small class="attack-time">${attackData.timestamp.toLocaleTimeString()}</small>
        `;
        listItem.style.borderLeft = `4px solid ${severityColor}`;

        if (attackListElement) {
            attackListElement.insertBefore(listItem, attackListElement.firstChild);
            if (attackListElement.children.length > MAX_LIST_ITEMS) {
                attackListElement.removeChild(attackListElement.lastChild);
            }
        }
    }

    function drawAttackOnMap(attackData) {
        if (!attackData) return;
        
        const sourceLatLng = L.latLng(attackData.sourceCoords.lat, attackData.sourceCoords.lng);
        const targetLatLng = L.latLng(attackData.targetCoords.lat, attackData.targetCoords.lng);
        const lineColor = getAttackColor(attackData.severity, attackData.isBlocked);

        // Curved path for more visual interest
        const midLat = (attackData.sourceCoords.lat + attackData.targetCoords.lat) / 2;
        const midLng = (attackData.sourceCoords.lng + attackData.targetCoords.lng) / 2;
        const offsetLat = midLat + (Math.random() - 0.5) * 10;
        const offsetLng = midLng + (Math.random() - 0.5) * 10;
        
        const curvedPath = [
            sourceLatLng,
            L.latLng(offsetLat, offsetLng),
            targetLatLng
        ];

        const polyline = L.polyline(curvedPath, {
            color: lineColor,
            weight: attackData.isBlocked ? 1.5 : 2.5,
            opacity: attackData.isBlocked ? 0.4 : 0.7,
            dashArray: attackData.isBlocked ? '5, 10' : null,
            className: 'attack-line'
        }).addTo(map);

        // Source marker
        const sourceMarker = L.circleMarker(sourceLatLng, {
            radius: 4,
            fillColor: lineColor,
            color: "#fff",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.7
        }).addTo(map);

        // Target pulse animation
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
        
        // Remove old attacks
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

        if (secondsAgo < 1) return "Now";
        if (secondsAgo < 60) return `${secondsAgo}s`;
        if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m`;
        if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h`;
        return `${Math.floor(secondsAgo / 86400)}d`;
    }
    
    // Update overview UI and stats
    function updateOverviewUI() {
        // Update attack type circles
        attackTypes.forEach(type => {
            const typeId = type.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            const countElement = document.getElementById(`count-${typeId}`);
            const timeSinceElement = document.getElementById(`time-since-${typeId}`);

            if (countElement && attackStats[type.name]) {
                const stats = attackStats[type.name];
                const blockRate = stats.count > 0 ? Math.round((stats.blocked / stats.count) * 100) : 0;
                countElement.innerHTML = `${stats.count} <span style="font-size:0.7em;color:#00aa00">(${blockRate}%⛨)</span>`;
            }
            if (timeSinceElement && attackStats[type.name]) {
                timeSinceElement.innerText = formatTimeSince(attackStats[type.name].lastAttackTimestamp);
            }
        });

        // Update country statistics
        if (countryAttackStatsContainer) {
            const sortedCountries = Object.entries(sourceCountryStats)
                .map(([name, stats]) => ({ name, ...stats }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10); // Top 10

            countryAttackStatsContainer.innerHTML = '<h4>Top Attack Sources:</h4>';
            
            sortedCountries.forEach(country => {
                const countryId = country.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                const blockRate = country.count > 0 ? Math.round((country.blocked / country.count) * 100) : 0;
                const countryStatElement = document.createElement('div');
                countryStatElement.classList.add('country-stat-item');
                countryStatElement.innerHTML = `
                    <span class="country-name">${country.name}:</span>
                    <span class="country-count">${country.count} <span style="font-size:0.8em;color:#00aa00">(${blockRate}%⛨)</span></span>
                `;
                countryAttackStatsContainer.appendChild(countryStatElement);
            });
        }

        // Update overall stats
        if (overallTimeSinceLastAttackElement) {
            const blockRate = totalAttacksCount > 0 ? Math.round((blockedAttacksCount / totalAttacksCount) * 100) : 0;
            const parent = overallTimeSinceLastAttackElement.parentElement;
            
            if (overallLastAttackTimestamp) {
                parent.innerHTML = `
                    <h4>System Status:</h4>
                    <p>Last Attack: <span id="time-since-last-attack">${formatTimeSince(overallLastAttackTimestamp)}</span></p>
                    <p>Total: ${totalAttacksCount} | Blocked: ${blockRate}%</p>
                `;
            } else {
                parent.innerHTML = `<h4>System Status:</h4><p>Monitoring...</p>`;
            }
        }

        // Update live counter
        const activeThreatsCount = document.getElementById('active-threats-count');
        if (activeThreatsCount) {
            activeThreatsCount.textContent = displayedMapAttacks.length;
        }

        // Update advanced stats modal if visible
        if (statsModal && statsModal.classList.contains('visible')) {
            updateAdvancedStats();
        }
    }

    // Update advanced statistics in modal
    function updateAdvancedStats() {
        // Update targets list
        const targetsList = document.getElementById('targets-list');
        if (targetsList) {
            const targetCounts = {};
            // This would normally track actual targets hit, simplified for demo
            targetCities.forEach(city => {
                targetCounts[city.name] = Math.floor(Math.random() * 20);
            });
            
            targetsList.innerHTML = Object.entries(targetCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([city, count]) => `
                    <div class="stat-item">
                        <span>${city}</span>
                        <span class="stat-value">${count}</span>
                    </div>
                `).join('');
        }

        // Update vectors breakdown
        const vectorsBreakdown = document.getElementById('vectors-breakdown');
        if (vectorsBreakdown) {
            const topVectors = Object.entries(attackStats)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5);
            
            vectorsBreakdown.innerHTML = topVectors.map(([type, stats]) => `
                <div class="stat-item">
                    <span>${type}</span>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${(stats.count / totalAttacksCount) * 100}%"></div>
                    </div>
                    <span class="stat-value">${stats.count}</span>
                </div>
            `).join('');
        }

        // Update geographic stats
        const geoStats = document.getElementById('geo-stats');
        if (geoStats) {
            const topCountries = Object.entries(sourceCountryStats)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5);
            
            geoStats.innerHTML = topCountries.map(([country, stats]) => {
                const percentage = totalAttacksCount > 0 ? ((stats.count / totalAttacksCount) * 100).toFixed(1) : 0;
                return `
                    <div class="stat-item">
                        <span>${country}</span>
                        <span class="stat-value">${percentage}%</span>
                    </div>
                `;
            }).join('');
        }

        // Simple timeline chart (text-based for now)
        const timelineChart = document.getElementById('timeline-chart');
        if (timelineChart && !timelineChart.dataset.initialized) {
            timelineChart.innerHTML = '<div style="color:#00ff00;padding:20px;text-align:center;">Attack frequency visualization active</div>';
            timelineChart.dataset.initialized = 'true';
        }
    }

    // Dynamic attack frequency based on time (increased by 30%)
    function getAttackFrequency() {
        const hour = new Date().getHours();
        let multiplier = 1;
        
        for (const [period, config] of Object.entries(attackPatterns)) {
            if (hour >= config.start && hour < config.end) {
                multiplier = config.multiplier;
                break;
            }
        }
        
        // Base interval 1.5-3.8 seconds (30% faster than before), modified by time of day
        const baseInterval = 1500 + Math.random() * 2300;
        return baseInterval / multiplier;
    }

    // Start simulation with variable frequency
    let attackGenerationActive = true;
    
    function startSimulation() {
        console.log("MYRKUR Active - Monitoring cyber threats...");
        
        function scheduleNextAttack() {
            if (!attackGenerationActive) return;
            
            setTimeout(() => {
                const newAttack = generateSimulatedAttack();
                if (newAttack) {
                    // Always add to map
                    drawAttackOnMap(newAttack);
                    // Only add to list if not paused
                    if (!feedPaused) {
                        addAttackToList(newAttack);
                    }
                }
                updateOverviewUI();
                scheduleNextAttack();
            }, getAttackFrequency());
        }
        
        // Generate first attack immediately
        const firstAttack = generateSimulatedAttack();
        if (firstAttack) {
            drawAttackOnMap(firstAttack);
            addAttackToList(firstAttack);
        }
        
        // Start the attack generation loop
        scheduleNextAttack();
        
        // Update UI every second
        setInterval(updateOverviewUI, 1000);
    }
    
    startSimulation();

    // Fade out old attack lines periodically
    setInterval(() => {
        const now = new Date();
        displayedMapAttacks = displayedMapAttacks.filter(attack => {
            const age = (now - attack.timestamp) / 1000; // Age in seconds
            if (age > 30) { // Remove attacks older than 30 seconds
                map.removeLayer(attack.line);
                map.removeLayer(attack.sourceMarker);
                return false;
            }
            // Fade based on age
            const opacity = Math.max(0.1, 1 - (age / 30));
            attack.line.setStyle({ opacity: opacity * 0.7 });
            return true;
        });
    }, 5000);

    // Disclaimer Modal Logic
    const disclaimerButton = document.getElementById('disclaimer-button');
    const disclaimerModal = document.getElementById('disclaimer-modal');
    const acknowledgeBtn = document.getElementById('acknowledge-btn');
    const dontShowAgain = document.getElementById('dont-show-again');
    
    if (disclaimerModal) {
        const modalCloseButton = disclaimerModal.querySelector('.modal-close-button');

        // Check if user has already acknowledged
        const hasAcknowledged = localStorage.getItem('myrkur-disclaimer-acknowledged');
        
        // Show disclaimer on page load if not previously acknowledged
        if (!hasAcknowledged) {
            setTimeout(() => {
                disclaimerModal.classList.add('visible');
            }, 500);
        }

        // Close modal function
        function closeDisclaimer() {
            if (dontShowAgain && dontShowAgain.checked) {
                localStorage.setItem('myrkur-disclaimer-acknowledged', 'true');
            }
            disclaimerModal.classList.remove('visible');
        }

        // I Understand button
        if (acknowledgeBtn) {
            acknowledgeBtn.addEventListener('click', closeDisclaimer);
        }

        // Disclaimer button in header
        if (disclaimerButton) {
            disclaimerButton.addEventListener('click', function(event) {
                event.preventDefault();
                disclaimerModal.classList.add('visible');
            });
        }

        // X close button
        if (modalCloseButton) {
            modalCloseButton.addEventListener('click', closeDisclaimer);
        }

        // Click outside to close
        disclaimerModal.addEventListener('click', function(event) {
            if (event.target === disclaimerModal) {
                closeDisclaimer();
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && disclaimerModal.classList.contains('visible')) {
                closeDisclaimer();
            }
        });
    }

    // Additional UI Controls
    const statsToggle = document.getElementById('stats-toggle');
    const statsModal = document.getElementById('stats-modal');
    const pauseFeedBtn = document.getElementById('pause-feed');
    const clearFeedBtn = document.getElementById('clear-feed');
    const severityFilter = document.getElementById('severity-filter');
    const statusFilter = document.getElementById('status-filter');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');
    
    let feedPaused = false;

    // Stats modal toggle
    if (statsToggle && statsModal) {
        statsToggle.addEventListener('click', function() {
            statsModal.classList.toggle('visible');
        });
        
        const statsCloseBtn = statsModal.querySelector('.modal-close-button');
        if (statsCloseBtn) {
            statsCloseBtn.addEventListener('click', function() {
                statsModal.classList.remove('visible');
            });
        }
    }

    // Feed controls
    if (pauseFeedBtn) {
        pauseFeedBtn.addEventListener('click', function() {
            feedPaused = !feedPaused;
            pauseFeedBtn.textContent = feedPaused ? '▶' : '⏸';
            pauseFeedBtn.setAttribute('aria-label', feedPaused ? 'Resume Feed' : 'Pause Feed');
            console.log('Feed', feedPaused ? 'paused' : 'resumed');
        });
    }

    if (clearFeedBtn) {
        clearFeedBtn.addEventListener('click', function() {
            const attackList = document.getElementById('attack-list');
            if (attackList) {
                attackList.innerHTML = '<li class="attack-item-placeholder">Feed cleared. Waiting for new data...</li>';
            }
        });
    }

    // Filter controls
    if (severityFilter) {
        severityFilter.addEventListener('change', function() {
            filterAttacks();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterAttacks();
        });
    }

    function filterAttacks() {
        const severityValue = severityFilter ? severityFilter.value : 'all';
        const statusValue = statusFilter ? statusFilter.value : 'all';
        const attackItems = document.querySelectorAll('.attack-item');
        
        attackItems.forEach(item => {
            let showItem = true;
            
            // Check severity filter
            if (severityValue !== 'all') {
                const itemSeverity = item.querySelector('.severity-badge')?.textContent.toLowerCase();
                if (severityValue === 'critical' && itemSeverity !== 'critical') showItem = false;
                else if (severityValue === 'high' && !['critical', 'high'].includes(itemSeverity)) showItem = false;
                else if (severityValue === 'medium' && itemSeverity === 'low') showItem = false;
            }
            
            // Check status filter
            if (statusValue !== 'all') {
                const isBlocked = item.classList.contains('blocked-attack');
                if (statusValue === 'active' && isBlocked) showItem = false;
                else if (statusValue === 'blocked' && !isBlocked) showItem = false;
            }
            
            item.style.display = showItem ? 'block' : 'none';
        });
    }

    // Map controls
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            map.zoomIn();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            map.zoomOut();
        });
    }

    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', function() {
            map.setView([64.9631, -19.0208], 6);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Don't trigger shortcuts when typing in inputs
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
        
        switch(event.key) {
            case ' ':
                event.preventDefault();
                if (pauseFeedBtn) pauseFeedBtn.click();
                break;
            case 'c':
            case 'C':
                if (clearFeedBtn) clearFeedBtn.click();
                break;
            case 's':
            case 'S':
                if (statsToggle) statsToggle.click();
                break;
            case 'r':
            case 'R':
                if (resetViewBtn) resetViewBtn.click();
                break;
            case '+':
            case '=':
                if (zoomInBtn) zoomInBtn.click();
                break;
            case '-':
            case '_':
                if (zoomOutBtn) zoomOutBtn.click();
                break;
            case '?':
                const helpTooltip = document.getElementById('keyboard-help');
                if (helpTooltip) {
                    helpTooltip.style.display = helpTooltip.style.display === 'block' ? 'none' : 'block';
                }
                break;
        }
    });

}); // End of DOMContentLoaded
