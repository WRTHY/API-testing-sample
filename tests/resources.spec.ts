import { test, expect } from "@playwright/test";

test.describe("GET /unknown (list resources)", () => {
  test("default page - returns 200 with paginated shape", async ({
    request,
  }) => {
    const start = Date.now(); // for validating response time
    const response = await request.get("unknown");
    const responseTime = Date.now() - start;

    // validate status code before anything else - nothing else matters if status is incorrect
    expect(response.status()).toBe(200);

    const body = await response.json();
    const firstResource = body.data[0];

    // validate page structure and data array
    expect(body.page).toBe(1);
    expect(body).toHaveProperty("total_pages");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // validate schema of response
    expect(Object.keys(firstResource).sort()).toEqual(
      ["id", "name", "year", "color", "pantone_value"].sort(),
    );

    // validate response time
    expect(responseTime).toBeLessThan(500);
  });
});
