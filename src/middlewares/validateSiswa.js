import { body, validationResult } from 'express-validator';

import { ApiError } from './errorHandler.js';

const kodeField = () =>
  body('kode_siswa')
    .isString()
    .withMessage('Kode siswa harus berupa teks')
    .trim()
    .notEmpty()
    .withMessage('Kode siswa wajib diisi')
    .matches(/^[A-Za-z0-9._-]+$/)
    .withMessage('Kode siswa hanya boleh huruf, angka, titik, garis bawah, dan tanda hubung')
    .isLength({ max: 50 })
    .withMessage('Kode siswa maksimal 50 karakter');

const textField = (field, label, max) =>
  body(field)
    .isString()
    .withMessage(`${label} harus berupa teks`)
    .trim()
    .notEmpty()
    .withMessage(`${label} wajib diisi`)
    .isLength({ max })
    .withMessage(`${label} maksimal ${max} karakter`);

const tanggalField = () =>
  body('tgl_lahir_siswa')
    .isString()
    .withMessage('Tanggal lahir harus berupa teks')
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Tanggal lahir harus berformat YYYY-MM-DD')
    .custom((value) => {
      const text = String(value ?? '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        throw new Error('Tanggal lahir harus berformat YYYY-MM-DD');
      }
      const date = new Date(`${text}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
        throw new Error('Tanggal lahir tidak valid');
      }
      return true;
    });

const handleValidation = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  next(new ApiError(400, 'Validasi gagal', result.array()));
};

export const validateCreateSiswa = [
  kodeField(),
  textField('nama_siswa', 'Nama siswa', 150),
  textField('alamat_siswa', 'Alamat siswa', 5000),
  tanggalField(),
  textField('jurusan_siswa', 'Jurusan siswa', 100),
  handleValidation,
];

export const validateUpdateSiswa = [
  textField('nama_siswa', 'Nama siswa', 150),
  textField('alamat_siswa', 'Alamat siswa', 5000),
  tanggalField(),
  textField('jurusan_siswa', 'Jurusan siswa', 100),
  handleValidation,
];
