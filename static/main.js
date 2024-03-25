// Initialize global variables
initResettableGlobals();
window.fan = 1;
window.power = 1;

function initResettableGlobals() {
    // Initialize global variables
    window.first_crack = false;
    window.second_crack = false;
    window.started = false;
    window.start_timestamp = null;
    window.most_recent_timestamp = new Date(2023, 0, 1, 0, 0, 0);;

    // These variables represent the last time fan and power were changed. 
    // They are only meaningful once the roast clock starts; if fan and power have never been changed, they are equivalent to roast time 
    window.last_fan_change = new Date(2023, 0, 1, 0, 0, 0);
    window.last_power_change = new Date(2023, 0, 1, 0, 0, 0);

    // Reset buttons TODO make buttons not clickable until roast starts
    var firstCrackButton = document.getElementById('first-crack');
    firstCrackButton.classList.remove('cursor-not-allowed');

    var secondCrackButton = document.getElementById('second-crack');
    secondCrackButton.classList.remove('cursor-not-allowed');
}

// Connect web socket 
// If running locally, change to 'http://localhost:5000'
const socket = io.connect('https://petrichor-foundry.vercel.app');

// In case the user reloaded the page, and the server is already running, make sure it starts a new CSV for this session
// (The server is entirely stateless other than this component)
socket.emit('New CSV', null);

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
function appendTelemetryData(time, temp, power, fan, first, second) {
    var table = document.getElementById("telemetry");
    var row = table.insertRow(1);

    for (let i = 0; i < 6; i++) {
        var cell = row.insertCell(i);
        cell.classList.add("text-center");
        cell.innerHTML = arguments[i];
    }
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

function updateStopwatch(elementId, lastChangeTimestamp, dataTimestamp) {
    document.getElementById(elementId).innerText = getStringTime(lastChangeTimestamp, dataTimestamp);
}

function getStringTime(lastChangeTimestamp, dataTimestamp) {
    var value = dataTimestamp - lastChangeTimestamp;
    var secondsDifference = Math.floor(value / 1000);
    var minutes = String(Math.floor(secondsDifference / 60)).padStart(2, '0');
    var seconds = String(secondsDifference % 60).padStart(2, '0');
    return `${minutes}:${seconds}`; 
}


// Whenever we recieve a temp update, update stopwatches, telemetry info, and graph. If we're logging, send all data back to server so it can be written to CSV
socket.on('update_temp_data', (data) => {

    if (window.started) {
        // If this is the first tick since start was pressed, make this tick the starting timestamp (yes, this is imprecise)
        if (window.start_timestamp == null) {
            window.start_timestamp = data.timestamp
        }

        // Convert the timestmap into JS-acceptable format 
        const processed_timestamp = new Date(2023, 0, 1, 0, 0, data.timestamp - window.start_timestamp);
        window.most_recent_timestamp = processed_timestamp;

        // Update main stopwatch 
        updateStopwatch("stopwatch_data", new Date(2023, 0, 1, 0, 0, 0), processed_timestamp);

        // Update fan stopwatch
        updateStopwatch("fan_stopwatch_data", window.last_fan_change, processed_timestamp);

        // Update power stopwatch
        updateStopwatch("power_stopwatch_data", window.last_power_change, processed_timestamp);

        // Append well-formed date to telemetry and, because we've started logging, send to server
        const string_timestamp = getStringTime(new Date(2023, 0, 1, 0, 0, 0), processed_timestamp)
        appendTelemetryData(string_timestamp, data.data, window.power, window.fan, window.first_crack, window.second_crack);
        
        // Send log data to server so it can write to a CSV
        const log_data = {"Timestamp": string_timestamp, 
                            "Temperature": data.data, 
                            "Fan": window.fan, 
                            "Power": window.power, 
                            "Raw Temp Timestamp": data.timestamp, 
                            "First Crack": window.first_crack,
                            "Second Crack": window.second_crack};
        socket.emit("log", log_data);
        
    

        // Here we use the regular temeprature update as a sort of "tick" to graph a new point for our temp, power, and fan data (we do this )
        window.dataChart.data.datasets[0].data.push({ x: processed_timestamp, y: data.data });
        console.log(window.dataChart.data.datasets[0].data);
        window.dataChart.data.datasets[1].data.push({ x: processed_timestamp, y: window.power });
        console.log(window.dataChart.data.datasets[1].data);
        window.dataChart.data.datasets[2].data.push({ x: processed_timestamp, y: window.fan });
        window.dataChart.update();
    }

    else {
        // If we're not logging, append raw date to telemetry, and, becasue we haven't started logging, don't send to server 
        appendTelemetryData("N/A", data.data, window.power, window.fan, window.first_crack, window.second_crack); 
    }
});

const endButton = document.getElementById('end');
endButton.addEventListener('click', () => {
    socket.emit('Close');
})

socket.on('upload_response', function () {
    document.getElementById('telemetry').innerHTML = "LOGGED CSV DATA TO MONITOR" + '<br>' + document.getElementById('telemetry').innerHTML;
});

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    if (startButton.innerText == 'START') {
        window.started = true;
        startButton.innerText = 'STOP';
    }
    else if (startButton.innerText == 'STOP') {
        window.started = false;
        startButton.innerText = 'RESET';
    }
    else {

        // Update buttons and indicators 
        startButton.innerText = 'START';
        document.getElementById("stopwatch_data").innerText = "00:00";
        document.getElementById("fan_stopwatch_data").innerText = "00:00";
        document.getElementById("power_stopwatch_data").innerText = "00:00";

        // Update internal vars
        initResettableGlobals(); // We don't reset power or fan bc there's no reason to do so

        // Tell server we're done logging and need a new CSV
        socket.emit('New CSV', null);

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
        window.last_power_change = window.most_recent_timestamp; // TODO: figure out how to make this more precise
        
    }
});


const powerIncrementButton = document.getElementById('power-increment-button');
powerIncrementButton.addEventListener('click', () => {
    if (window.power + 1 < 10) {
        window.power = window.power + 1;
        powerDisplay.innerText = window.power
        window.last_power_change = window.most_recent_timestamp;
    }
});

const fanDisplay = document.getElementById('fan-display');
const fanDecrementButton = document.getElementById('fan-decrement-button');
fanDecrementButton.addEventListener('click', () => {
    if (window.fan - 1 > 0) {
        window.fan = window.fan - 1;
        fanDisplay.innerText = window.fan;
        window.last_fan_change = window.most_recent_timestamp;
    }
});

const fanIncrementButton = document.getElementById('fan-increment-button');
fanIncrementButton.addEventListener('click', () => {
    if (window.fan + 1 < 10) {
        window.fan = window.fan + 1;
        fanDisplay.innerText = window.fan;
        window.last_fan_change = window.most_recent_timestamp;
    }
});

const firstCrackButton = document.getElementById('first-crack');
firstCrackButton.addEventListener('click', () => {
    window.first_crack = true;
    // TODO Graphing logic
    firstCrackButton.classList.add('cursor-not-allowed');

}); 

const secondCrackButton = document.getElementById('second-crack');
secondCrackButton.addEventListener('click', () => {
    window.second_crack = true;
    // TODO Graphing logic
    secondCrackButton.classList.add('cursor-not-allowed');

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