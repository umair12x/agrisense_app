const { fetchWithRetry } = require("../src/utils/fetchWithRetry");

describe("fetchWithRetry", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns response on first successful fetch", async () => {
    const mockResponse = { ok: true, status: 200 };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await fetchWithRetry("https://example.com/health", {}, { retries: 0, timeoutMs: 5000 });
    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("throws a friendly message on timeout", async () => {
    global.fetch = jest.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        })
    );

    await expect(
      fetchWithRetry("https://example.com/slow", {}, { retries: 0, timeoutMs: 10 })
    ).rejects.toThrow(/slow to respond/i);
  });
});
