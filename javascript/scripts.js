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

// Page 1 - Load the Onboard Page Airtable
// No code required

// Page 2 - Load the Plans Page Typeform iFrame
function loadPlansTypeform() {
    const params = getQueryParams();
    const patient_id = params.patient_id;
    const firstname = params.firstname;
    const unlock = params.unlock;

    if (patient_id && firstname) {
        // Default Flow
        const typeformURL = `https://manutelehealth.typeform.com/to/dVNpNZfL#patient_id=${encodeURIComponent(patient_id)}&firstname=${encodeURIComponent(firstname)}`;
        const iframe = document.getElementById('typeform-embed');
        iframe.src = typeformURL;
        iframe.style.display = 'block';
    } else if (unlock === 'true') {
        // Allow access if the unlock parameter is present and true
        const typeformURL = `https://manutelehealth.typeform.com/to/dVNpNZfL`;
        const iframe = document.getElementById('typeform-embed');
        iframe.src = typeformURL;
        iframe.style.display = 'block';
    }  else {
        const errorMessage = document.getElementById('errorMessage');
        const buttonContainer = document.getElementById('buttonContainer');
        errorMessage.style.display = 'block';
        buttonContainer.style.display = 'block';
    }
}

// Page 3 - Load the Appointment Page Booking iFrame
function loadAppointmentForm() {
    const params = getQueryParams();
    const contact_id = params.contact_id;
    const language = params.language;
    const unlock = params.unlock;

    if (contact_id && language === 'English') {
        // Default Flow
        const iframe = document.getElementById('ghl-embed');
        iframe.src = `https://api.leadconnectorhq.com/widget/booking/MjjM8tSZmSf8zT2hRqFK?contact_id=${encodeURIComponent(contact_id)}`;
        iframe.style.display = 'block';
    } else if (contact_id && language === 'Español') {
        // Default Flow
        const iframe = document.getElementById('ghl-embed');
        iframe.src = `https://api.leadconnectorhq.com/widget/booking/C8xautGH26UrGtij030A?contact_id=${encodeURIComponent(contact_id)}`;
        iframe.style.display = 'block';
    } else if (language === 'English' && unlock === 'true') {
        // Allow access if the unlock parameter is present and true
        const iframe = document.getElementById('ghl-embed');
        iframe.src = `https://api.leadconnectorhq.com/widget/booking/MjjM8tSZmSf8zT2hRqFK`;
        iframe.style.display = 'block';
    } else if (language === 'Español' && unlock === 'true') {
        // Allow access if the unlock parameter is present and true
        const iframe = document.getElementById('ghl-embed');
        iframe.src = `https://api.leadconnectorhq.com/widget/booking/C8xautGH26UrGtij030A`;
        iframe.style.display = 'block';
    } else if (unlock === 'true') {
        // Allow access if the unlock parameter is present and true
        const iframe = document.getElementById('ghl-embed');
        iframe.src = `https://api.leadconnectorhq.com/widget/booking/MjjM8tSZmSf8zT2hRqFK`;
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
    if (pathname.includes('onboard')) {
        setupProgressBar(25, "Welcome! Let's get started with your onboarding.");
    } else if (pathname.includes('plans')) {
        loadPlansTypeform();
        setupProgressBar(50, "You're halfway there! Choose the plan that suits you best.");
    } else if (pathname.includes('appointment')) {
        loadAppointmentForm();
        setupProgressBar(75, "You're just about done! Let's set up your initial appointment.");
    } else if (pathname.includes('complete')) {
        setupCompletePage();
    }

    // Common functionality
    checkDisclaimer();
});