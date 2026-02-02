import "@testing-library/jest-dom";

// Jest/jsdom does not provide Request, Response, or fetch. RTK Query's fetchBaseQuery
// uses them, so polyfill to avoid "ReferenceError: Request is not defined" when
// any code path triggers a real API call. Tests should mock the API; this is a fallback.
if (typeof globalThis.Request === "undefined") {
  (globalThis as unknown as { Request: unknown }).Request = class Request {
    url: string;
    method: string;
    constructor(input: string | Request, init?: RequestInit) {
      this.url = typeof input === "string" ? input : (input as Request).url;
      this.method = init?.method ?? "GET";
    }
  };
}
if (typeof globalThis.Response === "undefined") {
  (globalThis as unknown as { Response: unknown }).Response = class Response {};
}
if (typeof globalThis.fetch === "undefined") {
  (globalThis as unknown as { fetch: unknown }).fetch = jest.fn(() =>
    Promise.reject(new Error("fetch is not available in tests; mock the API"))
  );
}
