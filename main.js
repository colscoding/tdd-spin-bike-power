import { MeasurementsState } from './MeasurementsState.js';

import { connectPower } from './connect-power.js';
import { connectHeartRate } from './connect-heartrate.js';
import { connectCadence } from './connect-cadence.js';

const bikeMeasurements = new MeasurementsState();

// Expose bike to window for testing
if (process.env.NODE_ENV === 'test' && typeof window !== 'undefined') {
    window.bike = bikeMeasurements;
}

const powerDiv = document.getElementById('power');
const heartrateDiv = document.getElementById('heartrate');
const cadenceDiv = document.getElementById('cadence');



let powerIsConnected = false;
let stopPower = null;
let stopHeartrate = null;
let stopCadence = null;

const setPowerElement = (value) => {
    powerDiv.textContent = value.toString();
}

const setHeartrateElement = (value) => {
    heartrateDiv.textContent = value.toString();
}

const setCadenceElement = (value) => {
    cadenceDiv.textContent = value.toString();
}

const updateMetricDisplay = (getMeasurementArray, setElement) => {
    const emptyValue = '--';
    const arr = getMeasurementArray();
    if (!Array.isArray(arr) || arr.length === 0) {
        setElement(emptyValue);
        return;
    }

    const latestMeasurement = arr[arr.length - 1];
    const age = Date.now() - latestMeasurement.timestamp;

    if (age < 60000) {
        setElement(latestMeasurement.value);
    } else {
        setElement(emptyValue);
    }
};

const updatePowerDisplay = () => {
    updateMetricDisplay(
        () => bikeMeasurements.power,
        (value) => {
            if (powerIsConnected) {
                setPowerElement(value);
            } else {
                setPowerElement('--');
            }
        }
    );
};

const updateHeartrateDisplay = () => {
    updateMetricDisplay(
        () => bikeMeasurements.heartrate,
        setHeartrateElement
    );
};

const updateCadenceDisplay = () => {
    updateMetricDisplay(
        () => bikeMeasurements.cadence,
        setCadenceElement
    );
};

// Start the event loop
setInterval(updatePowerDisplay, 100);
setInterval(updateHeartrateDisplay, 100);
setInterval(updateCadenceDisplay, 100);

const disconnectPower = () => {
    if (typeof stopPower === 'function') {
        stopPower();
        stopPower = null;
        powerIsConnected = false;
        connectPowerElem.textContent = 'Connect Power';
        setPowerElement('--');
    }
}
const connectPowerFn = async () => {
    try {
        const { stop, addListener } = await connectPower();
        stopPower = stop;
        addListener((entry) => {
            bikeMeasurements.addPower(entry);
        });
        powerIsConnected = true;
        connectPowerElem.textContent = 'Disconnect Power';
    } catch (error) {
        console.error('Error connecting power:', error);
    }
}
const connectPowerElem = document.getElementById('connectPower');
connectPowerElem.addEventListener('click', async () => {
    if (powerIsConnected) {
        disconnectPower();
    } else {
        connectPowerFn();
    }
});

const connectHeartrateElem = document.getElementById('connectHeartrate');
connectHeartrateElem.addEventListener('click', async () => {
    try {
        const { stop, addListener } = await connectHeartRate();
        stopHeartrate = stop;
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
        stopCadence = stop;
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
