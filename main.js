import { MeasurementsState } from './MeasurementsState.js';

import { connectPower } from './connect-power.js';
import { connectHeartRate } from './connect-heartrate.js';
import { connectCadence } from './connect-cadence.js';

const bikeMeasurements = new MeasurementsState();

// Expose bike to window for testing
if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined') {
    window.bike = bikeMeasurements;
}

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
        // Create export data object with all measurements
        const exportData = {
            power: bikeMeasurements.power,
            heartrate: bikeMeasurements.heartrate,
            cadence: bikeMeasurements.cadence,
        };

        // Convert to JSON
        const jsonString = JSON.stringify(exportData, null, 2);

        // Create blob and download link
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bike-measurements-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
    }
});
