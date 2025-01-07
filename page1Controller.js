document.addEventListener("DOMContentLoaded", () => {
    // Obtain all page switch elements
    const pageSwitches = document.querySelectorAll('.nav-button');
    // Add click event listener to each page switch
    pageSwitches.forEach(pageSwitch => {
        pageSwitch.addEventListener('click', () => {
            // Reset styles for every page switch, add style to selected page switch
            pageSwitches.forEach((pageSwitch) => pageSwitch.classList.remove('active'));
            pageSwitch.classList.add('active');

            // Obtain the desired page number from the page switch
            const pageNumber = pageSwitch.id.split('-')[1];
            // Run switchPage function with desired pageNumber
            switchPage(pageNumber);
        });
    });

    // Function to switch pages, including show/hide year navbar, handle active year
    // and term elements, active info. page dropdowns, and chatbot height
    const switchPage = pageNumber => {
        // Obtain every page, reset the styles for each one
        const pages = document.querySelectorAll('.page-content');
        pages.forEach(page => page.classList.remove('active'));

        // Obtain desired page, add style to show it
        const selectedPage = document.getElementById(`page-${pageNumber}-content`);
        selectedPage.classList.add('active');

        // Show yearNav bar only if on page 1 by adding/removing active class
        const yearNav = document.getElementById('year-nav');
        if (pageNumber == 1) {
            yearNav.classList.add('active');
        } else {
            yearNav.classList.remove('active');
        };

        // Obtain the year which may be currently active
        const activeYear = document.querySelector('.year-content.active');
        if (activeYear) {
            const activeElements = activeYear.querySelectorAll('*');
            if (pageNumber == 1) {
                // Ensure the active year and its active terms are shown if on first page
                activeYear.classList.remove('active');
                yearNumber = activeYear.id.split('-')[2];
                switchYearContents(yearNumber);
                // Ensure the active terms are interactable
                activeElements.forEach(element => element.removeAttribute('style'));
            } else {
                // Hide any active terms to reduce extension height if not on first page
                switchYearContents(null);
                // Ensure elements shown in the active year are not interactable
                activeElements.forEach(element => element.style.pointerEvents = 'none');
            };
            adjustYearContents();
            adjustSectionContents();
        };

        // Get any active dropdowns/headers on the information page
        const activeInfoDropdown = document.querySelector('.info-dropdown-content.active');
        const activeInfoHeader = document.querySelector('.i-d-h-arrow.active');
        if (activeInfoDropdown) {
            // If there is an active dropdown, hide them to reduce extension height
            activeInfoDropdown.classList.remove('active');
            activeInfoHeader.classList.remove('active');
        };

        // Irrelevant code following AI styling change
        // Get chatbot element
        const chatbot = document.getElementById('chatbot_iframe');
        if (pageNumber == 4) {
            // Extend chatbot height if on page 4
            chatbot.style.height = '430px';
        } else {
            // Shorten chatbot height if not of page 4 to reduce extension height
            chatbot.style.height = '300px';
        };
    };

    // Function to adjust relative positioning of years to reduce extension height
    const adjustYearContents = () => {
        // Obtain year contents and default text elements
        const years = document.querySelectorAll('.year-content')
        const defaultText = document.getElementById('default-text');
        // Obtain the heights of the elements that need to be positioned
        const yearHeights = Array.from(years).map(year => year.offsetHeight);
        defaultTextHeight = defaultText.offsetHeight;

        // Adjust the positioning for every year
        years.forEach((year, i) => {
            // Set initial value to default text height
            let cumulativeHeight = defaultTextHeight;
            for (let j = 0; j < i; j++) {
                // Add the heights above the current year to cumulative height
                cumulativeHeight += yearHeights[j];
            };
            // Adjust the year positioning based on cumulative height
            year.style.top = (-1 * cumulativeHeight) + 'px';
        });

        // Ensure years container height is the same as the height of tallest year
        // This will ensure there is padding at the bottom of the extension
        const yearsContainer = document.getElementById('yearsContainer');
        const tallestYear = Math.max(...yearHeights);
        yearsContainer.style.height = tallestYear + 'px';
    };

    // Function to adjust positioning of calculator / table sections to reduce
    // extension height
    const adjustSectionContents = () => {
        // Get sections of page 1
        const regSection = document.getElementById('page-1-reg')
        const tableSection = document.getElementById('page-1-GPAs-only')
        // Adjust positioning of table section
        regSectionHeight = regSection.offsetHeight;
        tableSection.style.top = (-1 * (regSectionHeight) - 1) + 'px';
    }

    // Open page 1 and adjust positioning on extension start
    switchPage(1);
    adjustYearContents();
    adjustSectionContents();

    // Logic to toggle between GPA calculator and table
    // Obtain toggle button and the two sections
    const showGPAsToggle = document.getElementById('page-1-header-toggle')
    const page1Sections = document.querySelectorAll('.page-1-section')
    // Initialize currentSection variable; 0 represents calculator
    let currentSection = 0;
    // Add click event listener to toggle
    showGPAsToggle.addEventListener('click', () => {
        // Switches currentSection value to toggle between sections
        currentSection = currentSection === 1 ? 0 : 1;

        // This if statement handles which page section to show
        if (currentSection === 0) {
            // Switch display of toggle button and show the GPA calculator
            showGPAsToggle.textContent = 'Show GPA Table'
            page1Sections[0].classList.add('active');
            page1Sections[1].classList.remove('active');
        } else {
            // Switch display of toggle button and show the GPA table
            showGPAsToggle.textContent = 'Hide GPA Table'
            page1Sections[0].classList.remove('active');
            page1Sections[1].classList.add('active');
        }
        // This if statement handles shown terms in the active years
        const activeYear = document.querySelector('.year-content.active');
        if (currentSection === 0) {
            // Reshow any saved active terms in the active year
            if (activeYear) {
                const yearNumber = activeYear.id.split('-')[2];
                const childTerms = activeYear.querySelectorAll('.term-content');
                childTerms.forEach(term => {
                    const termNumber = term.id.split('-')[3];
                    const termStatus = termStatuses[yearNumber - 1][termNumber - 1];
                    if (termStatus == 'active') {
                        toggleTerm(yearNumber, termNumber);
                    };
                });
            };
        } else {
            // Hide any active terms to reduce extension height
            switchYearContents(null);
        };
    });

    // Obtain year buttons on year nav bar
    const yearButtons = document.querySelectorAll('.year-button');
    // Add click event listener to each button
    yearButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Get id of button pressed
            const yearNumber = button.id.split('-')[2];
            // If currently displaying the table,
            if (page1Sections[1].classList.contains('active')) {
                // Hide the table and display the calculator
                showGPAsToggle.click();
            };
            // Switch displayed year to selected year using id
            switchYearContents(yearNumber);
        });
    });

    // Create 2D storage array containing status for every term
    // Four nested arrays, each representing a grade year
    let termStatuses = [[], [], [], []]
    // Fill in each year with an 'inactive' status for each term
    for (let i = 0; i < termStatuses.length; i++) {
        for (let j = 0; j < 4; j++) {
            termStatuses[i][j] = 'inactive'
        };
    };

    // Function to switch the year being displayed
    const switchYearContents = yearNumber => {
        // Obtain every term content element
        const termContents = document.querySelectorAll('.term-content');
        termContents.forEach(termContent => {
            // Check if each term content is currently active
            if (termContent.classList.contains('active')) {
                // Get id values for the activeTerm
                const yearNumber = termContent.id.split('-')[1];
                const termNumber = termContent.id.split('-')[3];
                // Hide the term to reduce extension height
                toggleTerm(yearNumber, termNumber);
                // Save the term status as active in the storage array
                termStatuses[yearNumber - 1][termNumber - 1] = 'active';
            };
        });

        // If parameter is null, this means this function isn't being used
        // from a year button. Instead it is being used to hide active terms
        // to reduce extension height.
        if (yearNumber == null) {
            // Exit the function
            return;
        };

        // Obtain year contents, default text elements
        const yearContents = document.querySelectorAll('.year-content');
        const defaultText = document.getElementById('default-text');
        // Use the parameter to obtain the desired year content and nav bar button
        const selectedContent = document.getElementById(`year-content-${yearNumber}`);
        const selectedButton = document.getElementById(`year-nav-${yearNumber}`);

        // Remove visibility of defaultText to reset
        defaultText.classList.remove('active');

        if (selectedContent.classList.contains('active')) {
            // Hide the selected content and deselect button if the content is active
            selectedContent.classList.remove('active');
            selectedButton.classList.remove('active');
            // Display default text since year content was removed
            defaultText.classList.add('active');
            return;
        } else {
            // Remove active from every year content and button to reset
            yearContents.forEach(yearContent => yearContent.classList.remove('active'));
            yearButtons.forEach(yearButton => yearButton.classList.remove('active'));
            // Add active to desired content and button
            selectedContent.classList.add('active');
            selectedButton.classList.add('active');
        };

        // Obtain terms shown by active grade year
        const shownTerms = selectedContent.querySelectorAll('.term-content');
        shownTerms.forEach(term => {
            // Get id values for each term in the grade year
            const termNumber = term.id.split('-')[3];
            // Check the saved status of the term
            const termStatus = termStatuses[yearNumber - 1][termNumber - 1];
            if (termStatus == 'active') {
                // Display the term content if saved as active
                toggleTerm(yearNumber, termNumber);
            };
        });
    };

    // Obtain term headers
    const termHeaders = document.querySelectorAll('.term-header');
    // Add click event listener to each term header
    termHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Obtain id values of the term
            const yearNumber = header.id.split('-')[1];
            const termNumber = header.id.split('-')[3];
            // Pass id values to show desired term
            toggleTerm(yearNumber, termNumber);
        });
    });

    // Function to show/hide term content and update their status
    const toggleTerm = (yearNumber, termNumber) => {
        // Obtain desired term content and corresponding arrow using parameters
        const selectedContent = document.getElementById(`y-${yearNumber}-t-${termNumber}-content`);
        const selectedArrow = document.getElementById(`y-${yearNumber}-t-${termNumber}-term-arrow`);

        if (selectedContent.classList.contains('active')) {
            // If the term is already active, make it inactive
            selectedContent.classList.remove('active');
            selectedArrow.classList.remove('active');
            termStatuses[yearNumber - 1][termNumber - 1] = 'inactive';
        } else {
            // Make the desired term active
            selectedContent.classList.add('active');
            selectedArrow.classList.add('active');
            termStatuses[yearNumber - 1][termNumber - 1] = 'active';
        };
        // Adjust year and section contents following term adjustments
        adjustYearContents();
        adjustSectionContents();
    };
});