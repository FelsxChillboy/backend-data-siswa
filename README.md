# Backend Data Siswa

REST API untuk proses **CRUD Data Siswa** menggunakan Express.js 5, Sequelize, dan PostgreSQL 18. Dirancang sebagai backend untuk aplikasi frontend React di repository terpisah.

## Teknologi

| Komponen | Versi |
| --- | --- |
| Node.js | 24 LTS terbaru |
| Express | 5.x |
| PostgreSQL | 18 |
| Sequelize (`dialect: postgres`) | 6.x |
| `pg` (node-postgres) | 8.x |
| express-validator | 7.x |
| dotenv, cors, morgan, nodemon | versi stabil terbaru |

## Struktur Folder

```
backend/
├── src/
│   ├── config/database.js          # instance Sequelize + koneksi PostgreSQL
│   ├── models/Siswa.js             # class model Sequelize (tabel siswa)
│   ├── controllers/SiswaController.js  # logika CRUD (class-based)
│   ├── routes/siswaRoutes.js       # pemetaan endpoint
│   ├── middlewares/
│   │   ├── validateSiswa.js        # validasi body request
│   │   └── errorHandler.js         # ApiError, 404, error terpusat
│   └── app.js                      # konfigurasi Express
├── sql/
│   ├── 01-create-database.sql
│   ├── 02-create-table.sql
│   └── 03-seed.sql
├── tests/                          # test node:test (validasi, error, API)
├── server.js                       # entry point: authenticate DB + listen
├── .env.example
└── package.json
```

## Instalasi

```bash
cd backend
npm install
cp .env.example .env      # Windows: salin file dan ubah namanya menjadi .env
```

Isi `.env`:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password_postgres_anda
DB_NAME=db_siswa
CORS_ORIGIN=http://localhost:5173
```

## Membuat Database dan Tabel

### Opsi A — DBeaver (disarankan untuk inspeksi visual)

1. Buka DBeaver → **New Database Connection** → PostgreSQL → isi host `localhost`, port `5432`, database `postgres`, user `postgres`, password sesuai instalasi Anda → **Test Connection** → **Finish**.
2. Buka editor SQL pada koneksi tersebut, jalankan isi `sql/01-create-database.sql` (`CREATE DATABASE db_siswa;`), lalu **Refresh** pada panel Database Navigator.
3. Buat koneksi baru yang menunjuk ke database `db_siswa`, jalankan `sql/02-create-table.sql`.
4. Jalankan `sql/03-seed.sql` untuk data contoh.
5. Verifikasi: jalankan `SELECT * FROM siswa;` di DBeaver; harus terlihat 3 baris contoh beserta `created_at` dan `updated_at`.

### Opsi B — psql

```powershell
$env:PGPASSWORD="password_postgres_anda"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -f sql\01-create-database.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d db_siswa -f sql\02-create-table.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -h localhost -d db_siswa -f sql\03-seed.sql
```

Skema tabel:

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `kode_siswa` | VARCHAR(50) | PRIMARY KEY, unik |
| `nama_siswa` | VARCHAR(150) | NOT NULL |
| `alamat_siswa` | TEXT | NOT NULL |
| `tgl_lahir_siswa` | DATE | NOT NULL, format `YYYY-MM-DD` |
| `jurusan_siswa` | VARCHAR(100) | NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() + trigger UPDATE |

## Menjalankan Server

```bash
npm run dev     # nodemon (development)
npm start       # node biasa (production)
npm test        # node:test
```

Health check: `GET http://localhost:5000/api/health`.

## Format Respons

Semua respons — sukses maupun gagal — memakai:

```json
{ "success": true, "message": "Pesan", "data": {} }
```

## Endpoint API

### `GET /api/siswa`

Query opsional: `search` (kode/nama/jurusan, case-insensitive), `page` (default 1), `limit` (default 10, maks 100).

Request:

```
GET http://localhost:5000/api/siswa?search=Ahmad&page=1&limit=10
```

Response `200`:

```json
{
  "success": true,
  "message": "Data siswa berhasil diambil",
  "data": {
    "items": [
      {
        "kode_siswa": "SIS-001",
        "nama_siswa": "Ahmad Azarruddin",
        "alamat_siswa": "Jl. Merdeka No. 12, Bandung",
        "tgl_lahir_siswa": "2005-01-30",
        "jurusan_siswa": "Teknik Informatika",
        "created_at": "2026-11-18T02:10:00.000Z",
        "updated_at": "2026-11-18T02:10:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### `GET /api/siswa/:kode`

Response `200`:

```json
{
  "success": true,
  "message": "Detail siswa berhasil diambil",
  "data": { "kode_siswa": "SIS-001", "nama_siswa": "Ahmad Azarruddin" }
}
```

Jika tidak ada → `404`:

```json
{ "success": false, "message": "Siswa tidak ditemukan", "data": null }
```

### `POST /api/siswa`

Body:

```json
{
  "kode_siswa": "SIS-004",
  "nama_siswa": "Dewi Anggraini",
  "alamat_siswa": "Jl. Sudirman No. 5",
  "tgl_lahir_siswa": "2005-08-12",
  "jurusan_siswa": "Teknik Informatika"
}
```

Response `201`: `{ "success": true, "message": "Data siswa berhasil ditambahkan", "data": { ... } }`

Validasi gagal → `400` dengan `data` berisi array error express-validator. Kode duplikat → `409`.

### `PUT /api/siswa/:kode`

Body sama seperti POST, kecuali `kode_siswa` tidak diubah (identifier bersifat immutable). Response `200` dengan pesan `Data siswa berhasil diperbarui`.

### `DELETE /api/siswa/:kode`

Response `200`:

```json
{
  "success": true,
  "message": "Data siswa berhasil dihapus",
  "data": { "kode_siswa": "SIS-004" }
}
```

## Alur Kerja CRUD

`HTTP request → siswaRoutes → validateSiswa (POST/PUT) → SiswaController (class) → model Sequelize → tabel siswa → response {success, message, data}`. Kesalahan dilempar sebagai `ApiError` atau error Sequelize dan ditangani satu kali oleh `errorHandler`; Express 5 meneruskan promise yang reject secara otomatis.

## Catatan

- CORS dikonfigurasi lewat `CORS_ORIGIN` (pisahkan beberapa origin dengan koma). Kosongkan untuk mengizinkan semua origin.
- `kode_siswa` sengaja tidak dapat diubah saat edit agar relasi dan riwayat tetap konsisten.
- Untuk verifikasi visual, gunakan DBeaver: jalankan `SELECT * FROM siswa ORDER BY kode_siswa;` sebelum dan sesudah menguji endpoint.
