
export const connectHeartRate = async () => {
    const listeners = [];
    const heartRateInterval = setInterval(() => {
        const randomHeartRate = Math.floor(Math.random() * 80) + 120; // 120-200 bpm
        const entry = { timestamp: Date.now(), value: randomHeartRate };
        listeners.forEach(listener => listener(entry));
    }, 1000);

    return {
        stop: () => clearInterval(heartRateInterval),
        addListener: (callback) => {
            listeners.push(callback);
        }
    };
}

