export function getIsVisualTest() {
    return import.meta.env.VITE_PLAYWRIGHT_VISUAL === 'true';
}
