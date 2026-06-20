/* Lets us use matchers like expect(element).toBeInTheDocument() without importing them in every test files. */
import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from 'util';
import 'cross-fetch/polyfill';

/* Jest is running in a Node environment that lacks the TextEncoder web API that React Router relies on, so we need to Polyfill
   TextEncoder in Jest. 
   
   TypeScript type mismatch between Node's TextE/Decoder and the browser's expected TextE/Decoder interface requires casting. */
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

/* For mocking matchMedia for JSDOM. Add/override the matchMedia method of the global window object. 
   writable: true allows for future changes to the property. The value: (query) => ({...}) defines a
   mock implementation that returns an object  mimicking MediaQueryList. */
Object.defineProperty(window, 'matchMedia', {
   writable: true,
   value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
   }),
});

/* JSDOM does not implement ResizeObserver, which Radix UI components rely on for
   layout measurement (Ex: Popover, Command). Tests that open these components
   will throw errors unless ResizeObserver is defined, so we provide a minimal no-op
   polyfill that satisfies Radix without performing real layout work. */
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

(global as any).ResizeObserver = ResizeObserver;

/* JSDOM does not implement scrollIntoView, which Radix UI's Command component
   calls when navigating or filtering items. A no-op mock prevents tests from
   crashing without affecting behavior. */
window.HTMLElement.prototype.scrollIntoView = function () {};

/* JSDOM does not implement scrollTo, which Radix UI may call when filtering or
   managing scroll position inside CommandList. A no-op mock prevents crashes. */
window.HTMLElement.prototype.scrollTo = function () {};

/* React Router v7 requires the WHATWG Request API, which JSDOM does not provide.
   Node 20 provides a global Request implementation, but it may not be attached
   to the global object in Jest's environment. We safely copy it if available. */
if (typeof global.Request === "undefined" && typeof Request !== "undefined") {
  // @ts-ignore
  global.Request = Request;
}
