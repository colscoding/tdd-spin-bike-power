import { MeasurementsState } from './MeasurementsState.js';

import { connectPower } from './connect-power.js';
import { connectHeartRate } from './connect-heartrate.js';
import { connectCadence } from './connect-cadence.js';
import { getTcxString } from './create-tcx.js';

// Start/Stop button
const startStopButton = document.getElementById('startStop');

const measurementsState = new MeasurementsState();

const connectionsState = {
    power: {
        isConnected: false,
        disconnect: null,
    },
    heartrate: {
        isConnected: false,
        disconnect: null,
    },
    cadence: {
        isConnected: false,
        disconnect: null,
    }
};

const timeState = {
    running: false,
    startTime: null,
    endTime: null,
}

const getTimestring = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return (
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`
    );
}

const timeElement = document.getElementById('time');
setInterval(() => {
    let nextText = '00:00:00'
    if (timeState.startTime && timeState.running) {
        const elapsedMs = Date.now() - timeState.startTime;
        nextText = getTimestring(elapsedMs);
    } else if (timeState.startTime && timeState.endTime) {
        const elapsedMs = timeState.endTime - timeState.startTime;
        nextText = getTimestring(elapsedMs);
    }
    if (timeElement.textContent !== nextText) {
        timeElement.textContent = nextText;
    }

    const nextStartButtonText = timeState.running ? '⏹️' : '▶️';
    if (startStopButton.textContent !== nextStartButtonText) {
        startStopButton.textContent = nextStartButtonText;
    }
}, 100);

// Expose bike to window for testing
if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined') {
    window.bike = measurementsState;
    window.connectionsState = connectionsState;
}

// Keep screen awake during workout
let wakeLock = null;
const requestWakeLock = async () => {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock activated');

            // Re-request wake lock if page becomes visible again
            wakeLock.addEventListener('release', () => {
                console.log('Screen wake lock released');
            });
        }
    } catch (err) {
        console.error('Wake lock request failed:', err);
    }
};

// Request wake lock when page loads
if (document.visibilityState === 'visible') {
    requestWakeLock();
}

// Re-request wake lock when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        requestWakeLock();
    }
});

const metricTypes = ['power', 'heartrate', 'cadence'];

const powerElement = document.getElementById('power');
const heartrateElement = document.getElementById('heartrate');
const cadenceElement = document.getElementById('cadence');

const connectPowerElem = document.getElementById('connectPower');
const connectHeartrateElem = document.getElementById('connectHeartrate');
const connectCadenceElem = document.getElementById('connectCadence');

const elements = {
    power: { display: powerElement, connect: connectPowerElem },
    heartrate: { display: heartrateElement, connect: connectHeartrateElem },
    cadence: { display: cadenceElement, connect: connectCadenceElem },
}

const connectFns = {
    power: connectPower,
    heartrate: connectHeartRate,
    cadence: connectCadence,
};

const emojis = {
    power: '⚡',
    heartrate: '❤️',
    cadence: '🚴',
};


const updateMetricDisplay = (key) => {
    const element = elements?.[key]?.display;
    if (!element || !connectionsState?.[key]) {
        return;
    }
    const emptyValue = '--';
    if (!connectionsState?.[key]?.isConnected) {
        element.textContent = emptyValue;
        return;
    }
    const arr = measurementsState[key];
    if (!Array.isArray(arr) || arr.length === 0) {
        element.textContent = emptyValue;
        return;
    }

    const latestMeasurement = arr[arr.length - 1];
    if (!latestMeasurement || typeof latestMeasurement.value !== 'number' || typeof latestMeasurement.timestamp !== 'number') {
        element.textContent = emptyValue;
        return;
    }
    const timeDiff = Date.now() - latestMeasurement.timestamp;
    // If data is older than 5 seconds, show as disconnected
    if (timeDiff > 5000) {
        element.textContent = emptyValue;
        return;
    }

    element.textContent = latestMeasurement.value;
}

// Start the event loop
setInterval(() => {
    metricTypes.forEach(updateMetricDisplay);
}, 100);

const disconnectFn = (key) => {
    if (typeof connectionsState[key].disconnect === 'function') {
        connectionsState[key].disconnect();
        connectionsState[key].disconnect = null;
        connectionsState[key].isConnected = false;
        const connectElem = elements[key]?.connect;
        if (connectElem?.textContent) {
            connectElem.textContent = `${emojis[key]} Connect ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        }
        const displayElem = elements?.[key]?.display;
        if (displayElem?.textContent) {
            displayElem.textContent = '--';
        }
    }
};

