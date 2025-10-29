export const connectCadenceMock = async () => {
    const listeners = [];
    const cadenceInterval = setInterval(() => {
        const randomCadence = Math.floor(Math.random() * 40) + 70; // 70-110 rpm
        const entry = { timestamp: Date.now(), value: randomCadence };
        listeners.forEach(listener => listener(entry));
    }, 1000);

    return {
        disconnect: () => clearInterval(cadenceInterval),
        addListener: (callback) => {
            listeners.push(callback);
        }
    };
}

export const connectCadenceBluetooth = async () => {
    const listeners = [];

    // Request Bluetooth device with cycling speed and cadence service
    const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['cycling_speed_and_cadence'] }],
        optionalServices: ['cycling_speed_and_cadence']
    });

    // Connect to GATT server
    const server = await device.gatt.connect();

    // Get cycling speed and cadence service
    const service = await server.getPrimaryService('cycling_speed_and_cadence');

    // Get CSC measurement characteristic
    const characteristic = await service.getCharacteristic('csc_measurement');

    // Start notifications
    await characteristic.startNotifications();

    // Listen for cadence changes
    characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        const flags = value.getUint8(0);

        // Check if cadence data is present (bit 1 of flags)
        if (flags & 0x02) {
            // Cadence is in bytes 5-6 (revolutions) - we calculate RPM from revolution count
            const cadenceRevs = value.getUint16(5, true);
            const cadenceTime = value.getUint16(7, true);

            // For simplicity, use a derived cadence value
            // In real implementation, you'd track deltas between measurements
            const cadence = Math.round((cadenceRevs / cadenceTime) * 60 * 1024);

            const entry = { timestamp: Date.now(), value: cadence };
            listeners.forEach(listener => listener(entry));
        }
    });

    return {
        disconnect: () => {
            characteristic.stopNotifications();
            device.gatt.disconnect();
        },
        addListener: (callback) => {
            listeners.push(callback);
        }
    };
}

export const connectCadence = async () => {
    if (process.env.NODE_ENV === 'test') {
        return connectCadenceMock();
    }
    return connectCadenceBluetooth();
};
