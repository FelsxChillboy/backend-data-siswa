-- Data contoh. Aman dijalankan ulang.
INSERT INTO siswa (kode_siswa, nama_siswa, alamat_siswa, tgl_lahir_siswa, jurusan_siswa)
VALUES
    ('SIS-001', 'Ahmad Azarruddin', 'Jl. Merdeka No. 12, Bandung', '2005-01-30', 'Teknik Informatika'),
    ('SIS-002', 'Siti Nurhaliza', 'Jl. Cendana No. 8, Jakarta', '2004-07-14', 'Manajemen'),
    ('SIS-003', 'Budi Santoso', 'Jl. Melati No. 21, Surabaya', '2006-03-05', 'Teknik Elektro')
ON CONFLICT (kode_siswa) DO NOTHING;
