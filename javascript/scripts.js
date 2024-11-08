﻿// Get the parameters that are passed in
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.slice(1);  // Remove the "?" at the beginning
    if (!queryString) {
        console.log('No query string found');
        return params;  // Return empty object if no query string
    }

    queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
            params[key] = decodeURIComponent(value.replace(/\+/g, ' '));  // Replace '+' with space, decode
        }
    });
    return params;
}

// Global variables for notification settings
let enableUnlockNotice = true; // For unlock=true standard notice
let enableDynamicMessage = false; // For dynamic message, enabled manually
let enableNotificationButton = false; // Button will only show for dynamic messages

// Notification Bar Settings
document.addEventListener('DOMContentLoaded', function () {
    
    // Function to dynamically create the notification button
    function createNotificationButton(linkText, linkUrl) {
        const notificationBar = document.getElementById('notification-bar');
        const button = document.createElement('a'); // Create the button element
        button.id = 'notification-link';
        button.href = linkUrl;
        button.className = 'notification-button';
        button.innerText = linkText;
        button.style.display = 'inline-block';
        button.target = '_blank'; // Open the link in a new tab
        
        notificationBar.appendChild(button); // Append the button to the notification bar
    }

    // Function to show a notification bar
    function showNotificationBar(message, showButton = false, linkText = '', linkUrl = '') {
        const notificationBar = document.getElementById('notification-bar');
        const notificationMessage = document.getElementById('notification-message');
        
        notificationMessage.innerHTML = message;

        if (showButton && enableNotificationButton) {
            // Create the button dynamically if showButton is true
            createNotificationButton(linkText, linkUrl);
        }

        notificationBar.classList.add('active');
        notificationBar.classList.remove('inactive');
        notificationBar.style.display = 'block';
    }

    // Function to hide the notification bar
    function hideNotificationBar() {
        const notificationBar = document.getElementById('notification-bar');
        notificationBar.classList.remove('active');
        notificationBar.classList.add('inactive');
        setTimeout(() => {
            notificationBar.style.display = 'none';
        }, 300);
    }

    // Add event listener to close button
    document.getElementById('close-notification').addEventListener('click', function () {
        hideNotificationBar();
    });

    // Example usage for the unlock=true standard notice
    const urlParams = new URLSearchParams(window.location.search);
    const unlock = urlParams.get('unlock');

    // Check for unlock=true param
    if (unlock === 'true' && enableUnlockNotice) {
        // Display the unlock notice without a button
        showNotificationBar(
            '<b>Warning:</b> Testing parameter has been provided. <b>DO NOT</b> submit information as the application will not function properly. If this is a mistake, please contact us.',
            false // No button for this message
        );
    }

    // Show dynamic message only if enabled
    if (enableDynamicMessage) {
        showNotificationBar(
            '<b>Notice:</b> This is a dynamic message for testing or user guidance.',
            true, // Enable button for dynamic message
            'Go to Start Page', // Text for the button
            'https://manutelehealth.com/start' // URL for the button
        );
    }
});

