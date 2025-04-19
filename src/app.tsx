import {SettingsSection} from "spcr-settings";
import './resources/styles.css';

const settings = new SettingsSection("Nyan-Bar-Synced Settings", "nyanbarsynced-settings");

let audioData: any = null; // Variable to hold audio data

// Function to wait for a specific DOM element to appear before proceeding
async function waitForElement(selector: any, maxAttempts = 50, interval = 100) {
    let attempts = 0;
    while (attempts < maxAttempts) {
        const element = document.querySelector(selector); // Attempt to find the element
        if (element) {
            return element; // Return the element if found
        }
        await new Promise(resolve => setTimeout(resolve, interval)); // Wait for a specified interval before trying again
        attempts++;
    }
    throw new Error(`Element ${selector} not found after ${maxAttempts} attempts.`); // Throw error if element not found within attempts
}

// Function that fetches audio data from "wg://audio-attributes/v1/audio-analysis/" with retry handling
async function fetchAudioData(retryDelay = 200, maxRetries = 10) {
    try {
        return await Spicetify.getAudioData();
    } catch (error) {
        if (typeof error === "object" && error !== null && 'message' in error) {
            const message: any = error.message;

            if (message.includes("Cannot read properties of undefined") && maxRetries > 0) {
                console.log("[CAT-JAM-PARTY] Retrying to fetch audio data...");
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return fetchAudioData(retryDelay, maxRetries - 1); // Retry fetching audio data
            }
        } else {
            console.warn(`[CAT-JAM-PARTY] Error fetching audio data: ${error}`);
        }
        return null; // Return default playback rate on failure
    }
}

function createSettingsUI() {
    settings.addButton("nyanbarsynced-reload", "Console logs test", "Test", async () => {
        console.log("Test button clicked");
    });
    settings.pushSettings();
}

async function main() {
    // Continuously check until the Spicetify Player and audio data APIs are available
    while (!Spicetify?.Player?.addEventListener || !Spicetify?.getAudioData) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
    }

    // Load the audio data
    audioData = await fetchAudioData();

    // Create settings UI for the extension
    createSettingsUI();

    // Add event listeners for player state changes
    Spicetify.Player.addEventListener("onplaypause", async () => {

    });

    Spicetify.Player.addEventListener("onprogress", async () => {

    });

    Spicetify.Player.addEventListener("songchange", async () => {
        audioData = await fetchAudioData(); // Fetch new audio data on song change
    });
}

export default main; // Export the main function for use in the application