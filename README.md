# API Testing Practice - reqres.in

A hands-on project for practicing API testing: first manually in Postman, then automated with Playwright + TypeScript and run in CI on GitHub Actions.

Target API: [reqres.in](https://reqres.in) - a free, no-signup-required fake REST API that's stable enough to script against.

## Why this project exists

Built as a refresher after struggling with some API testing questions in an interview.

## What's in here

```
postman/
  reqres-api-collection.json          # Manual test collection (import into Postman)
  reqres-environment.postman_environment.json
tests/
  users.spec.ts                       # Automated: list/get/create/update/delete users
  auth.spec.ts                        # Automated: register/login, success + negative cases
playwright.config.ts
.github/workflows/api-tests.yml       # Runs the suite on every push/PR
```

## API testing refresher - the checklist

For any endpoint, walk through these in order. This is the mental checklist to narrate in an interview:

1. **Happy path** - valid request, expected status code, expected response shape.
2. **Status code correctness** - not just "did it return something," but the *right* code: 200 vs 201 vs 204, 400 vs 404 vs 401 vs 403 vs 422 vs 500. Mixing these up is a common tell that someone hasn't tested APIs seriously.
3. **Response schema / contract** - field names, types, required vs optional fields. A 200 with a malformed body is still a bug.
4. **Negative cases** - missing required fields, wrong types, invalid IDs, malformed JSON. Does it fail *gracefully* (a clean 4xx with a useful message) or fail *badly* (500, stack trace, hang)?
5. **Boundary / edge cases** - empty lists, pagination past the last page, max-length strings, zero/negative numbers, empty strings vs missing fields.
6. **Auth & authorization** - no token, expired token, wrong token, token for the wrong user/role (authentication: who are you; authorization: what are you allowed to do - these are different bugs).
7. **Idempotency** - does calling PUT/DELETE twice in a row behave safely the second time? (GET/PUT/DELETE should be idempotent; POST generally isn't.)
8. **Headers** - Content-Type on requests, correct Content-Type in responses, caching/rate-limit headers if the API sets them.
9. **Data integrity across calls** - create a resource, then GET it back and confirm it actually persisted correctly (not relevant against reqres, which doesn't really persist - but a real API test suite should do this).
10. **Performance sanity checks** - is a simple GET taking 3+ seconds? Not a load test, just a smell test.

## Manual testing walkthrough (Postman)

1. Install Postman (desktop app or the web version at postman.com).
2. Import `postman/reqres-api-collection.json` and `postman/reqres-environment.postman_environment.json`, and select the "reqres.in" environment in the top-right dropdown.
3. Open the **Users** folder and run **List users - page 2**. Click **Send**, then look at the **Test Results** tab (not just the response body) - that's where the `pm.test()` assertions written into each request show pass/fail.
4. Work through the rest of the folder in order: single user (found and not-found), create, PUT, PATCH, delete. For each one, before clicking Send, guess out loud what status code and body shape you expect - then check yourself against the Test Results tab.
5. Open the **Auth** folder and do the same for register/login, success and negative cases.
6. Once every request in the collection passes individually, select the collection and click **Run** (the Collection Runner) to execute the whole folder in sequence and see an aggregated pass/fail report - this is the manual equivalent of `npm test`.

This collection is deliberately the *same* test cases as the automated suite below, so you can see exactly what "automating a manual test" actually means in practice - it's not a different set of checks, it's the same checks with the human clicking removed.

## Automated testing (Playwright + TypeScript)

Playwright's `request` fixture is used as a plain HTTP client here - no browser involved. It plays the same role as Postman's Collection Runner, supertest, or RestAssured.

### Setup

```bash
npm install
```

(Optional) copy `.env.example` to `.env` if you want to set `REQRES_API_KEY` - reqres.in's classic demo endpoints used here don't require one, but it's wired up as an example of not hardcoding secrets into a suite.

### Run the tests

```bash
npm test              # headless run, list + HTML reporters
npm run test:ui       # Playwright's interactive UI mode - great for debugging one test at a time
npm run test:report   # open the last HTML report
```

### Reading a failure

Playwright's output tells you the file, the test name, and the exact assertion that failed with expected vs. actual values - that diff is usually most of the debugging. If a test fails intermittently against reqres.in, check whether it's a rate limit (free tier is IP-limited) before assuming your assertion is wrong - this is also a real point to make in interviews: not every red test is a code bug, and knowing how to tell the difference is part of the job.

## CI

`.github/workflows/api-tests.yml` runs the full suite on every push/PR to `main` and uploads the HTML report as a build artifact. No browser binaries need installing since this suite only uses Playwright's API request client.

## What to say about this in an interview

- "I test manually first in Postman to explore the API and lock down expected behavior, then port the same cases into an automated suite so they run on every change instead of relying on someone remembering to click through Postman."
- "I always test the negative and boundary cases, not just the happy path - that's usually where the real bugs and the real interview questions live."
- "I think about what a test should assert strictly (status codes, field presence/types) versus loosely (exact copy/error text I don't own) so the suite doesn't break every time someone tweaks a message."
- "The suite is wired into CI so a broken contract gets caught on the PR, not in production."

## Progress log

- [x] Manual Postman collection covering CRUD + auth, happy path + negative + boundary cases
- [x] Automated Playwright/TypeScript port of the same cases
- [x] GitHub Actions CI running the suite on push/PR
- [ ] Add response-schema validation with a JSON schema library (e.g. `ajv`) instead of field-by-field assertions
- [ ] Add a contract test against the OpenAPI spec if/when reqres.in publishes a stable one
- [ ] Try the same pattern against a second, less "toy" public API (e.g. one requiring real auth)
