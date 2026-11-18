import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { cfg, brandParts } from '../config'
import LiveChat from '../components/LiveChat'

const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })

const STEPS_SEWA = [
  {
    icon: (
      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Pilih Kebaya',
    desc: 'Jelajahi katalog koleksi kami dengan ketersediaan stok aktual dan tampak depan & belakang.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Isi Data Sewa',
    desc: 'Pilih ukuran busana, tentukan tanggal sewa dan pengembalian, serta lengkapi kontak.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Pembayaran Fleksibel',
    desc: 'Pilihan DP 50%, DP 70%, atau Lunas via QRIS, Transfer Bank, maupun Bayar di Tempat.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
      </svg>
    ),
    title: 'Fitting & Ambil',
    desc: 'Jadwalkan fitting di butik kami atau langsung ambil kebaya dalam kondisi siap pakai.',
  },
]

const SERVICES = [
  {
    icon: (
      <svg className="w-7 h-7 text-[#2C1A0E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21a4 4 0 01-4-4 5 5 0 014-4h4a5 5 0 014 4 4 4 0 01-4 4H7zm0 0a4 4 0 004-4v-1a5 5 0 00-5-5H6a5 5 0 00-5 5v1a4 4 0 004 4h2z" />
      </svg>
    ),
    title: 'Simulasi Warna Kain',
    desc: 'Visualisasikan kain kebaya dalam berbagai varian warna sebelum memesan.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#2C1A0E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'Konsultasi Live Chat',
    desc: 'Bantuan instan mengenai fitting, rekomendasi busana, dan FAQ operasional.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#2C1A0E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    title: 'Pembayaran QRIS & Bank',
    desc: 'Pembayaran digital terverifikasi otomatis dengan bukti transaksi sah.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#2C1A0E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Nota & Bukti Sewa Digital',
    desc: 'Invoice digital resmi lengkap dengan rincian jadwal sewa dan barcode status.',
  },
]

