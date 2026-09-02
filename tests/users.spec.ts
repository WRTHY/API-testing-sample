import { test, expect } from '@playwright/test';

/**
 * USERS RESOURCE — reqres.in classic demo API
 * https://reqres.in/api-docs
 *
 * This file is the automated version of the manual Postman checks in
 * postman/reqres-api-collection.json. Same test cases, same assertions —
 * just running as code instead of clicks, so they can run in CI on every
 * change instead of "whenever someone remembers to open Postman."
 *
 * Test naming follows a pattern worth using in interviews:
 *   <endpoint> - <scenario> - <expected outcome>
 */

test.describe('GET /users (list, pagination)', () => {
  test('list users - page 2 - returns 200 with paginated shape', async ({ request }) => {
    const response = await request.get('users?page=2');

    expect(response.status()).toBe(200);

    const body = await response.json();

    // Structural / schema assertions — don't just check status codes.
    // A 200 with the wrong shape is still a bug your consumers will hit.
    expect(body).toHaveProperty('page', 2);
    expect(body).toHaveProperty('total_pages');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Spot-check one record's shape rather than every field of every record.
    const firstUser = body.data[0];
    expect(firstUser).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        first_name: expect.any(String),
        last_name: expect.any(String),
        avatar: expect.stringContaining('https://'),
      }),
    );
  });

  test('list users - page far beyond total_pages - returns 200 with empty data (boundary case)', async ({
    request,
  }) => {
    // Boundary/edge testing: what happens past the last valid page?
    // This is the kind of case that's easy to skip manually and easy to
    // forget to re-check by hand after every change — a good automation
    // candidate.
    const response = await request.get('users?page=9999');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual([]);
  });
});

test.describe('GET /users/:id (single resource)', () => {
  test('get single user - existing id - returns 200 with matching record', async ({ request }) => {
    const response = await request.get('users/2');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.id).toBe(2);
    expect(body.data).toHaveProperty('email');
  });

  test('get single user - nonexistent id - returns 404 (negative case)', async ({ request }) => {
    // Negative testing: does the API fail *correctly*, not just fail?
    // A 500 here instead of a 404 would be a real bug to report.
    const response = await request.get('users/23');

    expect(response.status()).toBe(404);
  });
});

test.describe('POST /users (create)', () => {
  test('create user - valid payload - returns 201 with generated id', async ({ request }) => {
    const payload = { name: 'morpheus', job: 'leader' };
    const response = await request.post('users', { data: payload });

    expect(response.status()).toBe(201);
    const body = await response.json();

    // Assert the response echoes what we sent AND adds what the server owns.
    expect(body.name).toBe(payload.name);
    expect(body.job).toBe(payload.job);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('createdAt');
  });
});

test.describe('PUT /users/:id and PATCH /users/:id (update)', () => {
  test('update user - PUT full replace - returns 200 with updatedAt', async ({ request }) => {
    const payload = { name: 'morpheus', job: 'zion resident' };
    const response = await request.put('users/2', { data: payload });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.job).toBe(payload.job);
    expect(body).toHaveProperty('updatedAt');
  });

  test('update user - PATCH partial update - returns 200 with updatedAt', async ({ request }) => {
    // PUT vs PATCH is a classic interview question: PUT replaces the whole
    // resource, PATCH updates part of it. Same endpoint here, but worth
    // testing separately since a real API can (and should) behave
    // differently for each verb.
    const response = await request.patch('users/2', { data: { job: 'zion resident' } });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.job).toBe('zion resident');
    expect(body).toHaveProperty('updatedAt');
  });
});

test.describe('DELETE /users/:id', () => {
  test('delete user - existing id - returns 204 with no body', async ({ request }) => {
    const response = await request.delete('users/2');

    expect(response.status()).toBe(204);
    const body = await response.text();
    expect(body).toBe('');
  });
});
