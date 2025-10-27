import { MeasurementsState } from './MeasurementsState.js';

import { connectPower } from './connect-power.js';
import { connectHeartRate } from './connect-heartrate.js';
import { connectCadence } from './connect-cadence.js';

const bikeMeasurements = new MeasurementsState();

// Expose bike to window for testing
if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined') {
    window.bike = bikeMeasurements;
}

const setPowerElement = (value) => {
    const powerDiv = document.getElementById('power');
    powerDiv.textContent = value.toString();
}

const setHeartrateElement = (value) => {
    const heartrateDiv = document.getElementById('heartrate');
    heartrateDiv.textContent = value.toString();
}

const setCadenceElement = (value) => {
    const cadenceDiv = document.getElementById('cadence');
    cadenceDiv.textContent = value.toString();
}

// Event loop to update power display every 100ms
const updatePowerDisplay = () => {
    const emptyValue = '--';
    if (bikeMeasurements.power.length === 0) {
        setPowerElement(emptyValue);
        return;
    }

    const latestPower = bikeMeasurements.power[bikeMeasurements.power.length - 1];
    const age = Date.now() - latestPower.timestamp;

    if (age < 3000) {
        setPowerElement(latestPower.value);
    } else {
        setPowerElement(emptyValue);
    }
};

const updateHeartrateDisplay = () => {
    const emptyValue = '--';
    if (bikeMeasurements.heartrate.length === 0) {
        setHeartrateElement(emptyValue);
        return;
    }

    const latestHeartrate = bikeMeasurements.heartrate[bikeMeasurements.heartrate.length - 1];
    const age = Date.now() - latestHeartrate.timestamp;

    if (age < 3000) {
        setHeartrateElement(latestHeartrate.value);
    } else {
        setHeartrateElement(emptyValue);
    }
};

const updateCadenceDisplay = () => {
    const emptyValue = '--';
    if (bikeMeasurements.cadence.length === 0) {
        setCadenceElement(emptyValue);
        return;
    }

    const latestCadence = bikeMeasurements.cadence[bikeMeasurements.cadence.length - 1];
    const age = Date.now() - latestCadence.timestamp;

    if (age < 3000) {
        setCadenceElement(latestCadence.value);
    } else {
        setCadenceElement(emptyValue);
    }
};

// Start the event loop
setInterval(updatePowerDisplay, 100);
setInterval(updateHeartrateDisplay, 100);
setInterval(updateCadenceDisplay, 100);

let disconnectPower = null;
let disconnectHeartrate = null;
let disconnectCadence = null;

const connectPowerElem = document.getElementById('connectPower');
connectPowerElem.addEventListener('click', async () => {
    try {
        const { stop, addListener } = await connectPower();
        disconnectPower = stop;
        addListener((entry) => {
            bikeMeasurements.addPower(entry);
        });
    } catch (error) {
        console.error('Error connecting power:', error);
    }
});

const connectHeartrateElem = document.getElementById('connectHeartrate');
connectHeartrateElem.addEventListener('click', async () => {
    try {
        const { stop, addListener } = await connectHeartRate();
        disconnectHeartrate = stop;
        addListener((entry) => {
            bikeMeasurements.addHeartrate(entry);
        });
    } catch (error) {
        console.error('Error connecting heartrate:', error);
    }
});

const connectCadenceElem = document.getElementById('connectCadence');
connectCadenceElem.addEventListener('click', async () => {
    try {
        const { stop, addListener } = await connectCadence();
        disconnectCadence = stop;
        addListener((entry) => {
            bikeMeasurements.addCadence(entry);
        });
    } catch (error) {
        console.error('Error connecting cadence:', error);
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
