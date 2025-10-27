import { MeasurementsState } from './MeasurementsState.js';

import { connectPower } from './connect-power.js';
import { connectHeartRate } from './connect-heartrate.js';

const bike = new MeasurementsState();

// Expose bike to window for testing
if (typeof window !== 'undefined') {
    window.bike = bike;
}

const setPowerElement = (value) => {
    const powerDiv = document.getElementById('power');
    powerDiv.textContent = value.toString();
}

const setHeartrateElement = (value) => {
    const heartrateDiv = document.getElementById('heartrate');
    heartrateDiv.textContent = value.toString();
}

// Event loop to update power display every 100ms
const updatePowerDisplay = () => {
    const emptyValue = '--';
    if (bike.power.length === 0) {
        setPowerElement(emptyValue);
        return;
    }

    const latestPower = bike.power[bike.power.length - 1];
    const age = Date.now() - latestPower.timestamp;

    if (age < 3000) {
        setPowerElement(latestPower.value);
    } else {
        setPowerElement(emptyValue);
    }
};

const updateHeartrateDisplay = () => {
    const emptyValue = '--';
    if (bike.heartrate.length === 0) {
        setHeartrateElement(emptyValue);
        return;
    }

    const latestHeartrate = bike.heartrate[bike.heartrate.length - 1];
    const age = Date.now() - latestHeartrate.timestamp;

    if (age < 3000) {
        setHeartrateElement(latestHeartrate.value);
    } else {
        setHeartrateElement(emptyValue);
    }
};

// Start the event loop
setInterval(updatePowerDisplay, 100);
setInterval(updateHeartrateDisplay, 100);

let disconnectPower = null;
let disconnectHeartrate = null;
const connectPowerElem = document.getElementById('connectPower');
connectPowerElem.addEventListener('click', async () => {
    try {
        const { stop, addListener } = await connectPower();
        disconnectPower = stop;
        addListener((entry) => {
            bike.addPower(entry);
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
            bike.addHeartrate(entry);
        });
    } catch (error) {
        console.error('Error connecting heartrate:', error);
    }
});

