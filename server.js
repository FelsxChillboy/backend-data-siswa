import 'dotenv/config';

import app from './src/app.js';
import sequelize from './src/config/database.js';

const port = Number(process.env.PORT) || 5000;

try {
  await sequelize.authenticate();
  console.log('Koneksi database PostgreSQL berhasil.');

  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
} catch (error) {
  console.error('Gagal memulai server:', error.message);
  process.exit(1);
}
