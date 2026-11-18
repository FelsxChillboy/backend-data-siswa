import assert from 'node:assert/strict';
import express from 'express';
import test from 'node:test';

import { errorHandler } from '../src/middlewares/errorHandler.js';
import {
  validateCreateSiswa,
  validateUpdateSiswa,
} from '../src/middlewares/validateSiswa.js';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.post('/create', validateCreateSiswa, (req, res) => {
    res.status(201).json({ success: true, message: 'valid', data: req.body });
  });
  app.put('/update', validateUpdateSiswa, (req, res) => {
    res.status(200).json({ success: true, message: 'valid', data: req.body });
  });
  app.use(errorHandler);
  return app;
};

const withServer = async (callback) => {
  const app = buildApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  try {
    await callback(baseUrl);
  } finally {
    server.close();
  }
};

const validSiswa = {
  kode_siswa: 'SIS-001',
  nama_siswa: 'Ahmad Azarruddin',
  alamat_siswa: 'Jalan Merdeka No. 12',
  tgl_lahir_siswa: '2005-01-30',
  jurusan_siswa: 'Teknik Informatika',
};

const post = async (baseUrl, path, body, method = 'POST') =>
  fetch(baseUrl + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

test('validasi menolak nama_siswa kosong dengan 400', async () => {
  await withServer(async (baseUrl) => {
    const response = await post(baseUrl, '/create', {
      ...validSiswa,
      nama_siswa: '   ',
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.ok(Array.isArray(body.data));
  });
});

test('validasi menolak tanggal 2025-02-30', async () => {
  await withServer(async (baseUrl) => {
    const response = await post(baseUrl, '/create', {
      ...validSiswa,
      tgl_lahir_siswa: '2025-02-30',
    });

    assert.equal(response.status, 400);
  });
});

test('validasi menolak tanggal 30-01-2025', async () => {
  await withServer(async (baseUrl) => {
    const response = await post(baseUrl, '/create', {
      ...validSiswa,
      tgl_lahir_siswa: '30-01-2025',
    });

    assert.equal(response.status, 400);
  });
});

test('validasi menerima tanggal 2005-01-30 dan kode SIS-001', async () => {
  await withServer(async (baseUrl) => {
    const response = await post(baseUrl, '/create', validSiswa);
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.success, true);
    assert.equal(body.data.tgl_lahir_siswa, '2005-01-30');
  });
});

test('validasi update tidak mewajibkan kode_siswa di body', async () => {
  await withServer(async (baseUrl) => {
    const { kode_siswa, ...payload } = validSiswa;
    const response = await post(baseUrl, '/update', payload, 'PUT');

    assert.equal(response.status, 200);
  });
});
