document.addEventListener('DOMContentLoaded', () => {
    // Obtain dropdown header elements
    const dropdownHeaders = document.querySelectorAll('.info-dropdown-header');
    // Add click event listener to each dropdown header
    dropdownHeaders.forEach((header) => {
        header.addEventListener('click', () => {
            // Obtain the id of the header
            const idNumber = header.id.split('-')[3];
            // Use id to find corresponding selected header, content, and arrow
            const selectedHeader = document.getElementById(`info-d-h-${idNumber}`);
            const selectedContent = document.getElementById(`info-d-c-${idNumber}`);
            const selectedArrow = document.getElementById(`info-d-h-${idNumber}`).querySelector('.i-d-h-arrow');
            // Obtain every headeer, content, and arrow
            const dropdownContents = document.querySelectorAll('.info-dropdown-content');
            const arrows = document.querySelectorAll('.i-d-h-arrow');
            const headers = document.querySelectorAll('.info-dropdown-header')

            if (selectedContent.classList.contains('active')) {
                // Hide selected content if it is already active
                selectedContent.classList.remove('active');
                selectedArrow.classList.remove('active');
                selectedHeader.classList.remove('active');
            } else {
                // Hide all content
                headers.forEach(header => header.classList.remove('active'));
                dropdownContents.forEach(content => content.classList.remove('active'));
                arrows.forEach(arrow => arrow.classList.remove('active'));
                // Show only selected content
                selectedContent.classList.add('active');
                selectedArrow.classList.add('active');
                selectedHeader.classList.add('active');
            };
        });
    });

    // Code for resetting storage
    // Obtain reset storage button
    const resetStorage = document.getElementById('reset-storage-button');
    // Add click event listener to reset storage button
    resetStorage.addEventListener('click', () => {
        // Display a warning popup requiring the user to confirm clearing storage
        const confirmed = window.confirm("Are you sure you want to clear your storage? Note: this action cannot be undone.")
        if (confirmed) {
            // If the user selects OK, a message will display and storage will clear
            window.alert("Exit the extension to reset storage.");
            chrome.storage.sync.clear();
        };
    });

    // Obtain download GPA buton
    const downloadGPAButton = document.getElementById('download-GPAs-button');
    // Add click event listener
    downloadGPAButton.addEventListener('click', () => {
        // Display a confirmation popup
        const confirmed = window.confirm("Are you sure you want to download the GPA data? ");
        if (confirmed) {
            // If the user selects OK, the GPAs will be downloaded
            downloadGPAs();
        };
    });
    // Obtain download button on GPA table
    const otherButton = document.getElementById('table-download-button');
    // Add click event listener
    otherButton.addEventListener('click', () => {
        // Click the other button
        downloadGPAButton.click();
    });
    // Download GPAs function
    const downloadGPAs = () => {
        // Obtain table
        const table = document.getElementById('table');
        // Initialize CSV content
        let csvContent = '';
        // Save table data as CSV values
        for (let row of table.rows) {
            // 2D for loop iterator
            let rowData = [];
            for (let cell of row.cells) {
                // Push table data into rowData array
                rowData.push(cell.innerText);
            }
            // Save rowData as correct CSV values
            csvContent += rowData.join(',') + '\n';
        }
        // Use Blob API - create Blob object containing CSV content
        const blob = new Blob([csvContent], { type: 'text/csv' });
        // Create a URL for the blob object
        const url = URL.createObjectURL(blob);
        // Create a temporary anchor element
        const a = document.createElement('a');
        // Set the href element to the blob URL
        a.href = url;
        // Set the download attribute with the desired file name
        a.download = 'gpadata.csv';
        // Apend the anchor element to the body
        document.body.appendChild(a);
        // Click the anchor to trigger the download
        a.click();
        // Remove the anchor from the document after clicking
        document.body.removeChild(a);
        // Revoke the Blob URL to free up memory
        URL.revokeObjectURL(url);
    };
});