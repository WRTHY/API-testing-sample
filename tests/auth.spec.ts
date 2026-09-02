import { test, expect } from '@playwright/test';

/**
 * AUTH ENDPOINTS — register & login
 *
 * These are the endpoints most worth knowing cold for an interview: they're
 * where "does the API return 200 on success and a meaningful 4xx on bad
 * input" actually gets tested. Note reqres.in is a fake/mock API, so it
 * doesn't really validate credentials — it validates *presence* of fields.
 * That distinction (mock vs. real backend) is worth being able to explain
 * out loud: it's exactly why these tests assert on status + shape, not on
 * "this password actually works," which a real API test suite would need
 * to do against a real backend.
 */

test.describe('POST /register', () => {
  test('register - valid email and password - returns 200 with id and token', async ({ request }) => {
    const response = await request.post('register', {
      data: { email: 'eve.holt@reqres.in', password: 'pistol' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('token');
  });

  test('register - missing password - returns 400 with error message (negative case)', async ({
    request,
  }) => {
    const response = await request.post('register', {
      data: { email: 'sydney@fife' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
  });
});

test.describe('POST /login', () => {
  test('login - valid email and password - returns 200 with token', async ({ request }) => {
    const response = await request.post('login', {
      data: { email: 'eve.holt@reqres.in', password: 'pistol' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
  });

  test('login - missing password - returns 400 with error message (negative case)', async ({
    request,
  }) => {
    const response = await request.post('login', {
      data: { email: 'peter@klaven' },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);

    // Deliberately NOT asserting the exact error string here. reqres owns
    // that copy, not us — asserting on presence + shape instead of exact
    // text is what keeps this test from breaking the next time they tweak
    // a message. This is a real design decision, and a good one to be able
    // to explain: what should a test lock down vs. leave loose?
  });
});
