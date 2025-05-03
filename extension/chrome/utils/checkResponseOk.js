export function checkResponseOk(response, errorMessage) {
    if (!response.ok) {
        const message = `${errorMessage} (code ${response.status})`;
        console.log(message);
        throw new Error(message);
    }
}