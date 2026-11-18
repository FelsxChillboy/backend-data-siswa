import { Op } from 'sequelize';

import { ApiError } from '../middlewares/errorHandler.js';
import Siswa from '../models/Siswa.js';

const parsePagination = (query) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const requestedLimit =
    Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;

  return { page, limit: Math.min(requestedLimit, 100) };
};

const pickEditableFields = (body) => ({
  nama_siswa: body.nama_siswa,
  alamat_siswa: body.alamat_siswa,
  tgl_lahir_siswa: body.tgl_lahir_siswa,
  jurusan_siswa: body.jurusan_siswa,
});

class SiswaController {
  static async index(req, res) {
    const { page, limit } = parsePagination(req.query);
    const search =
      typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const where = search
      ? {
          [Op.or]: [
            { kode_siswa: { [Op.iLike]: `%${search}%` } },
            { nama_siswa: { [Op.iLike]: `%${search}%` } },
            { jurusan_siswa: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {};

    const { rows, count } = await Siswa.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['kode_siswa', 'ASC']],
    });

    res.status(200).json({
      success: true,
      message: 'Data siswa berhasil diambil',
      data: {
        items: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  }

  static async show(req, res) {
    const siswa = await Siswa.findByPk(req.params.kode);

    if (!siswa) {
      throw new ApiError(404, 'Siswa tidak ditemukan');
    }

    res.status(200).json({
      success: true,
      message: 'Detail siswa berhasil diambil',
      data: siswa,
    });
  }

  static async store(req, res) {
    const kodeSiswa = req.body.kode_siswa?.trim();

    if (await Siswa.findByPk(kodeSiswa)) {
      throw new ApiError(409, 'Kode siswa sudah terdaftar');
    }

    const siswa = await Siswa.create({
      kode_siswa: kodeSiswa,
      ...pickEditableFields(req.body),
    });

    res.status(201).json({
      success: true,
      message: 'Data siswa berhasil ditambahkan',
      data: siswa,
    });
  }

  static async update(req, res) {
    const siswa = await Siswa.findByPk(req.params.kode);

    if (!siswa) {
      throw new ApiError(404, 'Siswa tidak ditemukan');
    }

    await siswa.update(pickEditableFields(req.body));

    res.status(200).json({
      success: true,
      message: 'Data siswa berhasil diperbarui',
      data: siswa,
    });
  }

  static async destroy(req, res) {
    const siswa = await Siswa.findByPk(req.params.kode);

    if (!siswa) {
      throw new ApiError(404, 'Siswa tidak ditemukan');
    }

    await siswa.destroy();

    res.status(200).json({
      success: true,
      message: 'Data siswa berhasil dihapus',
      data: { kode_siswa: req.params.kode },
    });
  }
}

export default SiswaController;
