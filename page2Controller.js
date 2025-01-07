document.addEventListener('DOMContentLoaded', function () {
    let GPAChart;
    // Obtain page switch
    const pageSwitch = document.getElementById('page-2-switch');
    // Add click event listener to construct the chart
    pageSwitch.addEventListener('click', () => {
        // Create empty term GPA arrays
        const termWGPAArray = [];
        const termUwGPAArray = [];
        // Label the x-axis
        const axisLabels = ['Y1T1', 'Y1T2', 'Y1T3', 'T1T4', 'Y2T1', 'Y2T2', 'Y2T3', 'Y2T4', 'Y3T1', 'Y3T2', 'Y3T3', 'Y3T4', 'Y4T1', 'Y4T2', 'Y4T3', 'Y4T4'];
        // Obtain all term GPA displays from the calculator
        const termGPADisplays = document.querySelectorAll('.t-GPA-display');
        termGPADisplays.forEach(display => {
            // Obtain weighted status for each display
            const status = display.id.split('-')[4];
            // Obtain the container for the GPA value
            const GPAContainer = display.querySelector('b');
            // Checks if status is weighted/unweighted
            if (status === 'w') {
                // Push weighted GPA from display to array
                const wGPA = parseFloat(GPAContainer.textContent) || null;
                termWGPAArray.push(wGPA);
            } else {
                // Push unweighted GPA from display to array
                const uwGPA = parseFloat(GPAContainer.textContent) || null;
                termUwGPAArray.push(uwGPA);
            };
        });

        // Create year GPA arrays, 16 null values
        const yearWGPAArray = Array.from({ length: 16 }, () => null);
        const yearUwGPAArray = Array.from({ length: 16 }, () => null);
        // Obtain year GPA displays
        const yearGPADisplays = document.querySelectorAll('.y-GPA-display');
        yearGPADisplays.forEach(display => {
            // Obtain weighted status for each display
            const status = display.id.split('-')[2];
            // Obtain the ID value of the display
            const yearNumber = display.id.split('-')[1];
            // Obtain the container for the GPA value
            const GPAContainer = display.querySelector('b');
            // Checks if status is weighted/unweighted
            if (status === 'w') {
                // Obtain the weighted GPA value
                wGPA = parseFloat(GPAContainer.textContent) || null;
                // Insert value into correct index in array
                yearWGPAArray[yearNumber * 4 - 1] = wGPA;
            } else {
                // Obtain the unweighted GPA value
                uwGPA = parseFloat(GPAContainer.textContent) || null;
                // Insert value into correct index in array
                yearUwGPAArray[yearNumber * 4 - 1] = uwGPA;
            }
        });
        // If there already is a chart, destroy it to create a new one
        if (GPAChart) {
            GPAChart.destroy();
        };

        const ctx = document.getElementById('myChart').getContext('2d');

        GPAChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: axisLabels,
                datasets: [
                    {
                        label: 'Weighted GPA Progression',
                        data: termWGPAArray,
                        borderWidth: 1,
                        spanGaps: true,
                        borderColor: 'rgb(255, 190, 0, 0.8)',
                        backgroundColor: 'rgb(255, 190, 0, 0.8)'
                    },
                    {
                        label: 'Unweighted GPA Progression',
                        data: termUwGPAArray,
                        borderWidth: 1,
                        spanGaps: true,
                        borderColor: 'rgb(255, 225, 0, 0.8)',
                        backgroundColor: 'rgb(255, 225, 0, 0.8)'
                    },
                    {
                        label: 'Grade Level Weighted GPA Progression',
                        data: yearWGPAArray,
                        borderWidth: 1,
                        spanGaps: true,
                        borderColor: 'rgb(10, 46, 127, 0.5)',
                        backgroundColor: 'rgb(10, 46, 127, 0.5)'
                    },
                    {
                        label: 'Grade Level Unweighted GPA Progression',
                        data: yearUwGPAArray,
                        borderWidth: 1,
                        spanGaps: true,
                        borderColor: 'rgb(29, 82, 188, 0.5)',
                        backgroundColor: 'rgb(29, 82, 188, 0.5)'
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 5
                    }
                }
            }
        });
    });
});