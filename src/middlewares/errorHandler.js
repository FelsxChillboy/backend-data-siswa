import { UniqueConstraintError, ValidationError } from 'sequelize';

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    data: null,
  });
};

export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || 'Terjadi kesalahan pada server';
  let data = err.details ?? null;

  if (err instanceof UniqueConstraintError) {
    status = 409;
    message = 'Kode siswa sudah terdaftar';
    data = err.errors?.map((item) => item.message) ?? null;
  } else if (err instanceof ValidationError) {
    status = 400;
    message = 'Data siswa tidak valid';
    data = err.errors?.map((item) => item.message) ?? null;
  } else if (err instanceof SyntaxError && 'body' in err && status === 400) {
    message = 'Format JSON tidak valid';
  }

  if (status >= 500) {
    console.error('[error]', err);
    message = 'Terjadi kesalahan pada server';
  }

  res.status(status).json({ success: false, message, data });
};
