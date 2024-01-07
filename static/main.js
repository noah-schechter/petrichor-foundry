// Initialize global variables
window.fan = 1;
window.power = 1;

// These variables represent the last time fan and power were changed. 
// They are only meaningful once the roast clock starts; if fan and power have never been changed, they are equivalent to roast time 
window.last_fan_change = new Date('Sun Jan 01 2023 00:00:00 GMT-0800 (Pacific Standard Time)');
window.last_power_change = new Date('Sun Jan 01 2023 00:00:00 GMT-0800 (Pacific Standard Time)');

// Connect web socket 
const socket = io.connect('http://localhost:5000');

// Init chart with the right font
const ctx = document.getElementById('dataChart').getContext('2d');
Chart.defaults.font.family = "JETBRAINS";
createChart(ctx);




// Initialize the main chart 
function createChart(ctx) {
    window.dataChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                new Date('Sun Jan 01 2023 00:00:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:01:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:02:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:03:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:04:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:05:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:06:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:07:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:08:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:09:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:10:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:11:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:12:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:13:00 GMT-0800 (Pacific Standard Time)'),
                new Date('Sun Jan 01 2023 00:14:00 GMT-0800 (Pacific Standard Time)'),
            ],
            datasets: [{
                label: 'BEAN TEMPERATURE',
                data: [],
                borderColor: 'rgb(255, 79, 0)', // Color of rectangel border at top of page,
                backgroundColor: 'rgb(255, 79, 0)',
                borderWidth: 0, // Border of rectangle at top of page 
                pointBackgroundColor: 'rgb(255, 79, 0)', // Color of point 
                pointRadius: 0.2, // Radius of point 
                borderWidth: 2, // Width of line 
                fill: false,
                yAxisID: 'yaxis1'
            },
            {
                label: 'POWER',
                data: [{ x: "garble", y: 1 }],
                borderColor: 'rgb(255,8,8)', // Color of rectangel border at top of page
                backgroundColor: 'rgb(255,8,8)',
                borderWidth: 3, // Border of rectangle at top of page 
                pointBackgroundColor: 'rgb(255,8,8)', // Color of point 
                pointRadius: 0.2, // Radius of point 
                borderWidth: 2, // Width of line 
                fill: false,
                yAxisID: 'yaxis2'
            },
            {
                label: 'FAN',
                data: [{ x: "garble", y: 1 }],
                borderColor: 'rgb(45,0,245)', // Color of rectangel border at top of page
                backgroundColor: 'rgb(45,0,245)',
                borderWidth: 3, // Border of rectangle at top of page 
                pointBackgroundColor: 'rgb(45,0,245)', // Color of point 
                pointRadius: 0.2, // Radius of point 
                borderWidth: 2, // Width of line 
                fill: false,
                yAxisID: 'yaxis2'
            }],
        },
        options: {
            animation: {
                duration: 500,
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'mm:ss'
                        }
                    },
                    ticks: {
                        source: "labels",
                        color: 'rgb(255, 255, 255)'
                    },
                    grid: {
                        color: 'rgb(255, 255, 255)',
                    },
                    position: 'bottom',
                    min: new Date('Sun Jan 01 2023 00:00:00 GMT-0800 (Pacific Standard Time)'),
                    max: new Date('Sun Jan 01 2023 00:14:00 GMT-0800 (Pacific Standard Time)'),
                    title: {
                        display: true,
                        text: "TIME SINCE START OF ROAST"
                    }
                },
                yaxis1: {
                    type: 'linear',
                    position: 'left',
                    min: 150,
                    max: 450,
                    grid: {
                        color: 'rgb(255, 255, 255)', // Set grid lines color to black
                    },
                    ticks: {
                        color: 'rgb(255, 255, 255)'
                    },
                    title: {
                        display: true,
                        text: "TEMPERATURE (DEGREES FARENHEIT)"
                    }
                },
                yaxis2:
                {
                    id: 'y-axis-2',
                    type: 'linear',
                    position: 'right',
                    min: 0,
                    max: 10,
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: 'rgb(255, 255, 255)',
                    },
                    title: {
                        display: true,
                        text: "FAN/POWER SETTING"
                    }
                },
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'JETBRAINS',
                        },
                        boxWidth: 15
                    },
                },
            },
        },
    });
}

