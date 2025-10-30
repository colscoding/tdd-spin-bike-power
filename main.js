import { MeasurementsState } from './MeasurementsState.js';

import { connectPower } from './connect-power.js';
import { connectHeartRate } from './connect-heartrate.js';
import { connectCadence } from './connect-cadence.js';
import { getTcxString } from './create-tcx.js';

const bikeMeasurements = new MeasurementsState();

// Expose bike to window for testing
if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined') {
    window.bike = bikeMeasurements;
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

const state = {
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
}

const updateMetricDisplay = (key) => {
    const element = elements?.[key]?.display;
    if (!element || !state?.[key]) {
        return;
    }
    const emptyValue = '--';
    if (!state?.[key]?.isConnected) {
        element.textContent = emptyValue;
        return;
    }
    const arr = bikeMeasurements[key];
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
    if (typeof state[key].disconnect === 'function') {
        state[key].disconnect();
        state[key].disconnect = null;
        state[key].isConnected = false;
        const connectElem = elements[key]?.connect;
        if (connectElem?.textContent) {
            connectElem.textContent = `${emojis[key]} Connect ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        }
        const displayElem = elements?.[key]?.display;
        if (displayElem?.textContent) {
            displayElem.textContent = '--';
        }
    }
}

const connectFn = async (key) => {
    try {
        const { disconnect, addListener } = await connectFns[key]();

        state[key].disconnect = disconnect;
        state[key].isConnected = true;

        addListener((entry) => {
            bikeMeasurements.add(key, entry);
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
            if (state[key].isConnected) {
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
            power: bikeMeasurements.power,
            heartrate: bikeMeasurements.heartrate,
            cadence: bikeMeasurements.cadence,
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
        const tcxString = getTcxString(bikeMeasurements);
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
