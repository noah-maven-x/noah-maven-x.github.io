// Get the parameters that are passed in
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

// Start Page
function timeoutPromise(ms, message) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error(message)), ms)
    );
}

function formatPhoneNumber(phone) {
    // Remove any characters that are not digits
    phone = phone.replace(/\D/g, '');

    // If the phone number doesn't start with a country code, assume it's a US number and add +1
    if (phone.length === 10) {
        phone = '1' + phone;
    }

    // Add the '+' sign for the country code
    return '+' + phone;
}

function checkEmail(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    let phone = document.getElementById('phone').value;
    const messageElement = document.getElementById('overlayMessageContent');
    const loadingElement = document.getElementById('loading');
    const overlay = document.getElementById('overlay');
    const turnstileToken = document.querySelector('.cf-turnstile').dataset.token;
    
    // Format the phone number
    phone = formatPhoneNumber(phone);

    // Ensure Turnstile is verified before proceeding
    if (!turnstileToken) {
        loadingElement.style.display = 'none'; // Hide the loading animation
        messageElement.innerHTML = "<b>⚠️ Warning ⚠️</b><br>You must receive a 'Success' CAPTCHA verification before being able to continue.";
        messageElement.className = "message error";
        overlay.style.display = 'flex';
        messageElement.style.display = 'block';
        return; // Stop further execution if Turnstile is not verified
    }

    // Show the loading animation
    loadingElement.style.display = 'block';

    Promise.race([
        fetch('https://hook.us1.make.com/ghqzywf5xisue9nhzxxiir6mqm6z8c7q', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, phone: phone, turnstileToken: turnstileToken })
        }).then(response => response.json()),
        timeoutPromise(10000, "The request timed out. Please try again.")
    ])
    .then(data => {
        loadingElement.style.display = 'none'; // Hide the loading animation

        if (data.status === "existing" || data.status === "completed") {
            messageElement.innerHTML = "<b>🎉 Success! 🎉</b><br>Please check your email and text messages for further information.";
            messageElement.className = "message info";
            overlay.style.display = 'flex';
            messageElement.style.display = 'block';
        } else if (data.status === "new") {
            window.location.href = data.redirectUrl;
            return; // Stop further execution to avoid showing overlay
        } else {
            messageElement.innerHTML = "<b>🔴 Error 🔴</b><br>We're sorry, an error occurred. If you continue to receive this error, please contact mdm@mavenx.co";
            messageElement.className = "message error";
            overlay.style.display = 'flex';
            messageElement.style.display = 'block';
        }
    })
    .catch(error => {
        loadingElement.style.display = 'none'; // Hide the loading animation
        messageElement.innerHTML = "<b>🔴 Error 🔴</b><br>We're sorry, an error occurred. If you continue to receive this error, please contact mdm@mavenx.co";
        messageElement.className = "message error";
        overlay.style.display = 'flex';
        messageElement.style.display = 'block';
    });
}

function closeOverlay() {
    document.getElementById('overlay').style.display = 'none';
}

function onTurnstileVerified(token) {
    // Save the token in the Turnstile element's data attribute
    document.querySelector('.cf-turnstile').dataset.token = token;
    console.log('Turnstile verified:', token);
}

// Auto Height Airtable Form
document.addEventListener("DOMContentLoaded", function () {
    const iframe = document.getElementById("airtableForm");

    window.addEventListener("message", function (event) {
        // Ensure the message is coming from Airtable
        if (event.origin === "https://airtable.com") {
            const data = event.data;
            // Check if data is an object and has height information
            if (typeof data === "object" && data.type === "embed-height") {
                iframe.style.height = `${data.height}px`;
            }
        }
    });
});

// Load the Onboard Page Typeform iFrame
function loadOnboardTypeform() {
    const params = getQueryParams();
    const email = params.email;
    const phone = params.phone;
    const unlock = params.unlock;

    if (email && phone) {
        // Email and phone are provided
        const typeformURL = `https://form.typeform.com/to/KMxOyeHm#email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
        const iframe = document.getElementById('typeform-embed');
        iframe.src = typeformURL;
        iframe.style.display = 'block';
    } else if (unlock === 'true') {
        // Unlock is true but no other params, proceed without the params
        const typeformURL = `https://form.typeform.com/to/KMxOyeHm`;
        const iframe = document.getElementById('typeform-embed');
        iframe.src = typeformURL;
        iframe.style.display = 'block';
    } else {
        // No valid parameters, show error
        const errorMessage = document.getElementById('errorMessage');
        const buttonContainer = document.getElementById('buttonContainer');
        errorMessage.style.display = 'block';
        buttonContainer.style.display = 'block';
    }
}

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