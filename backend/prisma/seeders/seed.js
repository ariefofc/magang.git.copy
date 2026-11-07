const prisma = require('../../src/prisma');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  const users = [
    {
      name: 'Super Admin MS Harmony',
      email: 'superadmin@msharmony.id',
      role: 'super_admin',
      password: await bcrypt.hash('SuperAdmin123!', 10),
    },
    {
      name: 'Admin MS Harmony',
      email: 'admin@msharmony.id',
      role: 'admin',
      password: await bcrypt.hash('Admin123!', 10),
    },
    {
      name: 'Owner MS Harmony',
      email: 'owner@msharmony.id',
      role: 'owner',
      password: await bcrypt.hash('Owner123!', 10),
    },
    {
      name: 'Arief Harmoni',
      email: 'ariefharmoni@gmail.com',
      role: 'admin',
      password: await bcrypt.hash('Harmoni123', 10),
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }

  console.log('✅ UserSeeder: 4 akun berhasil dibuat/diperbarui.');
}

async function seedKebaya() {
  const katalog = [
    {
      slug: 'kebaya-modern-brukat-gown',
      nama: 'Kebaya Modern Brukat Gown',
      harga: 850000,
      stokMap: { XS: 1, S: 1, M: 2, L: 1, XL: 1, XXL: 1 }, // Total: 7
      foto: 'Kebaya Modern Brukat Gown.png',
      fotoBelakang: 'Kebaya Modern Brukat Gown-belakang.jpg',
      deskripsi: 'Gaun modern brokat premium dengan siluet elegan dan aksen mewah bergaya tinggi.',
      kainUtama: 'Brokat Chantilly Perancis & Soft Tulle',
      furing: 'Katun Hero Super (Adem & Menyerap Keringat)',
      karakteristikKain: 'Tekstur sangat lembut, drape jatuh anggun, bertekstur empuk, tidak gatal & tidak panas.',
      detailPayet: 'Payet Kristal Swarovski sintetik & Mutiara Jepang di leher & lingkar dada.',
      rekomendasiAcara: 'Resepsi Pernikahan, Wisuda, Gala Dinner, Evening Event',
      status: 'aktif',
    },
    {
      slug: 'kebaya-aurora-slit-gown',
      nama: 'Kebaya Aurora Slit Gown',
      harga: 900000,
      stokMap: { XS: 1, S: 1, M: 2, L: 1, XL: 1, XXL: 0 }, // Total: 6
      foto: 'Kebaya Aurora Slit Gown.png',
      fotoBelakang: 'Kebaya Aurora Slit Gown-belakang.jpg',
      deskripsi: 'Gaun aurora eksklusif belahan modern yang anggun untuk setiap momen spesial Anda.',
      kainUtama: 'Brokat Cornely High-Grade & Silk Satin Velvet',
      furing: 'Full Furing Silky Cotton',
      karakteristikKain: 'Tampilan mewah mengkilap elegan, elastisitas pas, belahan slit modern yang tetap sopan.',
      detailPayet: 'Aplikasi renda bordir 3D dengan payet tabur berkilau di pinggang & punggung.',
      rekomendasiAcara: 'Engagement / Lamaran, Event Red Carpet, Prewedding, Party',
      status: 'aktif',
    },
    {
      slug: 'kebaya-kartini-beludru',
      nama: 'Kebaya Kartini Beludru',
      harga: 750000,
      stokMap: { XS: 1, S: 2, M: 2, L: 1, XL: 1, XXL: 1 }, // Total: 8
      foto: 'Kebaya Kartini Beludru.png',
      fotoBelakang: 'Kebaya Kartini Beludru-belakang.jpg',
      deskripsi: 'Kebaya Kartini klasik berbahan beludru premium bernuansa royal penuh wibawa.',
      kainUtama: 'Beludru (Velvet) Silk Stretch Royal',
      furing: 'Lapisan Tricot Halus (Menjaga bentuk presisi)',
      karakteristikKain: 'Permukaan beludru lembut berkilau mewah, cukup fleksibel di badan, hangat & nyaman.',
      detailPayet: 'Bordir benang emas keraton di sepanjang kelim depan, lengan, dan kerah Kartini.',
      rekomendasiAcara: 'Acara Adat Jawa, Midodareni, Wisuda, Resepsi Keraton',
      status: 'aktif',
    },
    {
      slug: 'kebaya-kutubaru-klasik-batik',
      nama: 'Kebaya Kutubaru Klasik Batik',
      harga: 650000,
      stokMap: { XS: 1, S: 1, M: 2, L: 1, XL: 1, XXL: 0 }, // Total: 6
      foto: 'Kebaya Kutubaru Klasik Batik.png',
      fotoBelakang: 'Kebaya Kutubaru Klasik Batik-belakang.jpg',
      deskripsi: 'Kebaya kutubaru tradisional dipadu bawahan kain batik otentik khas Jawa Tengah.',
      kainUtama: 'Katun Jacquard Emboss (Atasan) & Batik Tulis Solo (Bawahan)',
      furing: 'Katun Prima Adem 100% Cotton',
      karakteristikKain: 'Sangat sejuk, ringan, mudah bergerak, serat kain katun bernafas baik.',
      detailPayet: 'Kutubaru klasik dengan kancing bungkus rapi & bros etnik benang emas.',
      rekomendasiAcara: 'Hari Kartini, Wisuda, Upacara Adat, Acara Formal Kebudayaan',
      status: 'aktif',
    },
    {
      slug: 'kebaya-encim-peranakan',
      nama: 'Kebaya Encim Peranakan',
      harga: 600000,
      stokMap: { XS: 1, S: 1, M: 1, L: 1, XL: 1, XXL: 0 }, // Total: 5
      foto: 'Kebaya Encim Peranakan.png',
      fotoBelakang: 'Kebaya Encim Peranakan-belakang.jpg',
      deskripsi: 'Kebaya encim klasik berhias bordir halus nan cantik khas budaya Peranakan.',
      kainUtama: 'Katun Voile Silky Premium',
      furing: 'Unlined / Tanpa Furing Tebal',
      karakteristikKain: 'Kain katun halus, serat rapat, sejuk dipakai di cuaca hangat & iklim tropis.',
      detailPayet: 'Bordir keranjang & flora buatan tangan di sepanjang tepi bawah.',
      rekomendasiAcara: 'Kebaya Encim Day, Sangjit, Festival Budaya, Acara Semi-Formal',
      status: 'aktif',
    },
    {
      slug: 'kebaya-peplum-brokat',
      nama: 'Kebaya Peplum Brokat',
      harga: 700000,
      stokMap: { XS: 1, S: 1, M: 2, L: 1, XL: 1, XXL: 0 }, // Total: 6
      foto: 'Kebaya Peplum Brokat.png',
      fotoBelakang: 'Kebaya Peplum Brokat-belakang.jpg',
      deskripsi: 'Kebaya peplum feminin berhias renda brokat pilihan cocok untuk momen wisuda.',
      kainUtama: 'Brokat Tile Semi-Perancis & Organza Premium',
      furing: 'Furing Satin Maxmara Silk',
      karakteristikKain: 'Struktur peplum mengembang anggun di pinggang, memberi siluet tubuh ramping & tinggi.',
      detailPayet: 'Renda Guipure melingkar di pinggang & payet mutiara sintetis di pergelangan lengan.',
      rekomendasiAcara: 'Wisuda Universitas, Pengajian Formal, Kondangan, Syukuran',
      status: 'aktif',
    },
    {
      slug: 'kebaya-songket-palembang',
      nama: 'Kebaya Songket Palembang',
      harga: 800000,
      stokMap: { XS: 0, S: 1, M: 1, L: 1, XL: 1, XXL: 0 }, // Total: 4
      foto: 'Kebaya Songket Palembang.jpg',
      fotoBelakang: 'Kebaya Songket Palembang-belakang.jpg',
      deskripsi: 'Kebaya mewah dengan kain songket Palembang asli bermotif emas yang indah memukau.',
      kainUtama: 'Tenun Songket Palembang Benang Emas & Taffeta Silk',
      furing: 'Tricot & Full Furing Asahi Silky',
      karakteristikKain: 'Tekstur kain tegas & bermotif timbul emas megah, sangat mewah dan regal.',
      detailPayet: 'Motif Songket Lepus benang emas otentik dengan hiasan bros dada khas Sumatera.',
      rekomendasiAcara: 'Resepsi Pernikahan Adat Sumatera, Akad Nikah, Gala Dinner VIP',
      status: 'aktif',
    },
    {
      slug: 'kebaya-sutra-solo',
      nama: 'Kebaya Sutra Solo',
      harga: 950000,
      stokMap: { XS: 1, S: 1, M: 2, L: 1, XL: 0, XXL: 0 }, // Total: 5
      foto: 'Kebaya Sutra Solo.jpg',
      fotoBelakang: 'Kebaya Sutra Solo-belakang.jpg',
      deskripsi: 'Kebaya sutra pilihan khas Solo dengan tekstur lembut dan tampilan sangat elegan.',
      kainUtama: '100% Sutra Alam Solo (Natural Silk Premium)',
      furing: 'Sutra Habutai Furing',
      karakteristikKain: 'Super halus, kilau sutra alami memukau, jatuh sangat mengalir (flowy), sangat sejuk.',
      detailPayet: 'Hand-painted motif batik sutra halus dengan aksen sentuhan prada emas tipis.',
      rekomendasiAcara: 'Royal Wedding Guest, VIP Official Reception, Gala Night',
      status: 'aktif',
    },
    {
      slug: 'kebaya-batik-tulis-jawa',
      nama: 'Kebaya Batik Tulis Jawa',
      harga: 720000,
      stokMap: { XS: 0, S: 1, M: 1, L: 1, XL: 1, XXL: 0 }, // Total: 4
      foto: 'Kebaya Kutubaru Klasik Batik.png',
      fotoBelakang: 'Kebaya Kutubaru Klasik Batik-belakang.jpg',
      deskripsi: 'Kebaya berbahan dasar batik tulis tangan bermotif Jawa klasik yang otentik.',
      kainUtama: 'Katun Primissima Batik Tulis',
      furing: 'Katun Hero Super',
      karakteristikKain: 'Halus, berbobot mantap, pewarnaan malam alami khas batik klasik Jawa.',
      detailPayet: 'Motif batik tulis Parang Gurdo tradisional dengan sentuhan kerah modern.',
      rekomendasiAcara: 'Acara Resmi Kebudayaan, Seminar Nasional, Event Diplomatik',
      status: 'aktif',
    },
    {
      slug: 'kebaya-brokat-evening',
      nama: 'Kebaya Brokat Evening',
      harga: 1000000,
      stokMap: { XS: 1, S: 1, M: 1, L: 1, XL: 0, XXL: 0 }, // Total: 4
      foto: 'Kebaya Modern Brukat Gown.png',
      fotoBelakang: 'Kebaya Modern Brukat Gown-belakang.jpg',
      deskripsi: 'Kebaya eksklusif untuk gala malam formal dengan material brokat premium pilihan.',
      kainUtama: 'Heavy French Corded Lace & Crepe Silk',
      furing: 'Full Satin Silk',
      karakteristikKain: 'Kain bertekstur tegas, pembentukan pola presisi, berkilau di bawah lampu malam.',
      detailPayet: 'Full payet jepang di sekeliling bodice dan lengan.',
      rekomendasiAcara: 'Gala Night Dinner, Awarding Night, Formal Party',
      status: 'aktif',
    },
    {
      slug: 'kebaya-tenun-ntt',
      nama: 'Kebaya Tenun NTT',
      harga: 680000,
      stokMap: { XS: 0, S: 1, M: 1, L: 1, XL: 0, XXL: 0 }, // Total: 3
      foto: 'Kebaya Songket Palembang.jpg',
      fotoBelakang: 'Kebaya Songket Palembang-belakang.jpg',
      deskripsi: 'Kebaya tenun ikat asli dari Nusa Tenggara Timur penuh warna dan kekayaan budaya.',
      kainUtama: 'Tenun Ikat Handwoven NTT',
      furing: 'Katun Prima',
      karakteristikKain: 'Tenunan benang katun tebal bermotif etnik khas pulau NTT.',
      detailPayet: 'Pewarnaan benang alami dengan garis tenun etnik kontras.',
      rekomendasiAcara: 'Festival Etnik, Pameran Seni, Acara Kebudayaan',
      status: 'aktif',
    },
    {
      slug: 'kebaya-batik-madura',
      nama: 'Kebaya Batik Madura',
      harga: 600000,
      stokMap: { XS: 1, S: 1, M: 1, L: 1, XL: 1, XXL: 0 }, // Total: 5
      foto: 'Kebaya Encim Peranakan.png',
      fotoBelakang: 'Kebaya Encim Peranakan-belakang.jpg',
      deskripsi: 'Kebaya khas Madura motif batik cerah penuh semangat.',
      kainUtama: 'Katun Bergas Batik Madura Pesisiran',
      furing: 'Katun Adem',
      karakteristikKain: 'Katun tebal sejuk dengan perpaduan warna berani khas pesisir Madura.',
      detailPayet: 'Motif flora fauna Madura bergaris tegas.',
      rekomendasiAcara: 'Acara Santai Formal, Festival Seni, Parade Busana Etnik',
      status: 'aktif',
    },
    {
      slug: 'kebaya-bordiran-sumatera',
      nama: 'Kebaya Bordiran Sumatera',
      harga: 750000,
      stokMap: { XS: 0, S: 1, M: 1, L: 1, XL: 1, XXL: 0 }, // Total: 4
      foto: 'Kebaya Kartini Beludru.png',
      fotoBelakang: 'Kebaya Kartini Beludru-belakang.jpg',
      deskripsi: 'Kebaya Sumatera berhias bordiran tangan benang emas.',
      kainUtama: 'Katun Balotelli Premium & Benang Emas Metallic',
      furing: 'Furing Katun',
      karakteristikKain: 'Bordir tebal benang emas di atas kain bertekstur struktural.',
      detailPayet: 'Bordiran tangan motif suji caia khas Sumatera.',
      rekomendasiAcara: 'Resepsi Pernikahan, Acara Adat Sumatera, Perayaan Resmi',
      status: 'aktif',
    },
  ];

  for (const item of katalog) {
    const totalStok = Object.values(item.stokMap).reduce((a, b) => a + b, 0);
    const { stokMap, ...data } = item;
    data.stok = totalStok;
    data.stokPerUkuran = JSON.stringify(stokMap);

    const kebaya = await prisma.kebaya.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    for (const [uk, count] of Object.entries(stokMap)) {
      await prisma.kebayaUkuran.upsert({
        where: { kebayaId_ukuran: { kebayaId: kebaya.id, ukuran: uk } },
        update: { stok: count },
        create: { kebayaId: kebaya.id, ukuran: uk, stok: count },
      });
    }
  }

  console.log(`✅ KebayaSeeder: ${katalog.length} kebaya beserta stok per ukuran berhasil dibuat/diperbarui.`);
}

