-- Jalankan di database db_siswa (lewat DBeaver atau psql -d db_siswa).
CREATE TABLE IF NOT EXISTS siswa (
    kode_siswa      VARCHAR(50) PRIMARY KEY,
    nama_siswa      VARCHAR(150) NOT NULL,
    alamat_siswa    TEXT NOT NULL,
    tgl_lahir_siswa DATE NOT NULL,
    jurusan_siswa   VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_siswa_nama_siswa ON siswa (nama_siswa);

-- Menjaga updated_at tetap otomatis juga untuk UPDATE langsung dari DBeaver.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS siswa_set_updated_at ON siswa;
CREATE TRIGGER siswa_set_updated_at
    BEFORE UPDATE ON siswa
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
