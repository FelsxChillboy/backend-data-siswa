import assert from 'node:assert/strict';
import test from 'node:test';

import { UniqueConstraintError, ValidationError } from 'sequelize';

import {
  ApiError,
  errorHandler,
  notFoundHandler,
} from '../src/middlewares/errorHandler.js';

const createResponse = () => ({
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.payload = payload;
    return this;
  },
});

test('errorHandler meneruskan status ApiError dan format respons konsisten', () => {
  const res = createResponse();

  errorHandler(new ApiError(404, 'Siswa tidak ditemukan'), {}, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.payload, {
    success: false,
    message: 'Siswa tidak ditemukan',
    data: null,
  });
});

test('errorHandler memetakan UniqueConstraintError ke 409', () => {
  const res = createResponse();
  const error = new UniqueConstraintError({ errors: [{ message: 'duplikat' }] });

  errorHandler(error, {}, res, () => {});

  assert.equal(res.statusCode, 409);
  assert.equal(res.payload.success, false);
});

test('errorHandler memetakan ValidationError ke 400', () => {
  const res = createResponse();
  const error = new ValidationError('tidak valid');

  errorHandler(error, {}, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.success, false);
});

test('notFoundHandler mengembalikan 404 dengan format konsisten', () => {
  const res = createResponse();

  notFoundHandler({ method: 'GET', originalUrl: '/api/tidak-ada' }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.payload.success, false);
});
