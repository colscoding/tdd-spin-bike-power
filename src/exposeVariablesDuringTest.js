export function exposeVariablesDuringTest({ measurementsState, connectionsState }) {
    if (import.meta.env.MODE === 'test' && typeof window !== 'undefined') {
        window.bike = measurementsState;
        window.connectionsState = connectionsState;
    }
}
