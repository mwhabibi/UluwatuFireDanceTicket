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
  const [pendingPrices, setPendingPrices] = useState<TicketPrices | null>(null);

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
  const hasPriceChanges = priceFields.some(
    (field) => Number(draft[field.key]) !== prices[field.key],
  );

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError("Login belum berhasil. Pilih akun Google admin yang benar, lalu coba lagi.");
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

    if (!priceFields.some((field) => values[field.key] !== prices[field.key])) {
      setMessage("Tidak ada perubahan harga untuk disimpan.");
      return;
    }
    setPendingPrices(values);
  };

  const confirmSave = async () => {
    if (!pendingPrices) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { saveTicketPrices } = await import("./ticketPricesFirestore");
      await saveTicketPrices(pendingPrices);
      setMessage("Harga berhasil diperbarui. Perubahan sudah tampil di website utama.");
      setPendingPrices(null);
    } catch {
      setError("Harga belum berhasil disimpan. Coba lagi; jika masih gagal, hubungi pengelola website.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="admin-brand" href="/" aria-label="Kembali ke website utama">
          <span className="admin-brand-mark">U</span>
          <span>ULUWATU <i>KECAK</i><small>ADMIN DASHBOARD</small></span>
        </a>
        <a className="admin-return" href="/">Lihat website utama <span>↗</span></a>
      </header>

      <section className="admin-content">
        <div className="admin-heading">
          <label>PENGELOLAAN WEBSITE</label>
          <h1>Atur harga <i>tiket.</i></h1>
          <p>Perubahan yang disimpan akan tampil di website utama tanpa deploy ulang.</p>
        </div>

        {!firebaseConfigured ? (
          <div className="admin-panel admin-message-panel">
            <h2>Dashboard belum tersedia</h2>
            <p>Fitur pengelolaan harga sedang tidak dapat digunakan. Silakan hubungi pengelola website.</p>
          </div>
        ) : authLoading ? (
          <div className="admin-panel admin-message-panel" role="status">Memeriksa akses admin…</div>
        ) : !user ? (
          <div className="admin-panel admin-login-panel">
            <div className="admin-lock" aria-hidden="true">✳</div>
            <h2>Masuk ke dashboard</h2>
            <p>Gunakan akun Google yang terdaftar sebagai admin untuk mengelola harga tiket.</p>
            <button className="admin-google-button" onClick={handleGoogleSignIn}>
              <span className="google-g" aria-hidden="true">G</span> Masuk dengan Google
            </button>
            {error && <p className="admin-error" role="alert">{error}</p>}
          </div>
        ) : !adminUid ? (
          <div className="admin-panel admin-message-panel">
            <h2>Akses admin belum tersedia</h2>
            <p>Dashboard belum dapat memverifikasi akses akun Anda. Silakan hubungi pengelola website.</p>
            <button className="admin-text-button" onClick={handleSignOut}>Keluar</button>
          </div>
        ) : !isAuthorized ? (
          <div className="admin-panel admin-message-panel">
            <h2>Akun ini belum memiliki akses</h2>
            <p>Akun Google <strong>{user.email ?? "yang sedang digunakan"}</strong> tidak terdaftar sebagai admin. Keluar, lalu masuk kembali menggunakan akun admin yang benar.</p>
            <button className="admin-secondary-button" onClick={handleSignOut}>Keluar dan pilih akun lain</button>
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
              <button className="admin-save-button" type="submit" disabled={saving || status !== "connected" || !hasPriceChanges}>
                Simpan perubahan <span>→</span>
              </button>
            </div>
            {status !== "connected" && <p className="admin-error" role="alert">Harga belum berhasil dimuat. Muat ulang halaman atau hubungi pengelola website.</p>}
            {error && <p className="admin-error" role="alert">{error}</p>}
            {message && (
              <div className="admin-success" role="status">
                <span className="admin-success-check" aria-hidden="true">✓</span>
                <p>{message}</p>
              </div>
            )}
          </form>
        )}
      </section>
      <footer className="admin-footer">Dashboard privat · Harga diperbarui langsung melalui Firestore</footer>

      {pendingPrices && (
        <div
          className="admin-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setPendingPrices(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !saving) setPendingPrices(null);
          }}
        >
          <section
            className="admin-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-description"
          >
            <span className="admin-confirm-mark" aria-hidden="true">↗</span>
            <label>PERIKSA KEMBALI</label>
            <h2 id="admin-confirm-title">Simpan perubahan harga?</h2>
            <p id="admin-confirm-description">Harga baru akan langsung ditampilkan di website utama setelah disimpan.</p>
            <div className="admin-confirm-list">
              {priceFields
                .filter((field) => pendingPrices[field.key] !== prices[field.key])
                .map((field) => (
                  <div className="admin-confirm-item" key={field.key}>
                    <span><b>{field.packageName}</b><small>{field.title}</small></span>
                    <span className="admin-confirm-values">
                      <del>{formatRupiah(prices[field.key])}</del>
                      <strong>{formatRupiah(pendingPrices[field.key])}</strong>
                    </span>
                  </div>
                ))}
            </div>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <div className="admin-confirm-actions">
              <button
                className="admin-cancel-button"
                type="button"
                autoFocus
                disabled={saving}
                onClick={() => setPendingPrices(null)}
              >
                Kembali edit
              </button>
              <button
                className="admin-save-button"
                type="button"
                disabled={saving}
                onClick={confirmSave}
              >
                {saving ? <><span className="admin-spinner" aria-hidden="true" /> Menyimpan…</> : <>Ya, simpan harga <span>→</span></>}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
