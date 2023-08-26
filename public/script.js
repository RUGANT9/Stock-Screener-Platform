// Create the chart using Chart.js

var symboliz = document.getElementById('symbolize').getAttribute('symbol');
var timez = document.getElementById('timize').getAttribute('frame');


Promise.all([
    fetch('/sentiment-data?symbol=' + symboliz)
        .then(response => response.json())
        .then(data => {
            var ctx = document.getElementById('barChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.sentisss,
                    datasets: [{
                        label: 'Sentiment Chart',
                        data: data.senti_arrsss,
                        backgroundColor: 'black',
                        borderColor: 'rgba(255, 0, 0, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: 'black', // Set y-axis label color
                                font: {
                                    weight: 'bold' // Set y-axis label font weight
                                }
                            }
                        },
                        x: {
                            ticks: {
                                color: 'black', // Set x-axis label color
                                font: {
                                    weight: 'bold' // Set x-axis label font weight
                                }
                            }
                        }
                    }
                }
            });
        })
])


Promise.all([
    fetch('/chart-data?symbol=' + symboliz + '&timing=' + timez)
        .then(response => response.json())
        .then(data => {
            const ctx = document.getElementById('myChart').getContext('2d');

            const chartData = {
                labels: data.datesss,
                datasets: [{
                    label: 'Price',
                    data: data.valuesss,
                    backgroundColor: 'rgba(255,0,0, 0.2)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 5
                }, {
                    type: 'bar',
                    label: 'Volume',
                    data: data.volumesss,
                    backgroundColor: 'rgba(0,0,0, 0.2)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                }]
            };

            var xx = new Chart(ctx, {
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
                    plugins: {
                        zoom: {
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'xy',
                            }
                        }
                    }
                }
            });
        })

])
