import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "node:util";

// Ensure React Testing Library knows we're in act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfills
if (globalThis.TextEncoder === undefined) globalThis.TextEncoder = TextEncoder;
if (globalThis.TextDecoder === undefined) globalThis.TextDecoder = TextDecoder;
