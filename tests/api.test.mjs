import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import app from '../src/app.js';
import sequelize from '../src/config/database.js';

let server;
let baseUrl;
const kode = `TST-${Date.now()}`;

const payload = {
  kode_siswa: kode,
  nama_siswa: 'Siswa Uji Integrasi',
  alamat_siswa: 'Jalan Test No. 1',
  tgl_lahir_siswa: '2005-05-20',
  jurusan_siswa: 'Teknik Informatika',
};

const request = async (path, options = {}) => {
  const response = await fetch(baseUrl + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await response.json();
  return { response, body };
};

before(async () => {
  await sequelize.authenticate();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
});

test('GET /api/siswa mengembalikan data.items dan metadata pagination', async () => {
  const { response, body } = await request('/api/siswa');

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data.items));
  assert.equal(typeof body.data.total, 'number');
  assert.equal(body.data.page, 1);
  assert.equal(body.data.limit, 10);
});

test('POST /api/siswa menyimpan data baru', async () => {
  const { response, body } = await request('/api/siswa', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.kode_siswa, kode);
});

test('POST /api/siswa dengan kode duplikat mengembalikan 409', async () => {
  const { response, body } = await request('/api/siswa', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  assert.equal(response.status, 409);
  assert.equal(body.success, false);
});

test('GET /api/siswa/:kode mengembalikan detail siswa', async () => {
  const { response, body } = await request(`/api/siswa/${kode}`);

  assert.equal(response.status, 200);
  assert.equal(body.data.nama_siswa, payload.nama_siswa);
});

test('GET /api/siswa/:kode untuk kode tidak ada mengembalikan 404', async () => {
  const { response, body } = await request('/api/siswa/KODE-TIDAK-ADA');

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
});

test('PUT /api/siswa/:kode mengubah data tanpa mengubah kode', async () => {
  const { response, body } = await request(`/api/siswa/${kode}`, {
    method: 'PUT',
    body: JSON.stringify({ ...payload, nama_siswa: 'Siswa Uji Update' }),
  });

  assert.equal(response.status, 200);
  assert.equal(body.data.nama_siswa, 'Siswa Uji Update');
  assert.equal(body.data.kode_siswa, kode);
});

test('GET /api/siswa?search=&page=&limit= membatasi hasil', async () => {
  const { response, body } = await request(
    '/api/siswa?search=Siswa%20Uji&page=1&limit=1',
  );

  assert.equal(response.status, 200);
  assert.ok(body.data.items.length <= 1);
  assert.equal(body.data.limit, 1);
});

test('GET /api/siswa?page=abc&limit=abc memakai nilai bawaan', async () => {
  const { response, body } = await request('/api/siswa?page=abc&limit=abc');

  assert.equal(response.status, 200);
  assert.equal(body.data.page, 1);
  assert.equal(body.data.limit, 10);
});

test('GET /api/siswa?search=% mencocokkan tanda persen literal, bukan semua baris', async () => {
  const literalKode = `LIT-${Date.now()}`;
  const literal = {
    kode_siswa: literalKode,
    nama_siswa: 'Siswa 100% Lulus',
    alamat_siswa: 'Jalan Literal No. 1',
    tgl_lahir_siswa: '2005-05-20',
    jurusan_siswa: 'Teknik Informatika',
  };

  const created = await request('/api/siswa', {
    method: 'POST',
    body: JSON.stringify(literal),
  });
  assert.equal(created.response.status, 201);

  try {
    const { response, body } = await request(
      `/api/siswa?search=${encodeURIComponent('%')}`,
    );

    assert.equal(response.status, 200);
    assert.equal(body.data.total, 1);
    assert.deepEqual(
      body.data.items.map((item) => item.kode_siswa),
      [literalKode],
    );
  } finally {
    await request(`/api/siswa/${literalKode}`, { method: 'DELETE' });
  }
});

test('GET /api/siswa?page=999999999999999999999 tidak menyebabkan 500', async () => {
  const { response, body } = await request(
    '/api/siswa?page=999999999999999999999&limit=1',
  );

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
});

test('DELETE /api/siswa/:kode menghapus data', async () => {
  const deleted = await request(`/api/siswa/${kode}`, { method: 'DELETE' });

  assert.equal(deleted.response.status, 200);
  assert.equal(deleted.body.success, true);

  const detail = await request(`/api/siswa/${kode}`);
  assert.equal(detail.response.status, 404);
});

test('URL tidak ditemukan ditangani notFoundHandler', async () => {
  const { response, body } = await request('/api/tidak-ada');

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
});
