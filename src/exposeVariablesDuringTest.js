export function exposeVariablesDuringTest({ measurementsState, connectionsState }) {
    if (process?.env?.NODE_ENV === 'test' && typeof window !== 'undefined') {
        window.bike = measurementsState;
        window.connectionsState = connectionsState;
    }
}
