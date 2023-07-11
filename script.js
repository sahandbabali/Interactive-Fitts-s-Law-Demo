let clickmebtn = document.getElementById("clickmebtn")
let startbtn = document.getElementById("startbtn")
let resetbtn = document.getElementById("resetbtn")
let clickcountinput = document.getElementById("clickcountinput")
let pathdiv = document.getElementById("pathdiv")
let downloadbtn = document.getElementById("downloadbtn")
let targetwidthinput = document.getElementById("targetwidthinput")






let started = false
let clickdata = []
var clickCount = 0;
let maxclickCount = 10

let previousposition = 0
var previousClickTime = null;


clickcountinput.addEventListener("change", (e) => {
    // set max click count from the form
    maxclickCount = Number(clickcountinput.value)
})

startbtn.addEventListener("click", (e) => {
    started = true
    clickdata = []
    clickCount = 0;
    beep();
    // remove disabled class from click me button
    clickmebtn.classList.remove('disabled');

    previousClickTime = new Date().getTime();
})


resetbtn.addEventListener("click", (e) => {
    started = false
    clickdata = []
    clickCount = 0;

    // add disabled class to click me button
    clickmebtn.classList.add('disabled');
    clickmebtn.style.left = `0px`


})


clickmebtn.addEventListener("click", (e) => {
    if (started) {
        beep();
        // change position of click me button in horizontal axis

        // get width of the parrent div
        //  console.log(pathdiv.clientWidth)

        clickmebtn.style.left = `${getRandomNumber(Number(clickmebtn.clientWidth) / 2, pathdiv.clientWidth - Number(clickmebtn.clientWidth))}px`;

    }
})

downloadbtn.addEventListener("click", (e) => {
    // Convert data to JSON string
    let jsonString = JSON.stringify(clickdata);

    downloadObjectAsJson(jsonString, "output")

})


function handleClick(event) {
    if (started) {
        clickCount++;

        // Get the mouse position relative to the viewport
        var mouseX = event.clientX;


        //  console.log('Click ' + clickCount + ': Mouse position - X: ' + mouseX + ', Y: ' + mouseY);
        let distancetemp = Math.abs(mouseX - previousposition)
        previousposition = mouseX



        // set time difference

        var currentClickTime = new Date().getTime();

        let timeDifference = 0


        if (previousClickTime) {
            timeDifference = currentClickTime - previousClickTime;
            console.log('Time between clicks:', timeDifference + 'ms');
        }

        previousClickTime = currentClickTime;



        let id = calculateID(distancetemp, Number(targetwidthinput.value));


        // add click to clickdata
        clickdata.push({
            time: timeDifference,
            distance: distancetemp
        })
        // console.log({
        //     time: timeDifference,
        //     distance: distancetemp
        // })



        // redraw the chart
        var dataset = scatterChart.data.datasets[0];
        dataset.data.push({ x: timeDifference, y: distancetemp });
        scatterChart.update();


        // add data to table
        var table = document.getElementById('myTable');
        var tbody = table.getElementsByTagName('tbody')[0];

        var newRowHtml = `<tr>
        <th scope="row">${clickCount}</th>
        <td>${distancetemp}</td>
        <td>${timeDifference}</td>
        <td>${id}</td>

    </tr>`;
        tbody.insertAdjacentHTML('afterbegin', newRowHtml);

        if (clickCount == maxclickCount) {
            pathdiv.removeEventListener('click', handleClick);

            // set started to false
            started = false

            console.log('Finished logging mouse positions.');
            clickmebtn.classList.add('disabled');
            clickmebtn.style.left = `0px`


            // Calculate the best fit line for the points
            const { startPoint, endPoint } = calculateBestFitLine(clickdata);

            // Log the calculated start and end points
            console.log("Start Point:", startPoint);
            console.log("End Point:", endPoint);


            var dataset2 = scatterChart.data.datasets[1];
            dataset2.data.push({ x: startPoint.time, y: startPoint.distance });
            dataset2.data.push({ x: endPoint.time, y: endPoint.distance });

            scatterChart.update();
        }

    }
}

pathdiv.addEventListener('click', handleClick);



// Data for the scatter chart
var data = {
    datasets: [
        {
            label: 'Scatter Dataset',
            data: [

            ],
            backgroundColor: 'rgba(75, 192, 192, 0.6)', // Set the color of data points
            borderColor: 'rgba(75, 192, 192, 1)', // Set the color of the border
            borderWidth: 5, // Set the width of the border
        },
        {
            label: 'Line Data',
            data: [],

            type: 'line', // Set the type to 'line'
            borderColor: 'rgba(255, 99, 132, 1)', // Set the line color
            borderWidth: 5 // Set the line width
        }
    ]
};

// Configuration options for the scatter chart
var options = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
        x: {
            type: 'linear', // Use linear scale for x-axis
            position: 'bottom', // Place x-axis at the bottom
            title: {
                display: true,
                text: 'Time',
                font: {
                    size: 18 // Set the desired font size here
                }
            },

        },
        y: {
            type: 'linear', // Use linear scale for y-axis
            position: 'left', // Place y-axis on the left
            title: {
                display: true,
                text: 'Distance',
                font: {
                    size: 18 // Set the desired font size here
                }
            },
        }
    },
    plugins: {
        legend: {
            display: false // Hide the legend
        }
    }
};

// Create a new scatter chart
var ctx = document.getElementById('scatterChart').getContext('2d');

var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: options
});


function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


Chart.defaults.elements.point.radius = 10







// Function to calculate the best fit line using linear regression
function calculateBestFitLine(points) {
    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
        const { time, distance } = points[i];
        sumX += time;
        sumY += distance;
        sumXY += time * distance;
        sumXX += time * time;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Find the minimum and maximum x-values in the points array
    const minX = Math.min(...points.map((point) => point.time));
    const maxX = Math.max(...points.map((point) => point.time));

    // Calculate the start and end points of the line
    let startPoint = { time: minX, distance: slope * minX + intercept };
    let endPoint = { time: maxX, distance: slope * maxX + intercept };

    // Adjust start and end points if the y-values are negative
    if (startPoint.distance < 0) {
        startPoint.distance = 0;
        startPoint.time = (0 - intercept) / slope;
    }

    if (endPoint.distance < 0) {
        endPoint.distance = 0;
        endPoint.time = (0 - intercept) / slope;
    }

    return { startPoint, endPoint };
}


function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function beep() {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
}

// Function to calculate the Index of Difficulty (ID) based on Fitts's Law
function calculateID(distance, width) {
    const a = 0.1; // Movement amplitude constant
    const id = Math.log2(distance / width + 1) / Math.log2(2 * distance / a + 1);
    return id.toFixed(2);
}