document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map and set its view to Iceland's coordinates
    // Iceland coordinates: Approx 64.9631° N, 19.0208° W
    // A zoom level of 5-6 should be reasonable to see Iceland and some surrounding area.
    const map = L.map('map-container').setView([64.9631, -19.0208], 5);

    // Add a tile layer to the map (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // You can add a marker for Iceland's center for testing (optional)
    // L.marker([64.9631, -19.0208]).addTo(map)
    //     .bindPopup('Iceland')
    //     .openPopup();

    console.log('Map initialized.');
});