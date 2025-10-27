
export const connectPower = async () => {
    const listeners = [];
    const powerInterval = setInterval(() => {
        const randomPower = Math.floor(Math.random() * 300) + 100; // 100-400W
        const entry = { timestamp: Date.now(), value: randomPower };
        listeners.forEach(listener => listener(entry));
    }, 100);

    return {
        stop: () => clearInterval(powerInterval),
        addListener: (callback) => {
            listeners.push(callback);
        }
    };
}