const connectFn = async (key) => {
    try {
        const { disconnect, addListener } = await connectFns[key]();

        connectionsState[key].disconnect = disconnect;
        connectionsState[key].isConnected = true;
        if (!timeState.running) {
            timeState.running = true;
            timeState.startTime = Date.now();
        }
        addListener((entry) => {
            measurementsState.add(key, entry);
        });

        const connectElem = elements[key]?.connect;
        if (connectElem?.textContent) {
            connectElem.textContent = `${emojis[key]} Disconnect ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        }
    } catch (error) {
        console.error(`Error connecting ${key}:`, error);
    }
};

metricTypes.forEach((key) => {
    const connectElem = elements[key]?.connect;
    if (connectElem) {
        connectElem.addEventListener('click', async () => {
            if (connectionsState[key].isConnected) {
                disconnectFn(key);
            } else {
                connectFn(key);
            }
        });
    }
});

const exportDataElem = document.getElementById('exportData');
exportDataElem.addEventListener('click', () => {
    try {
        const timestamp = Date.now();

        // Create export data object with all measurements
        const exportData = {
            power: measurementsState.power,
            heartrate: measurementsState.heartrate,
            cadence: measurementsState.cadence,
        };

        // Download JSON file
        const jsonString = JSON.stringify(exportData, null, 2);
        const jsonBlob = new Blob([jsonString], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `bike-measurements-${timestamp}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);

        // Download TCX file
        const tcxString = getTcxString(measurementsState);
        const tcxBlob = new Blob([tcxString], { type: 'application/xml' });
        const tcxUrl = URL.createObjectURL(tcxBlob);
        const tcxLink = document.createElement('a');
        tcxLink.href = tcxUrl;
        tcxLink.download = `bike-workout-${timestamp}.tcx`;
        tcxLink.click();
        URL.revokeObjectURL(tcxUrl);
    } catch (error) {
        console.error('Error exporting data:', error);
    }
});


startStopButton.addEventListener('click', () => {
    if (timeState.running) {
        // Stop the workout (pause it, don't reset)
        timeState.running = false;
        timeState.endTime = Date.now();

        // Change button to start
        startStopButton.textContent = '▶️';
    } else {
        // Start/Resume the workout
        if (timeState.endTime) {
            // Resuming - adjust startTime to account for time stopped
            const stoppedDuration = Date.now() - timeState.endTime;
            timeState.startTime += stoppedDuration;
            timeState.endTime = null;
        } else {
            // Starting fresh
            timeState.startTime = Date.now();
        }
        timeState.running = true;
        startStopButton.textContent = '⏹️';
    }
});

// Discard button - in menu with confirmation dialog
const discardButton = document.getElementById('discardButton');
discardButton.addEventListener('click', () => {
    // Show confirmation dialog
    if (confirm('Are you sure you want to discard this workout?')) {
        // Reset time state
        timeState.running = false;
        timeState.startTime = null;
        timeState.endTime = null;

        // Reset measurements
        measurementsState.power = [];
        measurementsState.heartrate = [];
        measurementsState.cadence = [];
    }
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
    window.addEventListener('load', () => {
        const swUrl = new URL('sw.js', document.baseURI).href;
        navigator.serviceWorker.register(swUrl)
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
