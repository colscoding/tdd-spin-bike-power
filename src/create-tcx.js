import { MeasurementsState } from "./MeasurementsState.js"


export const getValuesAtTimestamps = (arr, timestamps) => {
    const entries = [];
    let index = 0;
    for (const ts of timestamps) {
        while (index < arr.length && arr[index].timestamp < ts) {
            index++;
        }

        const prevIndex = index - 1;
        let suggestedElem = undefined
        if (prevIndex < 0) {
            suggestedElem = arr?.[index]
        } else if (index >= arr.length) {
            suggestedElem = arr?.[prevIndex]
        } else {
            const prevTime = arr?.[prevIndex]?.timestamp ?? 0;
            const nextTime = arr?.[index]?.timestamp ?? 0;
            suggestedElem = (ts - prevTime) <= (nextTime - ts) ? arr?.[prevIndex] : arr?.[index];
        }
        if (suggestedElem?.timestamp && Math.abs(suggestedElem.timestamp - ts) <= 1000) {
            entries.push(suggestedElem.value);
        } else {
            entries.push(null);
        }
    }
    return entries;
}

/**
 * @param {MeasurementsState} measurements - The measurements state object containing workout data
 */
export const mergeMeasurements = (measurements) => {
    const keys = ['heartrate', 'cadence', 'power'];
    const sources = [measurements.heartrate, measurements.cadence, measurements.power];
    const hasData = sources.some(data => data.length > 0);
    if (!hasData) {
        return [];
    }
    const firstTimestamps = sources.map(data => data.length > 0 ? data[0].timestamp : Infinity);
    const startTime = Math.min(...firstTimestamps);
    const endTime = Math.max(...sources.map(data => data.length > 0 ? data[data.length - 1].timestamp : -Infinity));
    const timeStep = 1000; // 1 second intervals
    const timestamps = [];
    let time = startTime
    while (time <= endTime) {
        timestamps.push(time);
        time += timeStep;
    }
    const syncedHR = getValuesAtTimestamps(measurements.heartrate, timestamps);
    const syncedCadence = getValuesAtTimestamps(measurements.cadence, timestamps);
    const syncedPower = getValuesAtTimestamps(measurements.power, timestamps);

    const dataPoints = [];
    for (let i = 0; i < timestamps.length; i++) {
        const point = {
            timestamp: timestamps[i],
            heartrate: syncedHR[i] ?? null,
            cadence: syncedCadence[i] ?? null,
            power: syncedPower[i] ?? null,
        };
        dataPoints.push(point);
    }
    return dataPoints;
}


const hrString = (hr) => hr !== null ? `<HeartRateBpm><Value>${Math.round(hr)}</Value></HeartRateBpm>` : '';
const cadenceString = (cadence) => cadence !== null ? `<Cadence>${Math.round(cadence)}</Cadence>` : '';
const powerString = (power) => {
    if (power === null) return '';
    return `<Extensions>
              <TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
                <Watts>${Math.round(power)}</Watts>
              </TPX>
            </Extensions>`;
}

const getTcxTrackpoint = (point) => {
    const timestamp = new Date(point.timestamp).toISOString();
    const keyToString = { heartrate: hrString, cadence: cadenceString, power: powerString };
    const parts = Object.entries(keyToString).map(([key, toStringFn]) => {
        const value = point[key];
        return value !== null ? toStringFn(value) : '';
    }).filter(part => part !== '');
    const tcx = `
<Trackpoint>
    <Time>${timestamp}</Time>
    ${parts.join('\n')}
</Trackpoint>
    `.trim();
    return tcx;
}

/**
 * Creates a Garmin TCX (Training Center XML) string from merged measurements
 * @param {MeasurementsState} measurements - Merged measurement data points
 * @returns {string} TCX formatted XML string
 */
export const getTcxString = (measurements) => {
    const dataPoints = mergeMeasurements(measurements);
    if (!dataPoints || dataPoints.length === 0) {
        return '';
    }

    const firstTimestamp = dataPoints[0].timestamp;
    const lastTimestamp = dataPoints[dataPoints.length - 1].timestamp;
    const totalTimeSeconds = Math.round((lastTimestamp - firstTimestamp) / 1000);
    const startDate = new Date(firstTimestamp).toISOString();

    const tcx = `<?xml version="1.0" encoding="UTF-8"?>
    <TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
        <Activities>
            <Activity Sport="Biking">
                <Id>${startDate}</Id>
                <Lap StartTime="${startDate}">
                    <TotalTimeSeconds>${totalTimeSeconds}</TotalTimeSeconds>
                    <Calories>0</Calories>
                    <Intensity>Active</Intensity>
                    <TriggerMethod>Manual</TriggerMethod>
                    <Track>
${dataPoints.map(getTcxTrackpoint).join('\n')}
                    </Track>
                </Lap>
            </Activity>
        </Activities>
    </TrainingCenterDatabase>`;

    return tcx;
}