function KebayaCard({ k }) {
  const [showBack, setShowBack] = useState(false);
  const isFullToday = k.is_full_hari_ini || k.status_hari_ini === 'full';
  const isLimitedToday = !isFullToday && (k.status_hari_ini === 'limited' || (k.stok_hari_ini !== undefined && k.stok_hari_ini <= 1));
  const isAvailable = k.tersedia && !isFullToday;

  const isFullTomorrow = k.is_full_besok || k.status_besok === 'full';
  const isLimitedTomorrow = !isFullTomorrow && (k.status_besok === 'limited' || (k.stok_besok !== undefined && k.stok_besok <= 1));

  const currentImg = showBack && k.gambarBelakang ? k.gambarBelakang : k.gambar;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-stone-200/90 flex flex-col">
      <div className="relative overflow-hidden aspect-[3/4] bg-stone-100">
        <Link to={`/kebaya/${k.slug}`} className="block w-full h-full">
          <img
            src={currentImg || 'https://placehold.co/400x533/2C1A0E/fbbf24?text=Kebaya'}
            alt={k.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://placehold.co/400x533/2C1A0E/fbbf24?text=Kebaya' }}
          />
        </Link>

        {/* Top Floating Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {k.only_remaining_size_hari_ini ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-md animate-pulse border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-white shrink-0" />
              Sisa Ukuran {k.only_remaining_size_hari_ini} Saja!
            </span>
          ) : isFullToday ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white shadow-md">
              <span className="w-2 h-2 rounded-full bg-white" />
              Full Booked
            </span>
          ) : isLimitedToday ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Stok Menipis • Sisa {k.stok_hari_ini ?? k.stok_tersedia}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Tersedia • Sisa {k.stok_hari_ini ?? k.stok_tersedia}
            </span>
          )}

          {k.gambarBelakang && (
            <span className="text-[11px] font-medium bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-xs">
              {showBack ? 'Belakang' : 'Depan'}
            </span>
          )}
        </div>

        {/* Front / Back Toggle Buttons on Image */}
        {k.gambarBelakang && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1 rounded-lg shadow-md border border-stone-200">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBack(false); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition ${!showBack ? 'bg-[#2C1A0E] text-white' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Depan
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBack(true); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition ${showBack ? 'bg-[#2C1A0E] text-white' : 'text-stone-600 hover:text-stone-900'}`}
            >
              Belakang
            </button>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={`inline-flex items-center gap-1 font-semibold ${
              isFullToday ? 'text-red-600' : isLimitedToday ? 'text-amber-800' : 'text-emerald-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isFullToday ? 'bg-red-500' : isLimitedToday ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              Hari Ini: {isFullToday ? 'Penuh (0 slot)' : isLimitedToday ? `Menipis (Sisa ${k.stok_hari_ini ?? k.stok_tersedia})` : `Sisa ${k.stok_hari_ini ?? k.stok_tersedia} unit`}
            </span>
            <span className="text-stone-400">Total: {k.stok || 1} unit</span>
          </div>

          <div className="text-[11px] text-stone-500 mb-2 flex items-center gap-1">
            <span>Besok:</span>
            {isFullTomorrow ? (
              <span className="text-red-600 font-bold">Full Booked</span>
            ) : isLimitedTomorrow ? (
              <span className="text-amber-800 font-bold">Stok Menipis (Sisa {k.stok_besok ?? k.stok_tersedia} unit)</span>
            ) : (
              <span className="text-emerald-700 font-semibold">Tersedia (Sisa {k.stok_besok ?? k.stok_tersedia} unit)</span>
            )}
          </div>

          <Link to={`/kebaya/${k.slug}`}>
            <h3 className="font-bold text-[#2C1A0E] text-lg mb-1.5 hover:text-amber-700 transition truncate">{k.nama}</h3>
          </Link>
          <p className="text-stone-500 text-sm mb-4 line-clamp-2 leading-relaxed">{k.deskripsi || 'Kebaya premium berkualitas tinggi'}</p>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block uppercase tracking-wider font-semibold">Harga Sewa</span>
            <span className="text-amber-700 font-extrabold text-lg">{fmt.format(k.harga)}</span>
          </div>
          <Link
            to={`/kebaya/${k.slug}`}
            className="px-4 py-2 rounded-lg bg-[#2C1A0E] text-white text-xs font-bold hover:bg-[#3D2518] transition inline-flex items-center gap-1.5 shadow-sm"
          >
            Detail & Sewa
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Welcome() {
  const [kebayas, setKebayas] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    api.get('/kebaya').then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.kebaya ?? []
      setKebayas(list.map((k) => ({
        ...k,
        nama: k.nama_kebaya ?? k.nama,
        harga: k.harga_sewa_per_hari ?? k.harga,
        gambar: k.foto_url ?? k.gambar,
        gambarBelakang: k.foto_belakang_url ?? null,
        stok: k.stok ?? 1,
        stok_tersedia: k.stok_tersedia ?? 1,
        stok_hari_ini: k.stok_hari_ini ?? k.stok_tersedia ?? 1,
        stok_besok: k.stok_besok ?? k.stok_tersedia ?? 1,
        is_full_hari_ini: k.is_full_hari_ini ?? false,
        is_full_besok: k.is_full_besok ?? false,
        status_hari_ini: k.status_hari_ini ?? 'available',
        status_besok: k.status_besok ?? 'available',
        stok_per_ukuran: k.stok_per_ukuran ?? {},
        only_remaining_size_hari_ini: k.only_remaining_size_hari_ini ?? null,
        only_remaining_size_besok: k.only_remaining_size_besok ?? null,
        tersedia: k.tersedia ?? true,
      })))
    }).catch(() => {})
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const NAV = [
    { label: 'Beranda', id: 'hero' },
    { label: 'Koleksi', id: 'koleksi' },
    { label: 'Cara Sewa', id: 'cara-sewa' },
    { label: 'Tentang', id: 'tentang' },
  ]

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#2C1A0E]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <button onClick={() => scrollTo('hero')} className="text-xl font-bold tracking-wide text-white">
            {brandParts().first} <span className="text-amber-400">{brandParts().rest}</span>
          </button>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="text-sm text-stone-300 hover:text-amber-400 transition font-medium">{n.label}</button>
            ))}
            <Link to="/login" className="px-5 py-2 rounded-full bg-amber-400 text-[#2C1A0E] text-sm font-bold hover:bg-amber-500 transition">Login</Link>
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-2xl">&#9776;</button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-[#2C1A0E] border-t border-white/10 px-6 pb-4 space-y-3">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => scrollTo(n.id)} className="block w-full text-left text-stone-300 hover:text-amber-400 text-sm py-1">{n.label}</button>
            ))}
            <Link to="/login" className="block text-center px-5 py-2 rounded-full bg-amber-400 text-[#2C1A0E] text-sm font-bold">Login</Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="pt-28 pb-20 md:pt-40 md:pb-32 px-6 bg-gradient-to-b from-[#2C1A0E] via-[#3D2518] to-[#FAF8F5]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 font-semibold tracking-widest uppercase text-sm mb-4">{cfg.APP_TAGLINE}</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Keanggunan Kebaya,<br />Sentuhan <span className="text-amber-400">Modern</span>
          </h1>
          <p className="text-stone-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            {cfg.APP_DESCRIPTION}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => scrollTo('koleksi')} className="px-8 py-3 rounded-full bg-amber-400 text-[#2C1A0E] font-bold text-lg hover:bg-amber-500 shadow-lg shadow-amber-400/20 transition">
              Lihat Koleksi
            </button>
            <button onClick={() => scrollTo('cara-sewa')} className="px-8 py-3 rounded-full border-2 border-white/30 text-white font-semibold text-lg hover:border-amber-400 hover:text-amber-400 transition">
              Cara Sewa
            </button>
          </div>
        </div>
      </section>

      {/* ── Koleksi ── */}
      <section id="koleksi" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-semibold tracking-widest uppercase text-sm mb-2">Katalog</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C1A0E]">Koleksi Kebaya Kami</h2>
          </div>
          {kebayas.length === 0 ? (
            <p className="text-center text-stone-400 py-12">Memuat koleksi...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {kebayas.map((k) => (
                <KebayaCard key={k.slug || k.id} k={k} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Cara Sewa ── */}
      <section id="cara-sewa" className="py-20 px-6 bg-[#2C1A0E]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 font-semibold tracking-widest uppercase text-sm mb-2">Panduan</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Cara Sewa Kebaya</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS_SEWA.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-400/10 border-2 border-amber-400/80 flex items-center justify-center mx-auto mb-4">{s.icon}</div>
                <div className="text-amber-400 text-xs font-bold mb-2">STEP {i + 1}</div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-stone-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Layanan ── */}
      <section id="tentang" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-semibold tracking-widest uppercase text-sm mb-2">Layanan</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C1A0E]">Fitur Unggulan Kami</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center mx-auto mb-4">{s.icon}</div>
                <h3 className="font-bold text-[#2C1A0E] text-lg mb-2">{s.title}</h3>
                <p className="text-stone-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#2C1A0E] text-stone-400 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-bold text-white mb-3">{brandParts().first} <span className="text-amber-400">{brandParts().rest}</span></h3>
            <p className="text-sm leading-relaxed">Penyewaan kebaya premium untuk berbagai acara istimewa. Kualitas terbaik dengan harga terjangkau.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Kontak</h4>
            <p className="text-sm mb-1">WhatsApp: {cfg.CONTACT_WA}</p>
            <p className="text-sm mb-1">Email: {cfg.CONTACT_EMAIL}</p>
            <p className="text-sm">Instagram: {cfg.CONTACT_IG}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Alamat</h4>
            <p className="text-sm leading-relaxed">{cfg.STUDIO_ADDRESS}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-white/10 mt-10 pt-6 text-center text-xs text-stone-500">
          &copy; {new Date().getFullYear()} {cfg.APP_NAME} Kebaya Rental. All rights reserved.
        </div>
      </footer>

      {/* ── Live Chat ── */}
      <LiveChat />
    </div>
  )
}
