// Create the chart using Chart.js
const symboliz = document.getElementById('symbolize').getAttribute('symbol')
const timez = document.getElementById('timize').getAttribute('frame')
const angle = document.getElementById('angler').getAttribute('angling')

Promise.all([
    fetch('/chart-data?symbol=' + symboliz + '&timing=' + timez)
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('myChart').getContext('2d');

            const chartData = {
                labels: data.datesss,
                datasets: [{
                    label: 'Price Graph',
                    data: data.valuesss,
                    backgroundColor: 'rgba(255,0,0, 0.2)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 5
                }]
            };

            new Chart(ctx, {
                type: 'line', // Change the type based on your chart preference (line, bar, etc.)
                data: chartData,
                options: {
                    scales: {
                        x: {
                            type: 'linear', // Specify the x-axis type as 'linear' for numerical values
                            position: 'bottom', // Position the x-axis at the bottom
                        },
                        y: {
                            beginAtZero: false, // Start the y-axis at zero
                        },
                    },
                },
            });
        })

])

const stickFigure = document.querySelector('.stick-figure');

// Set the rotation angle (in degrees)
const rotationAngle = angle;

stickFigure.style.transform = `translateX(-50%) rotate(${rotationAngle}deg)`;