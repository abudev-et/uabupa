const statusDiv = document.getElementById("status");
const autoClickStatus = document.getElementById("autoClickStatus");

// Original automation code
document.getElementById("start").addEventListener("click", async () => {
    try {
        // Get input values
        const appointmentDate = document.getElementById("appointmentDate").value;
        const officeId = document.getElementById("officeLocation").value;
        const fileInput = document.getElementById("userJsonFile");
        
        if (!appointmentDate) throw new Error("Please select an appointment date");
        if (!officeId) throw new Error("Please select an office location");
        if (fileInput.files.length === 0) throw new Error("Please upload a JSON file");
        
        // Read JSON file
        const file = fileInput.files[0];
        const fileText = await readFileAsText(file);
        const userData = JSON.parse(fileText);
        
        if (!userData || !Array.isArray(userData)) throw new Error("Invalid JSON format");
        
        // Store ALL data including officeId
        await chrome.storage.local.set({
            appointmentDate,
            officeId: parseInt(officeId),
            userData: userData[0],
        });

        // Execute content script
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (!tab.url.includes('ethiopianpassportservices.gov.et')) {
            throw new Error("Please open the passport services website first");
        }
        
        console.log("Injecting content script into tab:", tab.id);
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ['content.js']
        });
        
        // Send a message to content script to start automation
        console.log("Sending start message to content script");
        await chrome.tabs.sendMessage(tab.id, { action: "startAutomation" });
        
        statusDiv.textContent = "Automation started successfully!";
        statusDiv.className = "success";
        statusDiv.style.display = "block";

        // Listen for the order ID response
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'orderId') {
                const orderIdDiv = document.getElementById('orderId');
                const fullName = userData[0].fullName;
                orderIdDiv.textContent = `Name: ${fullName}\nOrder ID: ${message.orderId}`;
                orderIdDiv.style.display = 'block';
            }
        });
        
    } catch (error) {
        statusDiv.textContent = error.message;
        statusDiv.className = "error";
        statusDiv.style.display = "block";
        console.error("Error:", error);
    }
});

// Auto-click functionality
document.addEventListener('DOMContentLoaded', function() {
    let isAutoClickRunning = false;
    let clickInterval;

    // Function to start auto-clicking
    function startAutoClick(duration) {
        if (isAutoClickRunning) {
            stopAutoClick();
            return;
        }

        isAutoClickRunning = true;
        autoClickStatus.textContent = `Auto-click running for ${duration} seconds...`;
        
        // Get the start button
        const startButton = document.getElementById('start');
        
        if (startButton) {
            // Click every 1.5 seconds
            clickInterval = setInterval(async () => {
                try {
                    // Method 1: Direct click
                    startButton.click();
                    console.log('First click method at:', new Date().toLocaleTimeString());
                    
                    // Wait 0.5 seconds between click methods
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Method 2: MouseEvent
                    startButton.dispatchEvent(new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    }));
                    console.log('Second click method at:', new Date().toLocaleTimeString());
                    
                } catch (error) {
                    console.error('Error clicking button:', error);
                }
            }, 1500); // Click every 1.5 seconds
        } else {
            autoClickStatus.textContent = 'Error: Start button not found';
            isAutoClickRunning = false;
            return;
        }

        // Set timeout to stop after specified duration
        setTimeout(() => {
            if (isAutoClickRunning) {
                stopAutoClick();
            }
        }, duration * 1000);
    }

    function stopAutoClick() {
        isAutoClickRunning = false;
        autoClickStatus.textContent = 'Auto-click stopped';
        
        if (clickInterval) {
            clearInterval(clickInterval);
            clickInterval = null;
        }
    }

    // Add click handlers for all auto-click buttons
    document.getElementById('autoClick5s').addEventListener('click', () => startAutoClick(5));
    document.getElementById('autoClick10s').addEventListener('click', () => startAutoClick(10));
    document.getElementById('autoClick15s').addEventListener('click', () => startAutoClick(15));
    document.getElementById('autoClick20s').addEventListener('click', () => startAutoClick(20));
});

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = error => reject(error);
        reader.readAsText(file);
    });
}