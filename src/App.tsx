import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useTicketPrices } from "./ticketPrices";
const heroSlides = {
  en: [
    {
      title: "When the sun sets,",
      emphasis: "the story begins.",
      copy: "Feel the pulse of Bali in a spellbinding fire dance, performed on the edge of the Indian Ocean.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/2/2d/Balinese_Kecak_dance_with_Hanuman_in_a_ring_of_fire.jpg",
      alt: "White Hanuman in the circle of fire",
    },
    {
      title: "One circle of voices,",
      emphasis: "one unforgettable night.",
      copy: "Dozens of chanters bring the Ramayana to life as firelight dances across the Uluwatu cliffs.",
      image:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Kecak_and_Fire_Dance_at_Uluwatu.jpg/1280px-Kecak_and_Fire_Dance_at_Uluwatu.jpg",
      alt: "Kecak and fire dance at the Uluwatu clifftop amphitheater",
    },
    {
      title: "A cliffside temple.",
      emphasis: "A sky on fire.",
      copy: "Watch Bali's most powerful story unfold above the Indian Ocean at golden hour.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/e/ed/Hanuman_on_fire_Kecak_Dance_Pura_Luhur_Uluwatu.jpg",
      alt: "Hanuman performer surrounded by fire at Uluwatu",
    },
  ],
  id: [
    {
      title: "Saat matahari terbenam,",
      emphasis: "kisah pun dimulai.",
      copy: "Rasakan denyut Bali dalam pertunjukan tari api yang memukau, di tepi Samudra Hindia.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/2/2d/Balinese_Kecak_dance_with_Hanuman_in_a_ring_of_fire.jpg",
      alt: "Hanoman putih di tengah lingkaran api",
    },
    {
      title: "Satu lingkaran suara,",
      emphasis: "satu malam tak terlupakan.",
      copy: "Puluhan penembang menghidupkan kisah Ramayana, ditemani cahaya api di tebing Uluwatu.",
      image:
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Kecak_and_Fire_Dance_at_Uluwatu.jpg/1280px-Kecak_and_Fire_Dance_at_Uluwatu.jpg",
      alt: "Tari Kecak dan api di amfiteater tebing Uluwatu",
    },
    {
      title: "Pura di atas tebing.",
      emphasis: "Langit yang membara.",
      copy: "Saksikan kisah Bali yang paling memikat di atas Samudra Hindia saat cahaya keemasan senja.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/e/ed/Hanuman_on_fire_Kecak_Dance_Pura_Luhur_Uluwatu.jpg",
      alt: "Penari Hanuman di tengah kobaran api di Uluwatu",
    },
  ],
} as const;
const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
const getBaliDateTime = (instant = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return { date: part("year") + "-" + part("month") + "-" + part("day"), hour: Number(part("hour")) };
};
const nextCalendarDay = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
};
const whatsappNumber = "6285755549787";
export default function App() {
  const { prices } = useTicketPrices();
  const [lang, setLang] = useState<"en" | "id">(() =>
    localStorage.getItem("uluwatu-language") === "id" ? "id" : "en",
  );
  const [languageTransitioning, setLanguageTransitioning] = useState(false);
  const [baliNow, setBaliNow] = useState(getBaliDateTime);
  const T = (en: string, id: string) => (lang === "en" ? en : id);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  useEffect(() => {
    const timer = window.setInterval(() => setBaliNow(getBaliDateTime()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("main > section"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -36px 0px" },
    );
    sections.forEach((section) => {
      section.classList.add("scroll-reveal");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const changeLanguage = (value: "en" | "id") => {
    if (value === lang || languageTransitioning) return;
    const applyLanguage = () => {
      setLang(value);
      localStorage.setItem("uluwatu-language", value);
      document.documentElement.lang = value;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyLanguage();
      return;
    }
    setLanguageTransitioning(true);
    window.setTimeout(() => {
      applyLanguage();
      window.setTimeout(() => setLanguageTransitioning(false), 45);
    }, 125);
  };

  const faqs =
    lang === "en"
      ? [
          [
            "What time are the performances?",
            "There are two daily sessions: 6:00–7:00 PM and 7:00–8:00 PM WITA. Please arrive 45 minutes before your selected session.",
          ],
          [
            "Is temple entrance included?",
            "Choose the Kecak + Temple Entrance ticket to include admission. The Kecak Fire Dance ticket covers the performance only; temple entry is paid separately at the gate.",
          ],
          [
            "Can I change or cancel?",
            "Send your selected date and guest details to our admin directly on WhatsApp. Your booking is confirmed after the admin replies.",
          ],
          [
            "Is it suitable for children?",
            "Yes, though the show includes fire effects and can be loud. Keep little ones close around the temple monkeys.",
          ],
        ]
      : [
          [
            "Jam berapa jadwal pertunjukannya?",
            "Ada dua sesi setiap hari: pukul 18.00–19.00 dan 19.00–20.00 WITA. Silakan tiba 45 menit sebelum sesi pilihan Anda.",
          ],
          [
            "Apakah tiket termasuk tiket masuk pura?",
            "Pilih tiket Kecak + Tiket Entrance Pura untuk mendapatkan tiket masuk pura. Tiket Kecak Fire Dance hanya mencakup pertunjukan; tiket masuk pura dibayar terpisah di gerbang.",
          ],
          [
            "Bisakah pesanan diubah atau dibatalkan?",
            "Kirim tanggal dan jumlah tamu kepada admin melalui WhatsApp. Pesanan dikonfirmasi setelah admin membalas.",
          ],
          [
            "Apakah pertunjukan cocok untuk anak-anak?",
            "Bisa. Pertunjukan memiliki efek api dan suara yang cukup ramai. Dampingi anak-anak, terutama di area pura yang terdapat monyet.",
          ],
        ];
  const experiences =
    lang === "en"
      ? [
          [
            "THE SETTING",
            "On the edge of the world.",
            "A clifftop temple. Open sea. The last light of day.",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Ramayana_Kecak_Dance_Performance_after_sunset.jpg/960px-Ramayana_Kecak_Dance_Performance_after_sunset.jpg",
          ],
          [
            "THE RITUAL",
            "Rhythm without instruments.",
            "Dozens of voices become one hypnotic chant.",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Balinese_performers_01.jpg/960px-Balinese_performers_01.jpg",
          ],
          [
            "THE STORY",
            "Myth, movement & fire.",
            "The Ramayana unfolds in a blaze of color.",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Hanuman_playing_with_the_fire.jpg/960px-Hanuman_playing_with_the_fire.jpg",
          ],
        ]
      : [
          [
            "SUASANA",
            "Di ujung dunia.",
            "Pura di atas tebing. Laut lepas. Cahaya senja terakhir.",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Ramayana_Kecak_Dance_Performance_after_sunset.jpg/960px-Ramayana_Kecak_Dance_Performance_after_sunset.jpg",
          ],
          [
            "RITUAL",
            "Ritme tanpa alat musik.",
            "Puluhan suara berpadu dalam lantunan yang memikat.",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Balinese_performers_01.jpg/960px-Balinese_performers_01.jpg",
          ],
          [
            "KISAH",
            "Mitos, gerak & api.",
            "Kisah Ramayana hidup dalam pertunjukan penuh warna.",
            "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Hanuman_playing_with_the_fire.jpg/960px-Hanuman_playing_with_the_fire.jpg",
          ],
        ];
  const details =
    lang === "en"
      ? [
          [
            "◷",
            "Showtime",
            "Daily sessions: 6:00–7:00 PM and 7:00–8:00 PM WITA. Please arrive 45 minutes before your selected session.",
            "2 SESSIONS",
          ],
          [
            "⌖",
            "Getting here",
            "Uluwatu Temple, Pecatu, South Kuta. Around 45 minutes from Jimbaran, depending on traffic.",
            "PECATU",
          ],
          [
            "◈",
            "What to wear",
            "Temple attire is required. Sarongs are available to borrow at the entrance. Bring a light layer for the sea breeze.",
            "DRESS RESPECTFULLY",
          ],
          [
            "◎",
            "Temple entry",
            "Included with the Kecak + Temple Entrance ticket. For performance-only tickets, admission is paid separately at the gate.",
            "OPTIONAL ADD-ON",
          ],
        ]
      : [
          [
            "◷",
            "Waktu pertunjukan",
            "Setiap hari: pukul 18.00–19.00 dan 19.00–20.00 WITA. Silakan tiba 45 menit sebelum sesi pilihan Anda.",
            "2 SESI",
          ],
          [
            "⌖",
            "Lokasi",
            "Pura Uluwatu, Pecatu, Kuta Selatan. Sekitar 45 menit dari Jimbaran, bergantung kondisi lalu lintas.",
            "PECATU",
          ],
          [
            "◈",
            "Pakaian",
            "Kenakan pakaian sopan untuk memasuki pura. Sarung tersedia untuk dipinjam. Bawa pakaian ringan untuk angin laut.",
            "BERPAKAIAN SOPAN",
          ],
          [
            "◎",
            "Tiket masuk pura",
            "Termasuk dalam tiket Kecak + Tiket Entrance Pura. Untuk tiket pertunjukan saja, tiket pura dibayar terpisah di gerbang.",
            "PILIHAN PAKET",
          ],
        ];
  const [name, setName] = useState(""),
    [date, setDate] = useState(""),
    [session, setSession] = useState<1 | 2>(1),
    [adults, setAdults] = useState(2),
    [kids, setKids] = useState(0),
    [faq, setFaq] = useState<number | null>(0),
    [menu, setMenu] = useState(false),
    [modal, setModal] = useState(false),
    [notice, setNotice] = useState(""),
    [invalidField, setInvalidField] = useState<"name" | "date" | null>(null),
    [heroIndex, setHeroIndex] = useState(0),
    [heroPaused, setHeroPaused] = useState(false);
  const slides = heroSlides[lang];
  const activeSlide = slides[heroIndex];
  useEffect(() => {
    if (heroPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(
      () => setHeroIndex((index) => (index + 1) % 3),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [heroPaused]);
  const [ticketType, setTicketType] = useState<"show" | "combo">("show");
  const guests = adults + kids;
  const adultPrice = ticketType === "combo" ? prices.comboAdult : prices.showAdult;
  const childPrice = ticketType === "combo" ? prices.comboChild : prices.showChild;
  const total = useMemo(
    () => adults * adultPrice + kids * childPrice,
    [adults, kids, adultPrice, childPrice],
  );
  const sameDayBookingOpen = baliNow.hour < 12;
  const minimumBookingDate = sameDayBookingOpen
    ? baliNow.date
    : nextCalendarDay(baliNow.date);
  const guestRows = [
    {
      label: T("ADULTS", "DEWASA"),
      hint: T("Adult ticket", "Tiket dewasa"),
      count: adults,
      setCount: setAdults,
      min: 1,
    },
    {
      label: T("CHILDREN", "ANAK-ANAK"),
      hint: T("Ages 4–9", "Usia 4–9 tahun"),
      count: kids,
      setCount: setKids,
      min: 0,
    },
  ] as const;
  const ticketPriceOptions = [
    {
      id: "show",
      title: T("Kecak Fire Dance", "Kecak Fire Dance"),
      subtitle: T("Performance ticket only", "Tiket pertunjukan saja"),
      adultPrice: prices.showAdult,
      childPrice: prices.showChild,
    },
    {
      id: "combo",
      title: T("Kecak + Temple Entrance", "Kecak + Tiket Entrance Pura"),
      subtitle: T("Performance + temple entrance", "Pertunjukan + tiket masuk pura"),
      adultPrice: prices.comboAdult,
      childPrice: prices.comboChild,
    },
  ] as const;
  const waMessage = encodeURIComponent(
    [
      lang === "id"
        ? "Halo admin Uluwatu Kecak Dance, saya ingin memesan tiket."
        : "Hello Uluwatu Kecak Dance admin, I would like to book tickets.",
      (lang === "id" ? "Nama: " : "Name: ") + name.trim(),
      (lang === "id" ? "Jenis tiket: " : "Ticket type: ") +
        (ticketType === "combo"
          ? lang === "id"
            ? "Kecak + Tiket Entrance Pura"
            : "Kecak + Temple Entrance"
          : "Kecak Fire Dance"),
      (lang === "id" ? "Tanggal: " : "Date: ") +
        new Date(date + "T12:00:00").toLocaleDateString(
          lang === "id" ? "id-ID" : "en-US",
          { weekday: "long", day: "numeric", month: "long", year: "numeric" },
        ),
      (lang === "id" ? "Sesi: " : "Session: ") +
        (lang === "en"
          ? session === 1
            ? "Session 1 · 6:00–7:00 PM WITA"
            : "Session 2 · 7:00–8:00 PM WITA"
          : session === 1
            ? "Sesi 1 · 18.00–19.00 WITA"
            : "Sesi 2 · 19.00–20.00 WITA"),
      (lang === "id" ? "Dewasa: " : "Adults: ") +
        adults +
        " x " +
        money(adultPrice),
      (lang === "id" ? "Anak (4–9 tahun): " : "Children (ages 4–9): ") +
        kids +
        " x " +
        money(childPrice),
      (lang === "id" ? "Jumlah tiket: " : "Total tickets: ") + guests,
      (lang === "id" ? "Perkiraan total tiket: " : "Estimated ticket total: ") +
        money(total),
    ].join("\n"),
  );
  const waLink = "https://wa.me/" + whatsappNumber + "?text=" + waMessage;
  const contactLink =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(
      lang === "id"
        ? "Halo admin Uluwatu Kecak Dance, saya ingin bertanya."
        : "Hello, I have a question about Uluwatu Kecak Dance.",
    );
  useEffect(() => {
    if (baliNow.hour >= 12 && date === baliNow.date) {
      setDate("");
      setInvalidField("date");
      setNotice(
        T(
          "Same-day booking has closed at 12:00 PM Bali time (WITA, UTC+8). Please choose tomorrow or later.",
          "Pemesanan hari ini sudah ditutup menurut waktu Bali (WITA, UTC+8). Silakan pilih besok atau tanggal berikutnya.",
        ),
      );
    }
  }, [baliNow.date, baliNow.hour, date, lang]);
  const book = () => {
    const currentBaliTime = getBaliDateTime();
    setBaliNow(currentBaliTime);
    const earliestDate = currentBaliTime.hour < 12
      ? currentBaliTime.date
      : nextCalendarDay(currentBaliTime.date);
    if (!name.trim()) {
      setInvalidField("name");
      setNotice(T("Please enter your name.", "Silakan masukkan nama Anda."));
      document.getElementById("booking-name")?.focus();
      document
        .getElementById("booking")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (date && date < earliestDate) {
      setDate("");
      setInvalidField("date");
      setNotice(
        T(
          "Same-day booking has closed at 12:00 PM Bali time (WITA, UTC+8). Please choose tomorrow or later.",
          "Pemesanan hari ini sudah ditutup menurut waktu Bali (WITA, UTC+8). Silakan pilih besok atau tanggal berikutnya.",
        ),
      );
      document.getElementById("date")?.focus();
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!date) {
      setInvalidField("date");
      setNotice(
        T(
          "Please choose a performance date first.",
          "Silakan pilih tanggal pertunjukan terlebih dahulu.",
        ),
      );
      document.getElementById("date")?.focus();
      document
        .getElementById("booking")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setInvalidField(null);
    setNotice("");
    setModal(true);
  };
  return (
    <main className={languageTransitioning ? "language-transitioning" : ""}>
      <div className="announcement">
        <i />{" "}
        {T(
          "DAILY SHOWS · 6:00 & 7:00 PM WITA",
          "PERTUNJUKAN SETIAP HARI · 18.00 & 19.00 WITA",
        )}{" "}
        <span>—</span> ULUWATU, BALI
      </div>
      <header className="header">
        <a className="brand" href="#home">
          <b>U</b>
          <span>
            ULUWATU <em>KECAK</em>
            <small>THE SUNSET EXPERIENCE</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          onClick={() => setMenu(!menu)}
          aria-label={T("Toggle navigation", "Buka navigasi")}
        >
          {menu ? "×" : "☰"}
        </button>
        <nav className={menu ? "nav open" : "nav"}>
          <a href="#experience" onClick={() => setMenu(false)}>
            {T("Experience", "Pengalaman")}
          </a>
          <a href="#story" onClick={() => setMenu(false)}>
            {T("Our story", "Kisah kami")}
          </a>
          <a href="#tickets" onClick={() => setMenu(false)}>{T("Ticket prices", "Harga tiket")}</a>
          <a href="#visit" onClick={() => setMenu(false)}>
            {T("Plan your visit", "Rencanakan kunjungan")}
          </a>
          <a className="nav-cta" href="#booking" onClick={() => setMenu(false)}>
            {T("Book tickets", "Pesan tiket")} ↗
          </a>

        </nav>
      </header>
      <div
        className="language-switch language-switch-floating"
        role="group"
        aria-label={T("Choose language", "Pilih bahasa")}
      >
        <button
          className={lang === "en" ? "selected" : ""}
          aria-pressed={lang === "en"}
          disabled={languageTransitioning}
          onClick={() => changeLanguage("en")}
        >
          EN
        </button>
        <button
          className={lang === "id" ? "selected" : ""}
          aria-pressed={lang === "id"}
          disabled={languageTransitioning}
          onClick={() => changeLanguage("id")}
        >
          ID
        </button>
      </div>
      <section className="hero" id="home">
        <div
          className="hero-photo"
          key={activeSlide.image}
          role="img"
          aria-label={activeSlide.alt}
        >
          <img
            src={activeSlide.image}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Kecak_and_Fire_Dance_at_Uluwatu.jpg/1280px-Kecak_and_Fire_Dance_at_Uluwatu.jpg";
            }}
          />
        </div>
        <div className="hero-shade" />
        <div className="hero-copy" key={heroIndex}>
          <label>
            — &nbsp;{" "}
            {T(
              "A BALI ORIGINAL · GENERATIONS IN THE MAKING",
              "WARISAN BALI · DIJAGA LINTAS GENERASI",
            )}
          </label>
          <h1>
            {activeSlide.title}
            <br />
            <i>{activeSlide.emphasis}</i>
          </h1>
          <p>{activeSlide.copy}</p>
          <div className="hero-buttons">
            <a className="button gold" href="#booking">
              {T("Find your seats", "Pilih tempat duduk")} <span>↓</span>
            </a>
            <a className="discover" href="#experience">
              ▷ &nbsp; {T("Discover the experience", "Jelajahi pengalaman")}
            </a>
          </div>
          <div className="rating">
            <strong>{T("ULUWATU, BALI", "ULUWATU, BALI")}</strong> &nbsp;{T("Daily shows · 6:00 & 7:00 PM WITA", "Pertunjukan harian · 18.00 & 19.00 WITA")}
          </div>
          <div
            className="hero-controls"
            role="group"
            aria-label={T("Hero image slides", "Slide gambar utama")}
          >
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.image}
                className={index === heroIndex ? "hero-dot active" : "hero-dot"}
                aria-label={T("Go to slide", "Ke slide") + " " + (index + 1)}
                aria-pressed={index === heroIndex}
                onClick={() => setHeroIndex(index)}
              />
            ))}
            <button
              type="button"
              className="hero-pause"
              onClick={() => setHeroPaused((paused) => !paused)}
              aria-label={
                heroPaused
                  ? T("Play slides", "Putar slide")
                  : T("Pause slides", "Jeda slide")
              }
            >
              {heroPaused ? "▶" : "Ⅱ"}
            </button>
          </div>
        </div>
        <div className="coordinates">
          08°49' S&nbsp; 115°05' E{" "}
          <span>{T("THE CLIFFS OF ULUWATU", "TEBING ULUWATU")}</span>
        </div>
      </section>
      <section className="section experience" id="experience">
        <div className="section-head">
          <div>
            <label>
              {T("MORE THAN A PERFORMANCE", "LEBIH DARI SEKADAR PERTUNJUKAN")}
            </label>
            <h2>
              {T("A feeling that stays", "Pengalaman yang membekas")}
              <br />
              <i>{T("with you.", "di hati.")}</i>
            </h2>
          </div>
          <p>
            {T(
              "As daylight fades over the ocean, a circle of voices rises. No instruments. Just rhythm, fire, and an ancient story told beneath the Bali sky.",
              "Saat senja meredup di atas laut, lantunan suara menggema. Tanpa alat musik—hanya ritme, api, dan kisah kuno di bawah langit Bali.",
            )}
          </p>
        </div>
        <div className="cards">
          {experiences.map((c, i) => (
            <article
              className="experience-card"
              key={c[0]}
              style={{
                backgroundImage:
                  "linear-gradient(0deg,#111c,transparent 65%),url(" +
                  c[3] +
                  ")",
              }}
            >
              <div>
                <label>
                  0{i + 1} — {c[0]}
                </label>
                <h3>{c[1]}</h3>
                <p>{c[2]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="story" id="story">
        <div
          className="story-photo"
          role="img"
          aria-label={T(
            "Uluwatu Temple and the Bali coast at sunset",
            "Pura Uluwatu dan pesisir Bali saat senja",
          )}
        />
        <div className="story-text">
          <label>
            {T(
              "A STORY OLDER THAN WORDS",
              "KISAH YANG LEBIH TUA DARI KATA-KATA",
            )}
          </label>
          <h2>
            {T("One circle.", "Satu lingkaran.")}
            <br />
            {T("A thousand voices.", "Ribuan suara.")}
            <br />
            <i>{T("One unforgettable night.", "Satu malam tak terlupakan.")}</i>
          </h2>
          <p>
            {T(
              "Inspired by the Hindu epic Ramayana, the Kecak tells the story of Prince Rama's quest to rescue Sita. The chorus of “cak-cak-cak” builds into a living pulse—an art form born in Bali and shared with the world.",
              "Terinspirasi dari epos Ramayana, tari Kecak mengisahkan perjalanan Pangeran Rama menyelamatkan Sita. Lantunan “cak-cak-cak” membentuk irama yang hidup—seni dari Bali yang dibagikan kepada dunia.",
            )}
          </p>
          <p>
            {T(
              "Here at Uluwatu, the story meets its most extraordinary stage: a centuries-old temple perched above a restless sea.",
              "Di Uluwatu, kisah ini hadir di panggung istimewa: pura berusia ratusan tahun di atas laut yang bergelora.",
            )}
          </p>
          <a href="#visit">{T("Plan your visit", "Rencanakan kunjungan")} ↗</a>
        </div>
      </section>
      <section className="quote">
        <b>✺</b>
        <blockquote>
          {T("Plan your evening at Uluwatu.", "Rencanakan malam Anda di Uluwatu.")}<br />
          <i>{T("Two sessions. Two ticket options.", "Dua sesi. Dua pilihan tiket.")}</i>
        </blockquote>
        <small>{T("6:00–7:00 PM · 7:00–8:00 PM WITA", "18.00–19.00 · 19.00–20.00 WITA")}</small>
      </section>
      <section className="section ticket-pricing" id="tickets">
        <div className="ticket-pricing-head">
          <label>{T("CHOOSE YOUR EXPERIENCE", "PILIH PENGALAMAN ANDA")}</label>
          <h2>{T("Two ways to enjoy", "Dua cara menikmati")}<br /><i>{T("the Kecak evening.", "malam Kecak.")}</i></h2>
          <p>{T("Compare the two ticket options before you book.", "Bandingkan dua pilihan tiket sebelum memesan.")}</p>
        </div>
        <div className="ticket-price-cards">
          {ticketPriceOptions.map((pack) => (
            <article className="ticket-price-card" key={pack.id}>
              <header>
                <small>{pack.id === "combo" ? T("ALL-IN EXPERIENCE", "PAKET LENGKAP") : T("PERFORMANCE ONLY", "PERTUNJUKAN SAJA")}</small>
                <h3>{pack.title}</h3>
                <p>{pack.subtitle}</p>
              </header>
              <div className="ticket-rate-grid">
                <div className="ticket-rate">
                  <span>{T("ADULT", "DEWASA")}</span>
                  <strong>{money(pack.adultPrice)}</strong>
                </div>
                <div className="ticket-rate">
                  <span>{T("CHILD · AGES 4–9", "ANAK · USIA 4–9")}</span>
                  <strong>{money(pack.childPrice)}</strong>
                </div>
              </div>
              <a className="button dark full" href="#booking" onClick={() => setTicketType(pack.id)}>{T("Choose this ticket", "Pilih tiket ini")} <span>↓</span></a>
            </article>
          ))}
        </div>
        <p className="pricing-footnote">{T("Child rate applies to ages 4–9. Temple entry is included only with the combined ticket.", "Harga anak berlaku untuk usia 4–9 tahun. Tiket masuk pura hanya termasuk pada paket Kecak + Entrance.")}</p>
      </section>
      <section className="section visit" id="visit">
        <div className="visit-title">
          <label>
            {T(
              "PLAN A LITTLE, ENJOY A LOT",
              "SEDIKIT RENCANA, BANYAK KENANGAN",
            )}
          </label>
          <h2>
            {T("The details", "Informasi")}
            <br />
            <i>{T("that make the evening.", "untuk malam yang istimewa.")}</i>
          </h2>
          <p>
            {T(
              "Everything you need for a smooth sunset visit.",
              "Semua yang perlu diketahui untuk menikmati senja.",
            )}
          </p>
        </div>
        <div className="details">
          {details.map((d) => (
            <article className="detail" key={d[1]}>
              <span className="detail-icon">{d[0]}</span>
              <div>
                <h3>{d[1]}</h3>
                <p>
                  {d[2]}
                  {(lang === "en"
                    ? d[1] === "Getting here"
                    : d[1] === "Lokasi") && (
                    <>
                      {" "}
                      <a
                        href="https://maps.google.com/?q=Uluwatu+Temple+Bali"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {T("Open map", "Buka peta")} ↗
                      </a>
                    </>
                  )}
                </p>
              </div>
              <small>{d[3]}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="booking" id="booking">
        <div className="booking-card">
          <div className="booking-intro">
            <label>{T("YOUR EVENING, RESERVED", "PESAN MALAM ANDA")}</label>
            <h2>
              {T("Make it a night", "Jadikan malam ini")}
              <br />
              {T("to remember.", "tak terlupakan.")}
            </h2>
            <p>
              {T(
                "Choose your date and we'll take care of the rest.",
                "Pilih tanggal, kami bantu sisanya.",
              )}
            </p>
            <ul>
              <li>✓ &nbsp;{T("Book directly via WhatsApp", "Pesan langsung via WhatsApp")}</li>
              <li>
                ✓ &nbsp;{T("Admin confirms availability", "Admin mengonfirmasi ketersediaan")}
              </li>
              <li>✓ &nbsp;{T("Child ticket for ages 4–9", "Harga khusus anak usia 4–9")}</li>
            </ul>
          </div>
          <div className="booking-form">
            <label className="field-label" htmlFor="booking-name">
              {T("YOUR NAME", "NAMA ANDA")}
            </label>
            <input
              id="booking-name"
              type="text"
              autoComplete="name"
              className={invalidField === "name" ? "invalid-field" : ""}
              aria-invalid={invalidField === "name"}
              aria-describedby={
                invalidField === "name" ? "booking-notice" : undefined
              }
              placeholder={T("Name for this booking", "Nama untuk pemesanan")}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setInvalidField(null);
                setNotice("");
              }}
            />
            <div className="session-picker ticket-picker">
              <span className="field-label">
                {T("CHOOSE YOUR TICKET", "PILIH JENIS TIKET")}
              </span>
              <div className="session-options">
                <button
                  type="button"
                  className={
                    ticketType === "show"
                      ? "session-option active"
                      : "session-option"
                  }
                  aria-pressed={ticketType === "show"}
                  onClick={() => setTicketType("show")}
                >
                  <strong>{T("Kecak Fire Dance", "Kecak Fire Dance")}</strong>
                  <small>
                    {T("Performance ticket only", "Tiket pertunjukan saja")}
                  </small>
                </button>
                <button
                  type="button"
                  className={
                    ticketType === "combo"
                      ? "session-option active"
                      : "session-option"
                  }
                  aria-pressed={ticketType === "combo"}
                  onClick={() => setTicketType("combo")}
                >
                  <strong>
                    {T(
                      "Kecak + Temple Entrance",
                      "Kecak + Tiket Entrance Pura",
                    )}
                  </strong>
                  <small>
                    {T(
                      "Performance and temple entry",
                      "Pertunjukan dan tiket masuk pura",
                    )}
                  </small>
                </button>
              </div>
            </div>
            <label className="field-label date-label" htmlFor="date">
              {T("PERFORMANCE DATE", "TANGGAL PERTUNJUKAN")}
            </label>
            <input
              id="date"
              type="date"
              className={invalidField === "date" ? "invalid-field" : ""}
              aria-invalid={invalidField === "date"}
              aria-describedby={
                invalidField === "date"
                  ? "booking-date-policy booking-notice"
                  : "booking-date-policy"
              }
              min={minimumBookingDate}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (e.target.value) setInvalidField(null);
                setNotice("");
              }}
            />
            <p
              id="booking-date-policy"
              className={sameDayBookingOpen ? "date-policy" : "date-policy date-policy-closed"}
              aria-live="polite"
            >
              <span aria-hidden="true">◷</span>{" "}
              {sameDayBookingOpen
                ? T(
                    "Same-day booking cutoff: 12:00 PM Bali time (WITA, UTC+8).",
                    "Batas pemesanan hari ini: pukul 12.00 waktu Bali (WITA, UTC+8).",
                  )
                : T(
                    "Same-day booking has closed. The earliest available date is tomorrow (Bali time, WITA, UTC+8).",
                    "Pemesanan hari ini sudah ditutup. Tanggal paling awal yang tersedia adalah besok (waktu Bali, WITA, UTC+8).",
                  )}
            </p>
            <div className="session-picker">
              <span className="field-label">
                {T("CHOOSE A SESSION", "PILIH SESI")}
              </span>
              <div
                className="session-options"
                role="radiogroup"
                aria-label={T(
                  "Choose a performance session",
                  "Pilih sesi pertunjukan",
                )}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={session === 1}
                  className={
                    session === 1 ? "session-option active" : "session-option"
                  }
                  onClick={() => setSession(1)}
                >
                  <strong>{T("Session 1", "Sesi 1")}</strong>
                  <small>18.00–19.00 WITA</small>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={session === 2}
                  className={
                    session === 2 ? "session-option active" : "session-option"
                  }
                  onClick={() => setSession(2)}
                >
                  <strong>{T("Session 2", "Sesi 2")}</strong>
                  <small>19.00–20.00 WITA</small>
                </button>
              </div>
            </div>
            <div className="session-hint">
              {T(
                "Arrive 45 minutes before your selected session.",
                "Silakan tiba 45 menit sebelum sesi pilihan Anda.",
              )}
            </div>
            <div className="price-guide" aria-live="polite">
              <div className="booking-price-heading">
                <strong>{T("YOUR PRICE", "HARGA TIKET")}</strong>
                <span>{T("Per person", "Per orang")}</span>
              </div>
              <div className="booking-rate-grid">
                <div className="booking-rate">
                  <span>{T("ADULT", "DEWASA")}</span>
                  <strong>{money(adultPrice)}</strong>
                </div>
                <div className="booking-rate">
                  <span>{T("CHILD · AGES 4–9", "ANAK · USIA 4–9")}</span>
                  <strong>{money(childPrice)}</strong>
                </div>
              </div>
            </div>
            {guestRows.map(({ label, hint, count, setCount, min }) => (
              <div className="guest" key={label}>
                <div>
                  <label className="field-label">{label}</label>
                  <small>{hint}</small>
                </div>
                <div className="stepper">
                  <button
                    aria-label={T("Remove ", "Kurangi ") + label}
                    onClick={() => setCount(Math.max(min, count - 1))}
                  >
                    −
                  </button>
                  <span>{count}</span>
                  <button
                    aria-label={T("Add ", "Tambah ") + label}
                    onClick={() => setCount(Math.min(100, count + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}

            <div className="total">
              <span>{T("Estimated total", "Perkiraan total")}</span>
              <strong>{money(total)}</strong>
            </div>
            <button className="button dark full" onClick={book}>
              {T("Continue to booking", "Lanjutkan pemesanan")} <span>→</span>
            </button>
            {notice && (
              <p id="booking-notice" className="notice" role="status">
                {notice}
              </p>
            )}
            <p className="fine">
              {ticketType === "combo"
                ? T(
                    "Includes performance and temple entrance tickets.",
                    "Termasuk tiket pertunjukan dan tiket masuk pura.",
                  )
                : T(
                    "Performance ticket only · temple entry paid separately at the gate.",
                    "Tiket pertunjukan saja · tiket masuk pura dibayar terpisah di gerbang.",
                  )}
            </p>
          </div>
        </div>
      </section>
      <section className="section faq" id="faq">
        <div>
          <label>{T("A FEW THINGS TO KNOW", "YANG PERLU DIKETAHUI")}</label>
          <h2>
            {T("Good questions.", "Pertanyaan penting.")}
            <br />
            <i>{T("Clear answers.", "Jawaban jelas.")}</i>
          </h2>
          <p>
            {T("Still curious?", "Masih ada pertanyaan?")}{" "}
            <a href={contactLink} target="_blank" rel="noreferrer">
              {T("Chat with us on WhatsApp", "Hubungi kami via WhatsApp")} ↗
            </a>
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <article key={q}>
              <button
                aria-expanded={faq === i}
                onClick={() => setFaq(faq === i ? null : i)}
              >
                {q}
                <span>{faq === i ? "−" : "+"}</span>
              </button>
              {faq === i && <p>{a}</p>}
            </article>
          ))}
        </div>
      </section>
      <section className="final">
        <label>{T("THE SUNSET IS WAITING", "SENJA MENANTI")}</label>
        <h2>
          {T("Save your seat", "Amankan tempat Anda")}
          <br />
          <i>{T("in the circle.", "di lingkaran Kecak.")}</i>
        </h2>
        <p>
          {T(
            "Small moments. Ancient stories. A Bali night you'll carry home.",
            "Momen sederhana. Kisah kuno. Malam di Bali yang akan selalu dikenang.",
          )}
        </p>
        <a className="button gold" href="#booking">
          {T("Choose your date", "Pilih tanggal")} ↑
        </a>
      </section>
      <footer>
        <a className="brand" href="#home">
          <b>U</b>
          <span>
            ULUWATU <em>KECAK</em>
            <small>THE SUNSET EXPERIENCE</small>
          </span>
        </a>
        <p>
          {T(
            "A cultural evening at the edge of Bali.",
            "Malam budaya di tepi Bali.",
          )}
        </p>
        <nav>
          <a href="#experience">{T("Experience", "Pengalaman")}</a>
          <a href="#visit">{T("Visit", "Kunjungan")}</a>
          <a href="#faq">{T("FAQ", "Tanya jawab")}</a>
          <a href={contactLink} target="_blank" rel="noreferrer">
            WhatsApp · +62 857 5554 9787 ↗
          </a>
        </nav>
        <small className="copyright">
          {T(
            "© 2026 Uluwatu Kecak · Made with respect for Bali",
            "© 2026 Uluwatu Kecak · Dibuat dengan menghormati Bali",
          )}
        </small>
        <div className="photo-credits">
          {T(
            "Photography, cropped for layout:",
            "Foto, dipotong untuk tata letak:",
          )}{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Balinese_performers_01.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Balinese performers · Andamy
          </a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
          ,{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Kecak_fire_dance_at_sunset.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Kecak sunset · Krisdenna
          </a>
          ,{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Kecak_and_Fire_Dance_at_Uluwatu.jpg" target="_blank" rel="noreferrer">Kecak and Fire Dance · David Santiago Cano Salazar</a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>
          ,{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Balinese_Kecak_dance_with_Hanuman_in_a_ring_of_fire.jpg"
            target="_blank"
            rel="noreferrer"
          >
            White Hanuman in the fire ring · Raymonst3
          </a>
          ,{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Sunset_Over_Pecatu.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Uluwatu · Ken Kevin
          </a>
          ,{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Ramayana_Kecak_Dance_Performance_after_sunset.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Ramayana Kecak after sunset · Johannnindito Adisuryo
          </a>
          ,{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Hanuman_playing_with_the_fire.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Hanuman · Johannnindito Adisuryo
          </a>
          ,{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Hanuman_on_fire_Kecak_Dance_Pura_Luhur_Uluwatu.jpg" target="_blank" rel="noreferrer">Hanuman on fire · Rollan Budi</a>
          ,{" "}
          <a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noreferrer">CC BY-SA 2.0</a>{" "}
          ·{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY-SA 4.0
          </a>
        </div>
      </footer>
      {modal && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => setModal(false)}
            >
              ×
            </button>
            <label>{T("YOUR SUNSET EVENING", "MALAM SENJA ANDA")}</label>
            <h2 id="modal-title">
              {T("You're almost", "Sedikit lagi")}
              <br />
              <i>{T("in the circle.", "di lingkaran Kecak.")}</i>
            </h2>
            <div className="summary">
              <span>
                {T("NAME", "NAMA")} <b>{name.trim()}</b>
              </span>
              <span>
                {T("DATE", "TANGGAL")}{" "}
                <b>
                  {new Date(date + "T12:00:00").toLocaleDateString(
                    lang === "id" ? "id-ID" : "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </b>
              </span>
              <span>
                {T("SESSION", "SESI")}{" "}
                <b>
                  {lang === "en"
                    ? session === 1
                      ? "6:00–7:00 PM WITA"
                      : "7:00–8:00 PM WITA"
                    : session === 1
                      ? "18.00–19.00 WITA"
                      : "19.00–20.00 WITA"}
                </b>
              </span>
              <span>
                {T("TICKET TYPE", "JENIS TIKET")}{" "}
                <b>
                  {ticketType === "combo"
                    ? T(
                        "Kecak + Temple Entrance",
                        "Kecak + Tiket Entrance Pura",
                      )
                    : T("Kecak Fire Dance", "Kecak Fire Dance")}
                </b>
              </span>
              <span>
                {T("GUESTS", "TAMU")}{" "}
                <b>
                  {adults}{" "}
                  {lang === "en" ? "adult" + (adults > 1 ? "s" : "") : "dewasa"}
                  {kids > 0
                    ? " · " +
                      kids +
                      " " +
                      (lang === "en"
                        ? "child" + (kids > 1 ? "ren" : "")
                        : "anak")
                    : ""}
                </b>
              </span>
              <span>
                {T("TICKETS", "TIKET")} <b>{money(total)}</b>
              </span>
            </div>
            <p className="demo">
              {T(
                "The admin will confirm availability and payment details with you on WhatsApp.",
                "Admin akan mengonfirmasi ketersediaan dan detail pembayaran melalui WhatsApp.",
              )}
            </p>
            <a
              className="button dark full"
              href={waLink}
              target="_blank"
              rel="noreferrer"
              onClick={() => setModal(false)}
            >
              {T("Chat admin on WhatsApp", "Chat admin via WhatsApp")}{" "}
              <span>↗</span>
            </a>
          </section>
        </div>
      )}
    </main>
  );
}