// Function to append data after the header row in the telemetry div
function appendTelemetryData(time, temp, power, fan) {
    var table = document.getElementById("telemetry");
    var row = table.insertRow(1);

    var cell1 = row.insertCell(0);
    cell1.classList.add("text-center")

    var cell2 = row.insertCell(1);
    cell2.classList.add("text-center")
    var cell3 = row.insertCell(2);
    cell3.classList.add("text-center")
    var cell4 = row.insertCell(3);
    cell4.classList.add("text-center")

    cell1.innerHTML = time;
    cell2.innerHTML = temp;
    cell3.innerHTML = power;
    cell4.innerHTML = fan;
}


function uploadFile() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    console.log(file);

    var reader = new FileReader();
    reader.onload = function (e) {
        var fileContent = e.target.result;
        var data = { 'file': { 'name': file.name, 'content': fileContent } };
        socket.emit('upload', data);
    };

    reader.readAsText(file);
}

function chooseFile() {
    // Trigger the click event of the hidden file input
    document.getElementById('fileInput').click();
}

// Whenever we recieve a temp update, add it to telemetry and if we're logging, graph new temp, fan, and power points 
socket.on('update_temp_data', (data) => {

    // Update the start_timestamp so we know the value of the most recent tick in case user clicks Start
    window.start_timestamp = data.timestamp;


    if (data.logging) {
        // Convert the timestmap into JS-acceptable format 
        data.timestamp = new Date(2023, 0, 1, 0, 0, data.timestamp);

        // Update main stopwatch 
        minutes = String(data.timestamp.getMinutes()).padStart(2, '0');
        seconds = String(data.timestamp.getSeconds()).padStart(2, '0');
        document.getElementById("stopwatch_data").innerText = `${minutes}:${seconds}`;

        // Update fan stopwatch 
        fanValue = data.timestamp - window.last_fan_change;
        secondsDifferenceFan = Math.floor(fanValue / 1000);
        minutesFan = String(Math.floor(secondsDifferenceFan / 60)).padStart(2, '0');
        secondsFan = String(secondsDifferenceFan % 60).padStart(2, '0');
        document.getElementById("fan_stopwatch_data").innerText = `${minutesFan}:${secondsFan}`;

        // Update power stopwatch
        powerValue = data.timestamp - window.last_power_change;
        secondsDifferencePower = Math.floor(powerValue / 1000);
        minutesPower = String(Math.floor(secondsDifferencePower / 60)).padStart(2, '0');
        secondsPower = String(secondsDifferencePower % 60).padStart(2, '0');
        document.getElementById("power_stopwatch_data").innerText = `${minutesPower}:${secondsPower}`;

        // Push the temp data to the chart
        window.dataChart.data.datasets[0].data.push({ x: data.timestamp, y: data.data });

        // Here we use the regular temeprature update as a sort of "tick" to graph a new point for our power and fan data
        window.dataChart.data.datasets[1].data.push({ x: data.timestamp, y: window.dataChart.data.datasets[1].data[window.dataChart.data.datasets[1].data.length - 1].y })
        window.dataChart.data.datasets[2].data.push({ x: data.timestamp, y: window.dataChart.data.datasets[2].data[window.dataChart.data.datasets[2].data.length - 1].y })
        window.dataChart.update();

        // Append well-formed date to telemetry 
        appendTelemetryData(`${minutes}:${seconds}`, data.data, window.power, window.fan)
    }

    else {
        // If we're not logging, append raw date to telemetry 
        appendTelemetryData("N/A", data.data, window.power, window.fan)
    }
});

socket.on('update_power_data', (data) => {
    if (data.logging) {
        data.timestamp = new Date(2023, 0, 1, 0, 0, data.timestamp);
        window.dataChart.data.datasets[1].data.push({ x: data.timestamp, y: data.power });
        window.last_power_change = data.timestamp
        window.dataChart.update();
    }

    else {
        window.dataChart.data.datasets[1].data.push({ x: "garble", y: data.power });
    }
});

