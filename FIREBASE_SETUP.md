# Setup Firebase untuk harga dan dashboard admin

## 1. Daftarkan aplikasi web

Di Firebase Console buka **Project settings → General → Your apps → Add app → Web**. Salin nilai konfigurasi Firebase ke `.env.local` pada root project. Anda bisa menyalin `.env.example` sebagai awal. Nilai konfigurasi web Firebase digunakan oleh browser; keamanan tulis tetap ditentukan oleh Authentication dan Firestore Rules.

```env
VITE_FIREBASE_API_KEY=nilai-dari-firebase
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=nilai-dari-firebase
VITE_FIREBASE_MESSAGING_SENDER_ID=nilai-dari-firebase
VITE_FIREBASE_APP_ID=nilai-dari-firebase
VITE_FIREBASE_ADMIN_UID=
```

Restart Vite setelah mengubah `.env.local`.

## 2. Aktifkan Google Authentication

Di **Authentication → Sign-in method**, aktifkan **Google**, pilih project support email, lalu simpan. Pastikan domain yang dipakai tercantum di **Authentication → Settings → Authorized domains**. `localhost` biasanya tersedia untuk pengembangan; tambahkan domain Netlify setelah deploy.

## 3. Ambil UID admin

Buka `http://localhost:5173/admin`, masuk dengan akun Google admin. Sebelum UID disetel, dashboard menampilkan UID akun yang login. Salin UID itu ke `VITE_FIREBASE_ADMIN_UID` di `.env.local`.

## 4. Terapkan Firestore Rules

Buka **Firestore Database → Rules**. Di `firestore.rules`, ganti `REPLACE_WITH_ADMIN_UID` dengan UID admin yang sama, salin seluruh rules ke Firebase Console, lalu tekan **Publish**. Aturan ini membolehkan pengunjung membaca satu dokumen harga, sementara hanya UID admin yang dapat membuat atau mengubahnya. Penghapusan dokumen ditolak.

Restart Vite agar UID pada `.env.local` terbaca. Dashboard akan aktif menyimpan harga saat dokumen `/settings/ticketPrices` bisa dibaca.

## Dokumen harga

Collection: `settings`
Document: `ticketPrices`

Field bertipe integer/Int64: `showAdult`, `showChild`, `comboAdult`, `comboChild`. Landing page berlangganan pada dokumen ini dan menerima perubahan harga secara real-time.

## Setelah hosting

Tambahkan domain publik situs (misalnya `nama-site.netlify.app`) ke **Authentication → Settings → Authorized domains** agar Google login dapat digunakan dari domain tersebut. Ubah nilai build environment `VITE_FIREBASE_*` pada Netlify juga; file `.env.local` lokal tidak ikut diunggah.