async function seedTransaksi() {
  // Clear existing dummy transactions so tests start fresh and clean
  await prisma.transaksiSewa.deleteMany({});

  const allKebayas = await prisma.kebaya.findMany({ orderBy: { id: 'asc' } });
  if (allKebayas.length === 0) {
    console.log('⚠️ Belum ada kebaya di database. Pastikan seedKebaya() dijalankan terlebih dahulu.');
    return;
  }

  const kebayaMap = {};
  allKebayas.forEach((k) => {
    kebayaMap[k.slug] = k;
  });

  const namaCustomer = [
    'Anisa Rahmawati', 'Berliana Putri', 'Cindy Maharani', 'Desy Kartika',
    'Elisa Wulandari', 'Fina Kusuma', 'Gilang Permata', 'Hana Safitri',
    'Indah Lestari', 'Julia Maulida', 'Kirana Salsabila', 'Layla Nur Azizah',
    'Maya Sari', 'Nadia Fitriani', 'Olivia Santoso', 'Putri Cahayani',
    'Qory Andriani', 'Rara Kencana', 'Sinta Dewi', 'Tiara Agustin',
    'Ulfa Ramadhani', 'Vira Oktaviani', 'Wulan Septiana', 'Xena Anggraini',
    'Yuli Prasetya', 'Zara Maullana', 'Aulia Hamidah', 'Bella Indriani',
    'Cahya Melati', 'Dwi Lestariningsih',
  ];

  const noWaList = [
    '081234567890', '082345678901', '083456789012', '084567890123',
    '085678901234', '086789012345', '087890123456', '088901234567',
    '089012345678', '081123456789', '082234567890', '083345678901',
    '084456789012', '085567890123', '086678901234', '087789012345',
  ];

  const alamatList = [
    'Jl. Magelang No. 12, Sleman, DIY',
    'Jl. Parangtritis Km 5, Bantul, DIY',
    'Jl. Godean Raya No. 34, Sleman, DIY',
    'Perumahan Griyo Ageng Blok B5, Bangunjiwo, Bantul',
    'Jl. Veteran No. 8, Kota Yogyakarta',
    'Jl. Affandi No. 20, Sleman, DIY',
    'Kledokan RT 03, Depok, Sleman, DIY',
    'Jl. Wates Km 7, Gamping, Sleman',
    'Jl. Solo Km 10, Kalasan, Sleman',
    'Jl. Kaliurang Km 12, Ngaglik, Sleman',
    'Maguwoharjo, Depok, Sleman',
    'Jl. Ring Road Utara No. 5, Sleman',
  ];

  const skemaList = ['DP 50%', 'DP 70%', 'Lunas 100%'];
  const metodeList = ['QRIS', 'Transfer Bank BCA', 'Transfer Bank BRI', 'Transfer Bank Mandiri', 'COD'];

  const now = new Date();
  const dOffset = (days) => {
    const d = new Date(now.getTime() + days * 86400000);
    return d.toISOString().slice(0, 10);
  };

  // Structured test scenarios for dynamic size-specific availability
  const batches = [
    // ══════════════════════════════════════════════════════════════
    // SCENARIO 1 (Requirement 2):
    // Kebaya Modern Brukat Gown on dOffset(3) to dOffset(5):
    // Size M has total stock = 2. Book BOTH size M -> Size M is FULL BOOKED!
    // Size L, S, XS, XL, XXL have 0 bookings -> AVAILABLE!
    // ══════════════════════════════════════════════════════════════
    [dOffset(0), dOffset(3), dOffset(5), 'Telah Dikonfirmasi', true, 'DP 50%', 'kebaya-modern-brukat-gown', 'M', 'Anisa Rahmawati'],
    [dOffset(0), dOffset(3), dOffset(5), 'Sedang Fitting', true, 'DP 70%', 'kebaya-modern-brukat-gown', 'M', 'Berliana Putri'],

    // Also rent size XS today to test single size booking
    [dOffset(-2), dOffset(-1), dOffset(1), 'Kebaya Telah Diambil', true, 'DP 70%', 'kebaya-modern-brukat-gown', 'XS', 'Cindy Maharani'],

    // ══════════════════════════════════════════════════════════════
    // SCENARIO 2 (Requirement 3):
    // Kebaya Aurora Slit Gown on dOffset(2) to dOffset(4):
    // Sizes XS, S, L, XL are ALL booked. XXL is 0 stock.
    // ONLY size M is remaining!
    // Result: onlyRemainingSize = 'M' ("Tersedia tinggal ukuran M saja!")
    // ══════════════════════════════════════════════════════════════
    [dOffset(-1), dOffset(2), dOffset(4), 'Telah Dikonfirmasi', true, 'Lunas 100%', 'kebaya-aurora-slit-gown', 'XS', 'Desy Kartika'],
    [dOffset(-1), dOffset(2), dOffset(4), 'Telah Dikonfirmasi', true, 'DP 50%', 'kebaya-aurora-slit-gown', 'S', 'Elisa Wulandari'],
    [dOffset(-1), dOffset(2), dOffset(4), 'Sedang Fitting', true, 'DP 70%', 'kebaya-aurora-slit-gown', 'L', 'Fina Kusuma'],
    [dOffset(-1), dOffset(2), dOffset(4), 'Menunggu Konfirmasi', true, 'DP 50%', 'kebaya-aurora-slit-gown', 'XL', 'Gilang Permata'],

    // ══════════════════════════════════════════════════════════════
    // SCENARIO 3:
    // Kebaya Peplum Brokat on dOffset(0) to dOffset(1) (Today & Tomorrow):
    // Rent all sizes (XS, S, M (x2), L, XL) -> ALL SIZES FULL BOOKED!
    // ══════════════════════════════════════════════════════════════
    [dOffset(-2), dOffset(0), dOffset(1), 'Kebaya Telah Diambil', true, 'Lunas 100%', 'kebaya-peplum-brokat', 'XS', 'Hana Safitri'],
    [dOffset(-2), dOffset(0), dOffset(2), 'Sedang Fitting', true, 'DP 70%', 'kebaya-peplum-brokat', 'S', 'Indah Lestari'],
    [dOffset(-1), dOffset(0), dOffset(2), 'Telah Dikonfirmasi', true, 'DP 50%', 'kebaya-peplum-brokat', 'M', 'Julia Maulida'],
    [dOffset(-1), dOffset(0), dOffset(2), 'Menunggu Fitting', true, 'DP 50%', 'kebaya-peplum-brokat', 'M', 'Kirana Salsabila'],
    [dOffset(0), dOffset(0), dOffset(1), 'Kebaya Telah Diambil', true, 'DP 50%', 'kebaya-peplum-brokat', 'L', 'Layla Nur Azizah'],
    [dOffset(0), dOffset(0), dOffset(2), 'Telah Dikonfirmasi', true, 'DP 50%', 'kebaya-peplum-brokat', 'XL', 'Maya Sari'],

    // ══════════════════════════════════════════════════════════════
    // SCENARIO 4:
    // Kebaya Songket Palembang (stok: S:1, M:1, L:1, XL:1):
    // Rent S, L, XL today. Size M is the ONLY ONE remaining today!
    // ══════════════════════════════════════════════════════════════
    [dOffset(-1), dOffset(0), dOffset(2), 'Sedang Fitting', true, 'DP 70%', 'kebaya-songket-palembang', 'S', 'Nadia Fitriani'],
    [dOffset(-2), dOffset(-1), dOffset(1), 'Kebaya Telah Diambil', true, 'Lunas 100%', 'kebaya-songket-palembang', 'L', 'Olivia Santoso'],
    [dOffset(0), dOffset(0), dOffset(2), 'Menunggu Konfirmasi', true, 'DP 50%', 'kebaya-songket-palembang', 'XL', 'Putri Cahayani'],

    // ══════════════════════════════════════════════════════════════
    // SCENARIO 5:
    // Kebaya Sutra Solo on dOffset(1) to dOffset(3) (Tomorrow):
    // Rent both size M (2 units) -> Size M is FULL BOOKED tomorrow!
    // Sizes XS, S, L remain AVAILABLE tomorrow!
    // ══════════════════════════════════════════════════════════════
    [dOffset(0), dOffset(1), dOffset(3), 'Telah Dikonfirmasi', true, 'Lunas 100%', 'kebaya-sutra-solo', 'M', 'Qory Andriani'],
    [dOffset(0), dOffset(1), dOffset(3), 'Sedang Fitting', true, 'DP 70%', 'kebaya-sutra-solo', 'M', 'Rara Kencana'],

    // ══════════════════════════════════════════════════════════════
    // HISTORICAL COMPLETED / CANCELLED RENTALS FOR REPORTS & LOGS
    // ══════════════════════════════════════════════════════════════
    [dOffset(-40), dOffset(-38), dOffset(-36), 'Telah Dikembalikan', true, 'DP 50%', 'kebaya-modern-brukat-gown', 'M', 'Sinta Dewi'],
    [dOffset(-35), dOffset(-33), dOffset(-31), 'Telah Dikembalikan', true, 'Lunas 100%', 'kebaya-aurora-slit-gown', 'S', 'Tiara Agustin'],
    [dOffset(-30), dOffset(-28), dOffset(-26), 'Telah Dikembalikan', true, 'DP 70%', 'kebaya-kartini-beludru', 'L', 'Ulfa Ramadhani'],
    [dOffset(-25), dOffset(-23), dOffset(-21), 'Telah Dikembalikan', true, 'DP 50%', 'kebaya-kutubaru-klasik-batik', 'M', 'Vira Oktaviani'],
    [dOffset(-20), dOffset(-18), dOffset(-16), 'Telah Dikembalikan', true, 'Lunas 100%', 'kebaya-encim-peranakan', 'M', 'Wulan Septiana'],
    [dOffset(-18), dOffset(-16), dOffset(-14), 'Dibatalkan', false, 'DP 50%', 'kebaya-peplum-brokat', 'S', 'Xena Anggraini'],
    [dOffset(-15), dOffset(-13), dOffset(-11), 'Telah Dikembalikan', true, 'DP 70%', 'kebaya-songket-palembang', 'M', 'Yuli Prasetya'],
    [dOffset(-12), dOffset(-10), dOffset(-8), 'Telah Dikembalikan', true, 'Lunas 100%', 'kebaya-sutra-solo', 'M', 'Zara Maullana'],
    [dOffset(-10), dOffset(-8), dOffset(-6), 'Telah Dikembalikan', true, 'DP 50%', 'kebaya-batik-tulis-jawa', 'L', 'Aulia Hamidah'],
    [dOffset(-8), dOffset(-6), dOffset(-4), 'Telah Dikembalikan', true, 'DP 70%', 'kebaya-brokat-evening', 'M', 'Bella Indriani'],
  ];

  const crypto = require('crypto');
  let idx = 0;

  for (const [createdStr, sewaStr, kembaliStr, status, sudahBayar, skema, slug, ukuran, custName] of batches) {
    const kebaya = kebayaMap[slug] || allKebayas[0];
    const created = new Date(createdStr + 'T10:00:00.000Z');
    const sewa = new Date(sewaStr + 'T00:00:00.000Z');
    const kembali = new Date(kembaliStr + 'T23:59:59.000Z');
    const durasi = Math.max(1, Math.ceil((kembali - sewa) / (1000 * 60 * 60 * 24)));
    const totalHarga = kebaya.harga * durasi;
    const kode = 'TRX-' + crypto.createHash('md5').update(String(Date.now() + idx + Math.random())).digest('hex').substring(0, 8).toUpperCase();

    await prisma.transaksiSewa.create({
      data: {
        kodeTransaksi: kode,
        namaKebaya: kebaya.nama,
        warnaCustomAi: 'Default',
        namaUser: custName || namaCustomer[idx % namaCustomer.length],
        noWa: noWaList[idx % noWaList.length],
        ukuran: ukuran || 'M',
        metodePembayaran: metodeList[idx % metodeList.length],
        skemaBayar: skema,
        alamat: alamatList[idx % alamatList.length],
        tanggalSewa: sewa,
        tanggalPengembalian: kembali,
        durasiHari: durasi,
        status,
        totalHarga,
        sudahBayar,
        paymentStatus: sudahBayar ? 'paid' : 'pending',
        paidAt: sudahBayar ? created : null,
        jumlahDibayar: sudahBayar ? totalHarga : 0,
        createdAt: created,
      },
    });

    idx++;
  }

  console.log(`✅ TransaksiSeeder: ${idx} transaksi per-ukuran real-time & dinamis berhasil dibuat.`);
}

async function main() {
  console.log('🌱 Menjalankan seeder...');
  await seedUsers();
  await seedKebaya();
  await seedTransaksi();
  console.log('✅ Semua seeder selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
