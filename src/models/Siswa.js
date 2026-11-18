import { DataTypes, Model } from 'sequelize';

import sequelize from '../config/database.js';

class Siswa extends Model {}

Siswa.init(
  {
    kode_siswa: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    nama_siswa: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    alamat_siswa: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tgl_lahir_siswa: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    jurusan_siswa: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Siswa',
    tableName: 'siswa',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  },
);

export default Siswa;
