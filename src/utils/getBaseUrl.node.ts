/* We need a special version of this for testing because Jest doesn't allow import.meta.env. 
   See moduleNameMapper in jest.config.csj as well. */
export function getBaseUrl() {
    // return process.env.API_URL ?? "http://localhost:8000";
    return process.env.API_URL ?? "http://127.0.0.1:8000";
}
