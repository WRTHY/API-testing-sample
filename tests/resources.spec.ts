import { test, expect } from "@playwright/test";

const endpointUnderTest = "unknown";

test.describe("GET /unknown (list resources)", () => {
  test("default page - returns 200 with paginated shape", async ({
    request,
  }) => {
    const start = Date.now(); // for validating response time
    const response = await request.get(endpointUnderTest);
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

  test("page outside of number of pages (page=9999) - returns 200 with paginated shape", async ({
    request,
  }) => {
    const start = Date.now(); // for validating response time
    const response = await request.get(`${endpointUnderTest}?page=9999`);
    const responseTime = Date.now() - start;

    // validate status code
    expect(response.status()).toBe(200);

    // validate that the returned array is empty
    const body = await response.json();
    expect(body.page).toBe(9999);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toEqual(0);

    // validate response time
    expect(responseTime).toBeLessThan(500);
  });

  test("page before first page (page=0) defaults to page 1 - returns 200 with page 1 information in the body", async ({
    request,
  }) => {
    const start = Date.now();
    const response = await request.get(`${endpointUnderTest}$page=0`);
    const responseTime = Date.now() - start;

    // validate status code
    expect(response.status()).toBe(200);

    const body = await response.json();

    // validate the response defaults to page 1
    expect(body.page).toBe(1);
    expect(body).toHaveProperty("total_pages");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // validate response time
    expect(responseTime).toBeLessThan(500);
  });
});

test.describe("GET /unknown single resource", () => {
  test("lookup with existing id - returns 200 with specified resource information", async ({
    request,
  }) => {
    const start = Date.now();
    const response = await request.get(`${endpointUnderTest}/2`);
    const responseTime = Date.now() - start;

    // validate status code
    expect(response.status()).toBe(200);

    const body = await response.json();
    const entry = body.data;

    // validate schema
    expect(Object.keys(entry).sort()).toEqual(
      ["id", "name", "year", "color", "pantone_value"].sort(),
    );

    // validate that the correct information is being returned
    expect(entry.name).toEqual("fuchsia rose");
    expect(entry.color).toEqual("#C74375");

    // validate response time
    expect(responseTime).toBeLessThan(500);
  });

  test("lookup with incorrect id - returns 404 with an empty body", async ({
    request,
  }) => {
    const start = Date.now();
    const response = await request.get(`${endpointUnderTest}/23`);
    const responseTime = Date.now() - start;

    // validate status code
    expect(response.status()).toBe(404);

    const body = await response.json();

    // validate schema
    expect(body).toEqual({});

    // validate response time
    expect(responseTime).toBeLessThan(500);
  });
});
