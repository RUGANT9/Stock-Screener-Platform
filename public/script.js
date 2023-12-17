// Create the chart using Chart.js

function drawChart(stock, timeframe) {
    fetch('/chart-data?symbol=' + stock + '&timing=' + timeframe)
        .then(response => response.json())
        .then(data => {

            var prices = data.valuesss;
            var volumes = data.volumesss;
            prices.reverse();

            var clear_svg = d3.select('#chart-container').selectAll('*').remove();
            console.log(prices)

            // Chart dimensions
            const margin = { top: 70, right: 20, bottom: 30, left: 50 };
            const width = 1200 - margin.left - margin.right;
            const height = 520 - margin.top - margin.bottom;

            // Create scales
            var xScale = d3.scaleLinear().range([0, width]);
            var yScale = d3.scaleLinear().range([height, 0]);
            //var yScaleVolume = d3.scaleLinear().range([height, height - 0]); // Adjust the height of the volume bars


            // Create the line
            const line = d3.line()
                .x((d, i) => xScale(i))
                .y(d => yScale(d));


            // Create the SVG container
            const svg = d3.select('#chart-container')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // // Update chart function
            // function updateChart() {
            xScale.domain([0, prices.length + 5]);
            yScale.domain([0, d3.max(prices)]);
            //yScaleVolume.domain([0, d3.max(volumes)]);

            svg.select('.line')
                .attr('d', line(prices));

            // Update X axis
            svg.select('.x-axis')
                .call(d3.axisBottom(xScale));

            // Update Y axis
            svg.select('.y-axis')
                .call(d3.axisLeft(yScale));

            // Add volume bars
            // svg.selectAll('.volume-bar')
            //     .data(volumes)
            //     .enter()
            //     .append('rect')
            //     .attr('class', 'volume-bar')
            //     .attr('x', (d, i) => xScale(i) - 4) // Adjust the bar width and position
            //     .attr('y', d => yScaleVolume(d))
            //     .attr('width', 8) // Adjust the bar width
            //     .attr('height', d => (height - yScaleVolume(d)))
            //     .attr('fill', 'steelblue'); // Set the bar color
            // }

            // // Initial update
            // updateChart();

            // Add line path
            svg.append('path')
                .data([prices])
                .attr('class', 'line')
                .attr('d', line)
                .attr('stroke', 'red') // Set line color
                .attr('stroke-width', 2); // Set line thickness;

            // Add X axis
            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(xScale))
                .attr('stroke', 'red');

            // Add Y axis
            svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(yScale))
                .attr('stroke', 'red');
        });
}





var symboliz = document.getElementById('symbolize').getAttribute('symbol');
// var timez = document.getElementById('timize').getAttribute('frame');


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
                        backgroundColor: 'red',
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