socket.on('update_fan_data', (data) => {
    if (data.logging) {
        data.timestamp = new Date(2023, 0, 1, 0, 0, data.timestamp);
        window.dataChart.data.datasets[2].data.push({ x: data.timestamp, y: data.fan });
        window.last_fan_change = data.timestamp
        window.dataChart.update();
    }
    else {
        window.dataChart.data.datasets[2].data.push({ x: "garble", y: data.fan });
    }
});

socket.on('failure_update', (data) => {
    if (data.timestamp) {
        document.getElementById('telemetry').innerHTML = data.timestamp + ":" + "ERROR:" + data.explanation + '<br>' + document.getElementById('telemetry').innerHTML;
    }
    else {
        document.getElementById('telemetry').innerHTML = "UNKNOWN TIME" + ":" + "ERROR:" + data.explanation + '<br>' + document.getElementById('telemetry').innerHTML;
    }
});

socket.on('upload_response', function (data) {
    document.getElementById('telemetry').innerHTML = "LOGGED CSV DATA TO MONITOR" + '<br>' + document.getElementById('telemetry').innerHTML;
});

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    if (startButton.innerText == 'START') {
        socket.emit("Start timestamp", window.start_timestamp); // Send start timestamp to server
        startButton.innerText = 'STOP';
    }
    else if (startButton.innerText == 'STOP') {
        socket.emit("Stop logging", 0);
        startButton.innerText = 'RESET';
    }
    else {
        // Tell server we're resetting 
        socket.emit("Reset", 0);

        // Update buttons and indicators 
        startButton.innerText = 'START';
        document.getElementById("stopwatch_data").innerText = "00:00";
        document.getElementById("fan_stopwatch_data").innerText = "00:00";
        document.getElementById("power_stopwatch_data").innerText = "00:00";

        // Update internal vars
        window.last_fan_change = new Date('Sun Jan 01 2023 00:00:00 GMT-0800 (Pacific Standard Time)');
        window.last_power_change = new Date('Sun Jan 01 2023 00:00:00 GMT-0800 (Pacific Standard Time)');

        // Reset chart 
        window.dataChart.destroy();
        Chart.defaults.font.family = "JETBRAINS";
        const ctx = document.getElementById('dataChart').getContext('2d');
        createChart(ctx);
    }
});


const powerDisplay = document.getElementById('power-display');
const powerDecrementButton = document.getElementById('power-decrement-button');
powerDecrementButton.addEventListener('click', () => {
    if (window.power - 1 > 0) {
        window.power = window.power - 1;
        powerDisplay.innerText = window.power;
        socket.emit("Power update", window.power);
    }
});


const powerIncrementButton = document.getElementById('power-increment-button');
powerIncrementButton.addEventListener('click', () => {
    if (window.power + 1 < 10) {
        window.power = window.power + 1;
        powerDisplay.innerText = window.power;
        socket.emit("Power update", window.power);
    }
});


const fanDisplay = document.getElementById('fan-display');
const fanDecrementButton = document.getElementById('fan-decrement-button');
fanDecrementButton.addEventListener('click', () => {
    if (window.fan - 1 > 0) {
        window.fan = window.fan - 1;
        fanDisplay.innerText = window.fan;
        socket.emit("Fan update", window.fan);
    }
});

const fanIncrementButton = document.getElementById('fan-increment-button');
fanIncrementButton.addEventListener('click', () => {
    if (window.fan + 1 < 10) {
        window.fan = window.fan + 1;
        fanDisplay.innerText = window.fan;
        socket.emit("Fan update", window.fan);
    }
});


// Ensure telemetry div never grows in size
document.addEventListener('DOMContentLoaded', function () {
    // Get reference and target columns
    const referenceColumn = document.getElementById("referenceColumn");
    const targetColumn = document.getElementById('targetColumn');

    // Set the maximum height of the target column based on the height of the reference column
    targetColumn.style.maxHeight = referenceColumn.offsetHeight + 'px';
    document.getElementById('telemetrydiv').style.maxHeight = document.getElementById('telemetrydiv').offsetHeight + 'px';
});