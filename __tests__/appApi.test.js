jest.mock("../src/utils/api", () => ({
  APP_API_BASE_URL: "https://agrisence-backend.onrender.com/api",
}));

const { getResolvedAppApiBaseUrl } = require("../src/utils/appApi");

describe("getResolvedAppApiBaseUrl", () => {
  it("ensures /api suffix on community base URL", () => {
    const url = getResolvedAppApiBaseUrl();
    expect(url.endsWith("/api")).toBe(true);
    expect(url).toMatch(/^https?:\/\//);
  });
});
