import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { db } from '../src/config/database.js';

let server;
let baseUrl;
let adminAccessToken;
let authorId;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api/v1`;
      resolve();
    });
  });

  // Login admin
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'Admin@12345'
    })
  });
  const json = await res.json();
  adminAccessToken = json.data.accessToken;

  // Create test author
  const authorRes = await fetch(`${baseUrl}/authors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: JSON.stringify({
      name_kn: 'ಪರೀಕ್ಷಾ ಲೇಖಕ',
      name_en: 'Test Author Uploads'
    })
  });
  const authorJson = await authorRes.json();
  authorId = authorJson.data.id;
});

test.after(async () => {
  if (server) server.close();
  await db.destroy();
});

test('Uploads 1. Valid JPEG photo upload succeeds with magic bytes', async () => {
  // Valid JPEG header: FF D8 FF E0
  const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);

  const formData = new FormData();
  formData.append('photo', new Blob([validJpeg], { type: 'image/jpeg' }), 'author.jpg');

  const res = await fetch(`${baseUrl}/authors/${authorId}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: formData
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.photo_url);
  assert.ok(json.data.photo_key);
});

test('Uploads 2. Fake image with wrong magic bytes is rejected (415)', async () => {
  // Fake text file disguised as JPEG
  const fakeJpeg = Buffer.from('This is not a real jpeg file');

  const formData = new FormData();
  formData.append('photo', new Blob([fakeJpeg], { type: 'image/jpeg' }), 'fake.jpg');

  const res = await fetch(`${baseUrl}/authors/${authorId}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: formData
  });

  assert.equal(res.status, 415);
  const json = await res.json();
  assert.equal(json.error.code, 'UNSUPPORTED_MEDIA_TYPE');
});

test('Uploads 3. Valid PDF story upload succeeds with %PDF magic bytes', async () => {
  // Valid PDF header: %PDF-1.4
  const validPdf = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

  const formData = new FormData();
  formData.append('author_id', String(authorId));
  formData.append('title_kn', 'ಪಿಡಿಎಫ್ ಕಥೆ');
  formData.append('content_type', 'pdf');
  formData.append('pdf', new Blob([validPdf], { type: 'application/pdf' }), 'story.pdf');

  const res = await fetch(`${baseUrl}/stories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: formData
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.equal(json.data.content_type, 'pdf');
  assert.ok(json.data.pdf_url);
  assert.ok(json.data.pdf_url.endsWith('.pdf'));
});

test('Uploads 4. Valid DOCX book upload succeeds with ZIP PK magic bytes', async () => {
  // Valid ZIP header for DOCX: PK\x03\x04
  const validDocx = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

  const formData = new FormData();
  formData.append('author_id', String(authorId));
  formData.append('title_kn', 'ಡಾಕ್ಸ್ ಕಥಾ ಪುಸ್ತಕ');
  formData.append('content_type', 'pdf');
  formData.append('file', new Blob([validDocx], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), 'novel.docx');

  const res = await fetch(`${baseUrl}/stories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: formData
  });

  assert.equal(res.status, 201);
  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(json.data.pdf_url);
  assert.ok(json.data.pdf_url.endsWith('.docx'));
});

test('Uploads 5. Image (JPEG) uploaded as story file is strictly rejected (415)', async () => {
  const validJpeg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);

  const formData = new FormData();
  formData.append('author_id', String(authorId));
  formData.append('title_kn', 'ಚಿತ್ರ ಕಥೆಯಲ್ಲ');
  formData.append('content_type', 'pdf');
  formData.append('file', new Blob([validJpeg], { type: 'image/jpeg' }), 'picture.jpg');

  const res = await fetch(`${baseUrl}/stories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: formData
  });

  assert.equal(res.status, 415);
  const json = await res.json();
  assert.equal(json.error.code, 'UNSUPPORTED_MEDIA_TYPE');
});

test('Uploads 6. Multiple files uploaded to story is rejected (single file only)', async () => {
  const validPdf1 = Buffer.from('%PDF-1.4\n%EOF');
  const validPdf2 = Buffer.from('%PDF-1.4\n%EOF');

  const formData = new FormData();
  formData.append('author_id', String(authorId));
  formData.append('title_kn', 'ಎರಡು ಕಡತಗಳು');
  formData.append('content_type', 'pdf');
  formData.append('file', new Blob([validPdf1], { type: 'application/pdf' }), 'one.pdf');
  formData.append('pdf', new Blob([validPdf2], { type: 'application/pdf' }), 'two.pdf');

  const res = await fetch(`${baseUrl}/stories`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminAccessToken}`
    },
    body: formData
  });

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.error.code, 'VALIDATION_ERROR');
});