// Processing App
document.addEventListener("DOMContentLoaded", function () {
    const approvalCheckURL = "https://hook.us1.make.com/jofnuivdqguoi3kirp7upi26xv0uul6k";
    const urlParams = new URLSearchParams(window.location.search);
    const applicationId = urlParams.get("id");

    if (!applicationId) {
        console.error("No application ID found in the URL.");
        return;
    }

    // Display "Analyzing your application..." message below header
    const processingMessage = document.createElement("p");
    processingMessage.textContent = "Analyzing your application...";
    processingMessage.className = "processing-text";
    document.querySelector(".content").appendChild(processingMessage);

    // Placeholder for response text
    const responseTextElement = document.createElement("p");
    responseTextElement.className = "response-text";
    document.querySelector(".content").appendChild(responseTextElement);

    // Continue button, initially hidden
    const continueButton = document.createElement("button");
    continueButton.className = "continue-button";
    continueButton.textContent = "Continue";
    continueButton.style.display = "none"; // Hide initially
    document.querySelector(".content").appendChild(continueButton);

    setTimeout(() => {
        fetch(approvalCheckURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ applicationId: applicationId }),
        })
        .then(response => response.json())
        .then(data => {
            // Hide processing text
            processingMessage.style.display = "none";

            // Prepare response message and add premium text styling
            let message = data.message || "Thank you for your application!";
            message = message.replace("MavenX", "<span class='response-text-highlight'>MavenX</span>");
            message = message.replace("Primary Care", "<span class='response-text-highlight'>Primary Care</span>");
            responseTextElement.innerHTML = message; // Insert formatted message
            
            // Fade in the response message
            responseTextElement.style.opacity = 1;

            // Show the Continue button once the message is fully visible
            continueButton.style.display = "inline-block";
            continueButton.onclick = function() {
            let nextUrl = data.status === "approved"
                ? "https://onboard.mavendigital.net/calendar-booking"
                : "https://onboard.mavendigital.net/not-approved"; // Redirect to not-approved if denied

            // Add contact_id as URL parameter if it exists
            if (data.contact_id) {
                nextUrl += `?contact_id=${encodeURIComponent(data.contact_id)}`;
            }

            window.location.href = nextUrl;
        };
        })
        .catch(error => {
            console.error("Error with the approval check:", error);
            processingMessage.style.display = "none";
            
            responseTextElement.textContent = "An error occurred. Please try again later.";
            responseTextElement.className = "error-message";
            responseTextElement.style.opacity = 1; // Ensure visibility
        });
    }, 10000); // Wait 10 seconds before sending the request
});

// Load the Appointment Page Booking iFrame
function loadAppointmentForm() {
    const params = getQueryParams();
    const contact_id = params.contact_id;
    const unlock = params.unlock;

    if (contact_id) {
        // Default Flow
        const iframe = document.getElementById('ghl-embed');
        iframe.src = `https://api.leadconnectorhq.com/widget/booking/2D7dBjxKShTMuG2QeU8f?contact_id=${encodeURIComponent(contact_id)}`;
        iframe.style.display = 'block';
    }  else if (unlock === 'true') {
        // Allow access if the unlock parameter is present and true
        const iframe = document.getElementById('ghl-embed');
        iframe.src = `https://api.leadconnectorhq.com/widget/booking/2D7dBjxKShTMuG2QeU8f`;
        iframe.style.display = 'block';
    } else {
        const errorMessage = document.getElementById('errorMessage');
        const buttonContainer = document.getElementById('buttonContainer');
        errorMessage.style.display = 'block';
        buttonContainer.style.display = 'block';
    }
}

// Disclaimer close function
function closeDisclaimer() {
    document.getElementById('disclaimer').style.display = 'none';
    localStorage.setItem('disclaimerClosedTime', new Date().getTime());
}


// Check Disclaimer status
function checkDisclaimer() {
    const disclaimerClosedTime = localStorage.getItem('disclaimerClosedTime');
    const now = new Date().getTime();


    if (disclaimerClosedTime && (now - disclaimerClosedTime < 24 * 60 * 60 * 1000)) {
        document.getElementById('disclaimer').style.display = 'none';
    }
}

// Function to setup the progress bar and encouragement text
function setupProgressBar(progress, message) {
    const progressBar = document.getElementById('progress-bar');
    const encouragementText = document.getElementById('encouragement-text');
    const color = '#39bad8'; // default color


    progressBar.style.width = progress + '%';
    progressBar.textContent = progress + '%';
    progressBar.style.backgroundColor = color; // Set the background color
    encouragementText.textContent = message;
}

// Function to setup the Onboard page
function setupOnboardPage() {
    setupProgressBar(25, "Welcome! Let's get started with your onboarding.");
}

// Progress bar
document.addEventListener('DOMContentLoaded', function () {
    const pathname = window.location.pathname;

    // Load specific functions based on the current page
    if (pathname.includes('application')) {
        setupProgressBar(25, "Welcome! Let's get started with your onboarding.");
    } else if (pathname.includes('calendar-booking')) {
        loadAppointmentForm();
        setupProgressBar(50, "Great! Now let's set up your initial onboard appointment.");
    } else if (pathname.includes('calendar-booking')) {
        loadAppointmentForm();
        setupProgressBar(75, "You're just about done! Let's set up your initial appointment.");
    } else if (pathname.includes('complete')) {
        setupCompletePage();
    }

    // Common functionality
    checkDisclaimer();
});