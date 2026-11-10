import { useEffect, useState, type FormEvent } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { useTicketPrices, type TicketPrices } from "./ticketPrices";
import { adminUid, firebaseConfigured } from "./firebase";
import { auth, googleProvider } from "./firebaseAuth";
import "./AdminDashboard.css";

type PriceKey = keyof TicketPrices;
type Draft = Record<PriceKey, string>;

const priceFields: { key: PriceKey; title: string; packageName: string }[] = [
  { key: "showAdult", title: "Dewasa", packageName: "Kecak Fire Dance" },
  { key: "showChild", title: "Anak usia 4–9 tahun", packageName: "Kecak Fire Dance" },
  { key: "comboAdult", title: "Dewasa", packageName: "Kecak + Tiket Entrance Pura" },
  { key: "comboChild", title: "Anak usia 4–9 tahun", packageName: "Kecak + Tiket Entrance Pura" },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const toDraft = (prices: TicketPrices): Draft => ({
  showAdult: String(prices.showAdult),
  showChild: String(prices.showChild),
  comboAdult: String(prices.comboAdult),
  comboChild: String(prices.comboChild),
});

export default function AdminDashboard() {
  const { prices, status } = useTicketPrices();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [draft, setDraft] = useState<Draft>(() => toDraft(prices));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    setDraft(toDraft(prices));
  }, [prices]);

  const isAuthorized = Boolean(user && adminUid && user.uid === adminUid);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError("Login Google gagal. Periksa provider dan authorized domain Firebase.");
    }
  };

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const values = {} as TicketPrices;
    for (const field of priceFields) {
      const value = draft[field.key].trim();
      const amount = Number(value);
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(amount) || amount < 0) {
        setError("Isi semua harga dengan angka bulat nol atau lebih.");
        return;
      }
      values[field.key] = amount;
    }

    setSaving(true);
    try {
      const { saveTicketPrices } = await import("./ticketPricesFirestore");
      await saveTicketPrices(values);
      setMessage("Harga berhasil disimpan dan landing page akan diperbarui otomatis.");
    } catch {
      setError("Harga belum tersimpan. Periksa koneksi Firebase dan Firestore Rules.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="admin-brand" href="/" aria-label="Kembali ke landing page">
          <span className="admin-brand-mark">U</span>
          <span>ULUWATU <i>KECAK</i><small>ADMIN DASHBOARD</small></span>
        </a>
        <a className="admin-return" href="/">Lihat landing page <span>↗</span></a>
      </header>

      <section className="admin-content">
        <div className="admin-heading">
          <label>PENGELOLAAN WEBSITE</label>
          <h1>Atur harga <i>tiket.</i></h1>
          <p>Perubahan yang disimpan akan tampil di landing page tanpa deploy ulang.</p>
        </div>

        {!firebaseConfigured ? (
          <div className="admin-panel admin-message-panel">
            <h2>Hubungkan Firebase terlebih dahulu</h2>
            <p>Isi konfigurasi Firebase di file <code>.env.local</code>, lalu jalankan ulang website.</p>
            <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer">Buka Firebase Console ↗</a>
          </div>
        ) : authLoading ? (
          <div className="admin-panel admin-message-panel" role="status">Memeriksa sesi admin…</div>
        ) : !user ? (
          <div className="admin-panel admin-login-panel">
            <div className="admin-lock" aria-hidden="true">✳</div>
            <h2>Masuk sebagai admin</h2>
            <p>Gunakan akun Google admin untuk mengelola harga tiket.</p>
            <button className="admin-google-button" onClick={handleGoogleSignIn}>
              <span className="google-g" aria-hidden="true">G</span> Masuk dengan Google
            </button>
            {error && <p className="admin-error" role="alert">{error}</p>}
          </div>
        ) : !adminUid ? (
          <div className="admin-panel admin-message-panel">
            <h2>Tambahkan akun ini sebagai admin</h2>
            <p>Salin UID di bawah ke <code>VITE_FIREBASE_ADMIN_UID</code> pada file <code>.env.local</code>, lalu masukkan UID yang sama ke <code>firestore.rules</code>.</p>
            <code className="admin-uid">{user.uid}</code>
            <button className="admin-secondary-button" onClick={() => navigator.clipboard?.writeText(user.uid)}>Salin UID</button>
            <button className="admin-text-button" onClick={handleSignOut}>Keluar</button>
          </div>
        ) : !isAuthorized ? (
          <div className="admin-panel admin-message-panel">
            <h2>Akun ini belum diizinkan</h2>
            <p>UID akun Google yang sedang login. Gunakan UID ini pada <code>VITE_FIREBASE_ADMIN_UID</code> dan Firestore Rules jika akun ini memang ingin dijadikan admin.</p>
            <code className="admin-uid">{user.uid}</code>
            <button className="admin-secondary-button" onClick={() => navigator.clipboard?.writeText(user.uid)}>Salin UID akun ini</button>
            <button className="admin-text-button" onClick={handleSignOut}>Ganti akun</button>
          </div>
        ) : (
          <form className="admin-panel admin-price-form" onSubmit={handleSave}>
            <div className="admin-form-topline">
              <div>
                <span className="admin-status-dot" />
                <span>{user.email}</span>
              </div>
              <button className="admin-text-button" type="button" onClick={handleSignOut}>Keluar</button>
            </div>
            <div className="admin-price-section">
              <div className="admin-package-heading">
                <span>01</span>
                <div><h2>Kecak Fire Dance</h2><p>Tiket pertunjukan saja</p></div>
              </div>
              <div className="admin-input-grid">
                {priceFields.slice(0, 2).map((field) => (
                  <label className="admin-price-field" key={field.key}>
                    <span>{field.title}</span>
                    <div><b>Rp</b><input type="number" min="0" step="1" inputMode="numeric" value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} required /></div>
                    <small>Saat ini: {formatRupiah(prices[field.key])}</small>
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-price-section">
              <div className="admin-package-heading">
                <span>02</span>
                <div><h2>Kecak + Entrance Pura</h2><p>Pertunjukan dan tiket masuk pura</p></div>
              </div>
              <div className="admin-input-grid">
                {priceFields.slice(2).map((field) => (
                  <label className="admin-price-field" key={field.key}>
                    <span>{field.title}</span>
                    <div><b>Rp</b><input type="number" min="0" step="1" inputMode="numeric" value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} required /></div>
                    <small>Saat ini: {formatRupiah(prices[field.key])}</small>
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-save-row">
              <p>Data tersimpan di Firestore. Harga publik akan mengikuti perubahan ini.</p>
              <button className="admin-save-button" type="submit" disabled={saving || status !== "connected"}>
                {saving ? "Menyimpan…" : "Simpan perubahan"} <span>→</span>
              </button>
            </div>
            {status !== "connected" && <p className="admin-error" role="alert">Data harga belum berhasil dimuat. Periksa dokumen settings/ticketPrices dan aturan Firestore.</p>}
            {error && <p className="admin-error" role="alert">{error}</p>}
            {message && <p className="admin-success" role="status">{message}</p>}
          </form>
        )}
      </section>
      <footer className="admin-footer">Dashboard privat · Harga diperbarui langsung melalui Firestore</footer>
    </main>
  );
}
