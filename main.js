if (!window.scriptLoaded) {
    window.scriptLoaded = true;

    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOMContentLoaded fired");
        // Function to save user inputted data to chrome.storage
        const updateData = () => {
            // Obtain all course containers, which contain the inputs
            const courseContainers = document.querySelectorAll('.course-container');
            // Create a new array by mapping every course container
            const saveCoursesData = Array.from(courseContainers).map((container) => {
                // Obtain the input elements from each course container
                const gradeInput = container.querySelector('.grade-input');
                const creditInput = container.querySelector('.credit-input');
                const checkboxInput = container.querySelector('.checkbox-input');
                // Return an object with the container ID and the corresponding
                // user inputs to be saved in the new array
                return {
                    containerId: container.id,
                    gradeValue: gradeInput.value || 0,
                    creditValue: creditInput.value || 0,
                    checkboxValue: checkboxInput.checked,
                };
            });
            // Saves the array of objects mapped before under this key
            chrome.storage.sync.set({ "saveCoursesData": saveCoursesData });
        };
    
        // Function which recieves data and restores it into the extension
        const fetchDataAndPopulateElements = () => {
            // Extract saved data saved under the key from before
            chrome.storage.sync.get(['saveCoursesData'], (result) => {
                // Retrieve the saved array of courses data and assign it to a variable
                const courseData = result.saveCoursesData;
                if (!courseData) {
                    return;
                }
                courseData.forEach((courseData) => {
                    // Reconstruct each course container and its children elements by iterating through
                    // the array
                    // Obtain ID values of the course container
                    const courseId = courseData.containerId;
                    const yearNumber = courseId.split('-')[1];
                    const termNumber = courseId.split('-')[3];
                    const courseNumber = courseId.split('-')[5];
                    // Use ID values to find the course location
                    const courseLocation = document.getElementById(`y-${yearNumber}-t-${termNumber}-courses-container`);
                    showInstructions(yearNumber, termNumber);
    
                    // Create the elements and fill in their value based on the saved data
                    const newContainer = document.createElement('div');
                    setAttributes(newContainer, 'div', yearNumber, termNumber, courseNumber);
    
                    const gradeInput = document.createElement('input');
                    setAttributes(gradeInput, 'grade', yearNumber, termNumber, courseNumber);
                    gradeInput.value = courseData.gradeValue;
    
                    const creditInput = document.createElement('input');
                    setAttributes(creditInput, 'credit', yearNumber, termNumber, courseNumber);
                    creditInput.value = courseData.creditValue;
    
                    const checkboxInput = document.createElement('input');
                    setAttributes(checkboxInput, 'checkbox', yearNumber, termNumber, courseNumber);
                    checkboxInput.checked = courseData.checkboxValue;
    
                    const removeButton = document.createElement('div');
                    setAttributes(removeButton, 'remove', yearNumber, termNumber, courseNumber);
    
                    // Append all the created elements
                    newContainer.append(gradeInput, creditInput, checkboxInput, removeButton);
                    checkGradeInput(gradeInput);
                    checkCreditInput(creditInput);
                    courseLocation.append(newContainer);
    
                    // Calculate and display GPAs from saved data
                    // Calculate cumulative GPA
                    calcCumuGPA();
    
                    // Iterate through each year and find each of their GPAs
                    const yearContainers = document.querySelectorAll('.year-content')
                    yearContainers.forEach((container) => {
                        const yearNumber = container.id.split('-')[2]
                        calcYearGPA(yearNumber);
                    })
    
                    // Iterate through each term and find each of their GPAs
                    const termContainers = document.querySelectorAll('.term-container')
                    termContainers.forEach((container) => {
                        const yearNumber = container.id.split('-')[1];
                        const termNumber = container.id.split('-')[3];
                        calcTermGPA(yearNumber, termNumber);
                    });
                });
            });
        };
        // Run the function to restore data
        fetchDataAndPopulateElements();
    
        // Two following functions for input validation
        // Function for user grade input validation
        const checkGradeInput = (element) => {
            // Obtain the user inputted value and parent of input element
            const value = element.value;
            const parent = element.parentNode;
            // Define regular expressions
            const letterGradePattern = /^[A-DFa-df]$/;
            const numberPattern = /^(100|[1-9]?[0-9])$/;
    
            if (letterGradePattern.test(value) || numberPattern.test(value)) {
                // If the values are valid, remove invalid classes
                element.classList.remove('invalid');
                parent.classList.remove('grade-invalid');
            } else {
                // If the values are invalid, add invalid classes
                element.classList.add('invalid');
                parent.classList.add('grade-invalid');
            };
        };
        // Function for user credit input validation
        const checkCreditInput = (element) => {
            // Obtain the user inputted value and parent of input element
            const value = element.value;
            const parent = element.parentNode;
            // Define regular expression
            const numberPattern = /^(0(\.0+)?|0\.5|1(\.0+)?)$/;
    
            if (numberPattern.test(value)) {
                // If the values are valid, remove invalid classes
                element.classList.remove('invalid');
                parent.classList.remove('credit-invalid');
            } else {
                // If the values are invalid, add invalid classes
                element.classList.add('invalid');
                parent.classList.add('credit-invalid');
            };
        };
    
        // Function to set attributes of elements being created
        const setAttributes = (element, type, yearNumber, termNumber, courseNumber) => {
            // Set id and class attributes for course containers
            if (type === 'div') {
                element.setAttribute('id', `y-${yearNumber}-t-${termNumber}-c-${courseNumber}-course-container`)
                element.setAttribute('class', 'course-container');
            };
            // Set specific attributes for inputs
            const validTypes = ['grade', 'credit', 'checkbox', 'remove'];
            if (validTypes.includes(type)) {
                if (type === 'grade') {
                    // Grade input specific attributes
                    element.setAttribute('type', 'input');
                    element.setAttribute('placeholder', 'A-F/%')
                    element.addEventListener('input', () => {
                        // Call input validation function following any input
                        checkGradeInput(element);
                    });
                } else if (type === 'credit') {
                    // Grade input specific attributes
                    element.setAttribute('type', 'number');
                    element.setAttribute('placeholder', '0.5/1.0')
                    element.setAttribute('min', '0');
                    element.setAttribute('max', '1');
                    element.setAttribute('step', '0.5');
                    element.addEventListener('input', () => {
                        // Call input validation function following any input
                        checkCreditInput(element);
                    })
                } else if (type === 'checkbox') {
                    // Weighted input specific attributes
                    element.setAttribute('type', 'checkbox');
                } else {
                    // Remove button specific attributes
                    element.textContent = 'Remove'
                    element.addEventListener(('click'), () => {
                        // Required event listener helper functions for remove button
                        const courseNumber = element.id.split('-')[5];
                        removeCourse(yearNumber, termNumber, courseNumber);
                        adjustCourses(yearNumber, termNumber, courseNumber);
                        hideInstructions(yearNumber, termNumber);
                        calcTermGPA(yearNumber, termNumber);
                        calcYearGPA(yearNumber);
                        calcCumuGPA();
                        updateData();
                    });
                };
                // Apply general attributes for inputs
                element.setAttribute('id', `y-${yearNumber}-t-${termNumber}-c-${courseNumber}-${type}`);
                element.setAttribute('class', `${type}-input`);
                element.addEventListener('input', () => {
                    // General input event listener helper functions
                    calcTermGPA(yearNumber, termNumber);
                    calcYearGPA(yearNumber);
                    calcCumuGPA();
                    updateData();
                });
            };
        };
    
        // Obtain add course buttons
        const addCourseButtons = document.querySelectorAll('.add-course')
        // Add click event listener to every addCourse button
        addCourseButtons.forEach((button) => {
    
            button.addEventListener('click', () => {
                // Obtain ID values of the button
                const yearNumber = button.id.split('-')[1];
                const termNumber = button.id.split('-')[3];
                // Use ID values to add course in the correct location
                console.log("listener add");
                addCourse(yearNumber, termNumber);
                // Show instruction labels in the correct location
                showInstructions(yearNumber, termNumber);
            });
        });
    
        // Function for adding courses
        const addCourse = (yearNumber, termNumber) => {
            // Use ID values to find location of where to add courses
            const container = document.getElementById(`y-${yearNumber}-t-${termNumber}-courses-container`);
            // Obtain the current number of courses
            const courseNumber = container.querySelectorAll('.course-container').length + 1;
            if (courseNumber > 5) {
                // If there will be more than 5 courses, exit function to prevent adding course
                return;
            };
            console.log('hi')
            // Use the ID values to create new elements
            const newContainer = document.createElement('div');
            setAttributes(newContainer, 'div', yearNumber, termNumber, courseNumber);
    
            const gradeInput = document.createElement('input');
            setAttributes(gradeInput, 'grade', yearNumber, termNumber, courseNumber);
    
            const creditInput = document.createElement('input');
            setAttributes(creditInput, 'credit', yearNumber, termNumber, courseNumber);
    
            const checkboxInput = document.createElement('input');
            setAttributes(checkboxInput, 'checkbox', yearNumber, termNumber, courseNumber);
    
            const removeButton = document.createElement('div');
            setAttributes(removeButton, 'remove', yearNumber, termNumber, courseNumber);
    
            // Append new elements to the new course container
            newContainer.append(gradeInput, creditInput, checkboxInput, removeButton);
            // Append new courseContainer to the coursesContainer
            container.append(newContainer);
        };
    
        // Function to show instruction labels above courses
        const showInstructions = (yearNumber, termNumber) => {
            // Get instructions element based on ID values
            const instructions = document.getElementById(`y-${yearNumber}-t-${termNumber}-instructions`);
            if (!instructions.classList.contains('active')) {
                // If the instructions are not shown, then show them
                instructions.classList.add('active');
            };
        };
        // Function to hide instruction labels
        const hideInstructions = (yearNumber, termNumber) => {
            // Get instructions element based on ID values
            const instructions = document.getElementById(`y-${yearNumber}-t-${termNumber}-instructions`);
            // Obtain the number of courses 
            const coursesContainer = document.getElementById(`y-${yearNumber}-t-${termNumber}-courses-container`);
            const courseCount = coursesContainer.querySelectorAll('.course-container').length;
            if (courseCount === 0) {
                // If there are no courses, hide instructions
                instructions.classList.remove('active');
            };
        };
    
        // Function to remove course
        const removeCourse = (yearNumber, termNumber, courseNumber) => {
            // Use ID values to find the course container
            const targetContainer = document.getElementById(`y-${yearNumber}-t-${termNumber}-c-${courseNumber}-course-container`);
            // Delete the course container
            targetContainer.parentNode.removeChild(targetContainer);
        };
    
        // Function to adjust courses after a course is removed
        const adjustCourses = (yearNumber, termNumber, courseNumber) => {
            // Use ID values to find the courses container
            const coursesContainer = document.getElementById(`y-${yearNumber}-t-${termNumber}-courses-container`);
            // Obtain the courses in the courses container
            const courses = coursesContainer.querySelectorAll('.course-container');
            courses.forEach((course) => {
                // Obtain the elements in each course container
                const gradeInput = course.querySelector('.grade-input');
                const creditInput = course.querySelector('.credit-input');
                const checkboxInput = course.querySelector('.checkbox-input');
                const removeButton = course.querySelector('.remove-input');
                // Obtain the ID value of the course container
                const targetCourseNumber = course.id.split('-')[5];
                if (targetCourseNumber > courseNumber) {
                    // If the ID value is greater than the ID value of the removed course, then reduce every ID value by 1
                    course.setAttribute('id', `y-${yearNumber}-t-${termNumber}-c-${targetCourseNumber - 1}-course-container`);
                    gradeInput.setAttribute('id', `y-${yearNumber}-t-${termNumber}-c-${targetCourseNumber - 1}-grade`);
                    creditInput.setAttribute('id', `y-${yearNumber}-t-${termNumber}-c-${targetCourseNumber - 1}-credit`);
                    checkboxInput.setAttribute('id', `y-${yearNumber}-t-${termNumber}-c-${targetCourseNumber - 1}-checkbox`);
                    removeButton.setAttribute('id', `y-${yearNumber}-t-${termNumber}-c-${targetCourseNumber - 1}-remove`);
                };
            });
        };
    
        // Function for calculating term GPAs
        const calcTermGPA = (yearNumber, termNumber) => {
            // Use ID values to obtain GPA displays (for calculator and table)
            const wDisplay = document.getElementById(`b-y-${yearNumber}-t-${termNumber}-w-GPA`);
            const uwDisplay = document.getElementById(`b-y-${yearNumber}-t-${termNumber}-uw-GPA`);
            const wIDisplay = document.getElementById(`i-y-${yearNumber}-t-${termNumber}-w-GPA-display`)
            const uwIDisplay = document.getElementById(`i-y-${yearNumber}-t-${termNumber}-uw-GPA-display`)
            // Use ID values to obtain corresponding courses container for the term
            const inputContainer = document.getElementById(`y-${yearNumber}-t-${termNumber}-courses-container`);
            const gradeInputs = inputContainer.querySelectorAll('.grade-input');
            const creditInputs = inputContainer.querySelectorAll('.credit-input');
            const checkboxInputs = inputContainer.querySelectorAll('.checkbox-input');
            // Pass obtained inputs and displays to calcGPA function
            calcGPA(gradeInputs, creditInputs, checkboxInputs, wDisplay, uwDisplay, wIDisplay, uwIDisplay)
        };
        // Function for calculating year GPAs
        const calcYearGPA = (yearNumber) => {
            // Use ID values to obtain GPA displays (for calculator and table)
            const wDisplay = document.getElementById(`b-y-${yearNumber}-w-GPA`);
            const uwDisplay = document.getElementById(`b-y-${yearNumber}-uw-GPA`);
            const wIDisplay = document.getElementById(`i-y-${yearNumber}-w-GPA-display`)
            const uwIDisplay = document.getElementById(`i-y-${yearNumber}-uw-GPA-display`)
            // Use ID values to obtain corresponding term containers for the year
            const inputContainer = document.getElementById(`y-${yearNumber}-terms-container`);
            const gradeInputs = inputContainer.querySelectorAll('.grade-input');
            const creditInputs = inputContainer.querySelectorAll('.credit-input');
            const checkboxInputs = inputContainer.querySelectorAll('.checkbox-input');
            // Pass obtained inputs and displays to calcGPA function
            calcGPA(gradeInputs, creditInputs, checkboxInputs, wDisplay, uwDisplay, wIDisplay, uwIDisplay)
        };
        // Function for calculating cumulative high school GPAs
        const calcCumuGPA = () => {
            // Use ID values to obtain the GPA displays
            const wDisplay = document.getElementById('b-hs-w-GPA');
            const uwDisplay = document.getElementById('b-hs-uw-GPA');
            // Obtain each input
            const gradeInputs = document.querySelectorAll('.grade-input');
            const creditInputs = document.querySelectorAll('.credit-input');
            const checkboxInputs = document.querySelectorAll('.checkbox-input');
            // Pass obtained inputs and displays to calcGPA function
            calcGPA(gradeInputs, creditInputs, checkboxInputs, wDisplay, uwDisplay)
        }
    
        // Calculates and displays GPA
        const calcGPA = (gradeInputs, creditInputs, checkboxInputs, wDisplay, uwDisplay, wIDisplay, uwIDisplay) => {
            // Create empty arrays for grade, credit, and weighted values
            const gradeValuesArray = [];
            const creditValuesArray = [];
            const checkboxValuesArray = [];
            // Iterate through each element in the grade inputs array
            // Also goes through each credit, weighted input to save values to corresponding locations
            for (let i = 0; i < gradeInputs.length; i++) {
                // Obtain the user grade input, save to grade values array
                const gradeValue = (gradeInputs[i].value) || 0;
                gradeValuesArray[i] = gradeValue;
                // Obtain the user credit input, save to credit values array
                const creditValue = parseFloat(creditInputs[i].value) || 0;
                creditValuesArray[i] = creditValue;
                // Obtain the user weighted input, save to weighted values array
                const checkboxValue = checkboxInputs[i].checked;
                checkboxValuesArray[i] = checkboxValue;
            };
    
            // Create empty quality points arrays
            const wQualityPointsArray = [];
            const uwQualityPointsArray = [];
            // Iterate through each value saved in grade values array
            // Also goes through each value in the other arrays, staying at the same index
            for (let i = 0; i < gradeValuesArray.length; i++) {
                // Obtain corresponding input values
                const gradeValue = gradeValuesArray[i];
                const creditValue = creditValuesArray[i];
                const checkboxStatus = checkboxValuesArray[i];
    
                // Calculate weighted quality points
                let wQualityPoints = 0;
                if (checkboxStatus === true) {
                    // If weighted, use weighted conversion
                    wQualityPoints = wConversion(gradeValue) * creditValue;
                } else {
                    // If unweighted, use unweighted conversion
                    wQualityPoints = uwConversion(gradeValue) * creditValue;
                };
                // Save calculated value to weighted quality points array
                wQualityPointsArray[i] = wQualityPoints;
                // Calculate unweighted quality points
                const uwQualityPoints = uwConversion(gradeValue) * creditValue;
                // Save calculated value to unweighted quality points array
                uwQualityPointsArray[i] = uwQualityPoints;
            };
    
            // Iterate through the quality points and credits array to find the sum of each
            const sumWQualityPoints = wQualityPointsArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const sumUwQualityPoints = uwQualityPointsArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const sumCredits = creditValuesArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            // Calculate GPAs, round to the nearest thousandth
            let wGPA = parseFloat((sumWQualityPoints / sumCredits).toFixed(3)) || 0;
            let uwGPA = parseFloat((sumUwQualityPoints / sumCredits).toFixed(3)) || 0;
    
            // Display the calculated GPAs on the calculator
            wDisplay.textContent = wGPA;
            uwDisplay.textContent = uwGPA;
            // Display the calculated GPAs on the table
            if (wIDisplay) {
                // Only display the year and term GPAs on the table
                wIDisplay.textContent = wGPA;
                uwIDisplay.textContent = uwGPA;
                if (wGPA.toString().length > 3) {
                    wIDisplay.textContent = wGPA.toFixed(2);
                };
                if (uwGPA.toString().length > 3) {
                    uwIDisplay.textContent = uwGPA.toFixed(2);
                };
            }
        };
        // Weighted conversion scale
        const wConversion = (grade) => {
            return (
                (100 >= grade && grade >= 90) || String(grade).toUpperCase() === 'A' ? 5 :
                    (90 > grade && grade >= 80) || String(grade).toUpperCase() === 'B' ? 3.75 :
                        (80 > grade && grade >= 70) || String(grade).toUpperCase() === 'C' ? 2.50 :
                            (70 > grade && grade >= 60) || String(grade).toUpperCase() === 'D' ? 1.25 :
                                (60 > grade && grade >= 0) || String(grade).toUpperCase() === 'F' ? 0 : 0
            );
        };
        // Unweighted conversion scale
        const uwConversion = (grade) => {
            return (
                (100 >= grade && grade >= 90) || String(grade).toUpperCase() === 'A' ? 4 :
                    (90 > grade && grade >= 80) || String(grade).toUpperCase() === 'B' ? 3 :
                        (80 > grade && grade >= 70) || String(grade).toUpperCase() === 'C' ? 2 :
                            (70 > grade && grade >= 60) || String(grade).toUpperCase() === 'D' ? 1 :
                                (60 > grade && grade >= 0) || String(grade).toUpperCase() === 'F' ? 0 : 0
            );
        };
    });
}
