import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { db } from '../src/config/database.js';

let server;
let baseUrl;
let adminAccessToken;
let adminRefreshToken;
let editorAccessToken;
let editorRefreshToken;
let testAuthorId;
let testStoryId;

test.before(async () => {
  // Start ephemeral server
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) server.close();
  await db.destroy();
});

test('1. Health check returns 200 OK and connected database', async () => {
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/health`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, 'ok');
  assert.equal(json.database, 'connected');
});

test('2. Admin logs in with seeded account (POST /auth/login)', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'Admin@12345'
    })
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.accessToken);
  assert.ok(json.data.refreshToken);
  assert.equal(json.data.user.role, 'admin');

  adminAccessToken = json.data.accessToken;
  adminRefreshToken = json.data.refreshToken;
});

test('3. Invalid login returns 401 Unauthorized', async () => {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'WrongPassword99'
    })
  });
  assert.equal(res.status, 401);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.equal(json.error.code, 'INVALID_CREDENTIALS');
});

test('4. Refresh-token rotation works and revokes old token', async () => {
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: adminRefreshToken })
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.data.accessToken);
  assert.ok(json.data.refreshToken);

  const newAdminRefreshToken = json.data.refreshToken;
  adminAccessToken = json.data.accessToken;

  // Reusing the old token must fail with 401
  const reuseRes = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: adminRefreshToken })
  });
  assert.equal(reuseRes.status, 401);
  const reuseJson = await reuseRes.json();
  assert.equal(reuseJson.error.code, 'TOKEN_REVOKED');

  adminRefreshToken = newAdminRefreshToken;
});

test('5. Admin creates an Editor account (POST /users)', async () => {
  const res = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: JSON.stringify({
      name: 'ರಾಘವೇಂದ್ರ (Raghavendra Editor)',
      email: `editor_${Date.now()}@example.com`,
      password: 'Editor@12345',
      role: 'editor'
    })
  });
  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.role, 'editor');

  // Log in as Editor
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: json.data.email,
      password: 'Editor@12345'
    })
  });
  assert.equal(loginRes.status, 200);
  const loginJson = await loginRes.json();
  editorAccessToken = loginJson.data.accessToken;
  editorRefreshToken = loginJson.data.refreshToken;
});

test('6. Editor cannot access /users (403 Forbidden)', async () => {
  const res = await fetch(`${baseUrl}/users`, {
    headers: { 'Authorization': `Bearer ${editorAccessToken}` }
  });
  assert.equal(res.status, 403);
  const json = await res.json();
  assert.equal(json.error.code, 'FORBIDDEN');
});

test('7. Author created with Kannada Unicode and retrieved without corruption', async () => {
  const authorData = {
    name_kn: 'ಗೊರೂರು ರಾಮಸ್ವಾಮಿ ಅಯ್ಯಂಗಾರ್',
    name_en: 'Goruru Ramaswamy Iyengar',
    bio: 'ಕನ್ನಡದ ಖ್ಯಾತ ಹಾಸ್ಯ ಸಾಹಿತಿ ಮತ್ತು ಗಾಂಧಿವಾದಿ.',
    birth_year: 1904,
    death_year: 1991,
    place: 'ಗೊರೂರು, ಹಾಸನ'
  };

  const res = await fetch(`${baseUrl}/authors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${editorAccessToken}`
    },
    body: JSON.stringify(authorData)
  });
  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.data.name_kn, authorData.name_kn);
  testAuthorId = json.data.id;

  // Retrieve and verify Unicode fidelity
  const getRes = await fetch(`${baseUrl}/authors/${testAuthorId}`, {
    headers: { 'Authorization': `Bearer ${editorAccessToken}` }
  });
  assert.equal(getRes.status, 200);
  const getJson = await getRes.json();
  assert.equal(getJson.data.name_kn, 'ಗೊರೂರು ರಾಮಸ್ವಾಮಿ ಅಯ್ಯಂಗಾರ್');
  assert.equal(getJson.data.story_count, 0);
});

test('8. Story cannot be created with invalid author_id (400)', async () => {
  const res = await fetch(`${baseUrl}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${editorAccessToken}`
    },
    body: JSON.stringify({
      author_id: 999999,
      title_kn: 'ತಪ್ಪು ಕಥೆ',
      content_type: 'text',
      content_text: 'ಕೆಲವು ಪಠ್ಯ'
    })
  });
  assert.equal(res.status, 400);
});

test('9. Story created with text and references, verified on detail endpoint', async () => {
  const storyData = {
    author_id: testAuthorId,
    title_kn: 'ನಮ್ಮ ಊರಿನ ರಸಿಕರು',
    title_en: 'Namma Oorina Rasikaru',
    genre: 'ಹಾಸ್ಯ / ಲಲಿತ ಪ್ರಬಂಧ',
    published_year: 1932,
    summary: 'ಗೊರೂರರ ಪ್ರಸಿದ್ಧ ಗ್ರಾಮೀಣ ಹಾಸ್ಯ ಕೃತಿ.',
    content_type: 'text',
    content_text: 'ಹೇಮಾವತಿ ನದಿಯ ದಂಡೆಯ ಮೇಲಿನ ಹಳ್ಳಿಯ ಮುಗ್ಧ ಜನರ ದಿನಚರಿ, ಅವರ ಮಾತುಕತೆಗಳು ಮತ್ತು ಜೀವನದ ಹಾಸ್ಯ ಪ್ರಸಂಗಗಳು ಇಲ್ಲಿವೆ...',
    status: 'published',
    references: [
      { name: 'ಕೃತಿ ಪರಿಚಯ ಲೇಖನ', url: 'https://kannadasahithya.org/goruru' },
      { name: 'ಪ್ರಜಾವಾಣಿ ವಿಮರ್ಶೆ', url: 'https://prajavani.net/literature/goruru-review' }
    ]
  };

  const res = await fetch(`${baseUrl}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${editorAccessToken}`
    },
    body: JSON.stringify(storyData)
  });
  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.data.title_kn, storyData.title_kn);
  assert.equal(json.data.author.name_kn, 'ಗೊರೂರು ರಾಮಸ್ವಾಮಿ ಅಯ್ಯಂಗಾರ್');
  assert.equal(json.data.references.length, 2);
  testStoryId = json.data.id;
});

test('10. Updating story replaces references array atomically', async () => {
  const updateData = {
    references: [
      { name: 'ನೂತನ ಉಲ್ಲೇಖ ಮಾತ್ರ', url: 'https://example.com/new-ref' }
    ]
  };

  const res = await fetch(`${baseUrl}/stories/${testStoryId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${editorAccessToken}`
    },
    body: JSON.stringify(updateData)
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.data.references.length, 1);
  assert.equal(json.data.references[0].name, 'ನೂತನ ಉಲ್ಲೇಖ ಮಾತ್ರ');
});

test('11. Author with active stories cannot be deleted (409 Conflict)', async () => {
  const res = await fetch(`${baseUrl}/authors/${testAuthorId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminAccessToken}` }
  });
  assert.equal(res.status, 409);
  const json = await res.json();
  assert.equal(json.error.code, 'CONFLICT');
});

test('12. Editor cannot delete stories or authors (403 Forbidden)', async () => {
  const resStory = await fetch(`${baseUrl}/stories/${testStoryId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${editorAccessToken}` }
  });
  assert.equal(resStory.status, 403);

  const resAuthor = await fetch(`${baseUrl}/authors/${testAuthorId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${editorAccessToken}` }
  });
  assert.equal(resAuthor.status, 403);
});

test('13. Admin can soft-delete story, story disappears from lists', async () => {
  const res = await fetch(`${baseUrl}/stories/${testStoryId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminAccessToken}` }
  });
  assert.equal(res.status, 200);

  // Get must return 404
  const getRes = await fetch(`${baseUrl}/stories/${testStoryId}`, {
    headers: { 'Authorization': `Bearer ${adminAccessToken}` }
  });
  assert.equal(getRes.status, 404);
});

test('14. Now author with no active stories can be deleted by Admin', async () => {
  const res = await fetch(`${baseUrl}/authors/${testAuthorId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminAccessToken}` }
  });
  assert.equal(res.status, 200);

  // Author get must return 404
  const getRes = await fetch(`${baseUrl}/authors/${testAuthorId}`, {
    headers: { 'Authorization': `Bearer ${adminAccessToken}` }
  });
  assert.equal(getRes.status, 404);
});
