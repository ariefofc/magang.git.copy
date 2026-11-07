/**
 * KebayaService - Prisma-based with per-size dynamic stock and availability
 */
const prisma = require('../prisma');

const ACTIVE_RENTAL_STATUSES = [
  'Menunggu Pembayaran DP',
  'Menunggu Konfirmasi',
  'Telah Dikonfirmasi',
  'Menunggu Fitting',
  'Sedang Fitting',
  'Kebaya Telah Diambil',
  'Mengajukan Pengembalian',
];

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function classifySlotStatus(availableSlots, totalStock, isKebayaActive = true) {
  if (!isKebayaActive) return 'disabled';
  if (availableSlots <= 0) return 'full'; // Full Booked
  if (availableSlots <= 1 || (totalStock >= 4 && availableSlots <= 2)) return 'limited'; // Stok Menipis
  return 'available'; // Tersedia
}

function getStockMap(kebaya) {
  const map = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  if (Array.isArray(kebaya.stokUkuran) && kebaya.stokUkuran.length > 0) {
    kebaya.stokUkuran.forEach((su) => {
      if (su.ukuran) map[su.ukuran] = su.stok;
    });
    return map;
  }
  if (kebaya.stokPerUkuran) {
    try {
      const parsed = typeof kebaya.stokPerUkuran === 'string' ? JSON.parse(kebaya.stokPerUkuran) : kebaya.stokPerUkuran;
      STANDARD_SIZES.forEach((sz) => {
        if (parsed[sz] !== undefined) map[sz] = Number(parsed[sz]) || 0;
      });
      return map;
    } catch (e) {}
  }
  // Default distribution if none set yet: distribute kebaya.stok across sizes
  const total = kebaya.stok || 1;
  if (total === 1) map.M = 1;
  else if (total === 2) { map.S = 1; map.M = 1; }
  else if (total === 3) { map.S = 1; map.M = 1; map.L = 1; }
  else if (total === 4) { map.XS = 1; map.S = 1; map.M = 1; map.L = 1; }
  else if (total === 5) { map.XS = 1; map.S = 1; map.M = 2; map.L = 1; }
  else {
    map.XS = 1; map.S = 1; map.M = 2; map.L = 1; map.XL = 1;
    if (total > 6) map.XXL = total - 6;
  }
  return map;
}

class KebayaService {
  async enrichWithStock(kebayaList) {
    if (!kebayaList || kebayaList.length === 0) return [];

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const todayStart = new Date(todayStr + 'T00:00:00.000Z');
    const tomorrowEnd = new Date(tomorrowStr + 'T23:59:59.999Z');

    // Rentals active on today or tomorrow
    const activeRentals = await prisma.transaksiSewa.findMany({
      where: {
        status: { in: ACTIVE_RENTAL_STATUSES },
        tanggalSewa: { lte: tomorrowEnd },
        tanggalPengembalian: { gte: todayStart },
      },
      select: {
        namaKebaya: true,
        ukuran: true,
        tanggalSewa: true,
        tanggalPengembalian: true,
      },
    });

    const bookedTodayMap = {};
    const bookedTomorrowMap = {};
    const bookedTodaySizeMap = {};
    const bookedTomorrowSizeMap = {};

    activeRentals.forEach((r) => {
      const sewaStr = r.tanggalSewa ? r.tanggalSewa.toISOString().slice(0, 10) : '';
      const kembaliStr = r.tanggalPengembalian ? r.tanggalPengembalian.toISOString().slice(0, 10) : '';
      const uk = r.ukuran || 'M';

      if (sewaStr <= todayStr && kembaliStr >= todayStr) {
        bookedTodayMap[r.namaKebaya] = (bookedTodayMap[r.namaKebaya] || 0) + 1;
        if (!bookedTodaySizeMap[r.namaKebaya]) bookedTodaySizeMap[r.namaKebaya] = {};
        bookedTodaySizeMap[r.namaKebaya][uk] = (bookedTodaySizeMap[r.namaKebaya][uk] || 0) + 1;
      }
      if (sewaStr <= tomorrowStr && kembaliStr >= tomorrowStr) {
        bookedTomorrowMap[r.namaKebaya] = (bookedTomorrowMap[r.namaKebaya] || 0) + 1;
        if (!bookedTomorrowSizeMap[r.namaKebaya]) bookedTomorrowSizeMap[r.namaKebaya] = {};
        bookedTomorrowSizeMap[r.namaKebaya][uk] = (bookedTomorrowSizeMap[r.namaKebaya][uk] || 0) + 1;
      }
    });

    return kebayaList.map((k) => {
      const stockMap = getStockMap(k);
      const totalStok = Object.values(stockMap).reduce((a, b) => a + b, 0) || (k.stok ?? 1);
      const bookedToday = bookedTodayMap[k.nama] || 0;
      const bookedTomorrow = bookedTomorrowMap[k.nama] || 0;

      const stokHariIni = Math.max(0, totalStok - bookedToday);
      const stokBesok = Math.max(0, totalStok - bookedTomorrow);
      const isFullHariIni = bookedToday >= totalStok;
      const isFullBesok = bookedTomorrow >= totalStok;

      // Per-size breakdown for today and tomorrow
      const stokHariIniPerUkuran = {};
      const stokBesokPerUkuran = {};
      const statusHariIniPerUkuran = {};
      const statusBesokPerUkuran = {};

      const todaySizeRentals = bookedTodaySizeMap[k.nama] || {};
      const tomorrowSizeRentals = bookedTomorrowSizeMap[k.nama] || {};

      STANDARD_SIZES.forEach((sz) => {
        const szTotal = stockMap[sz] || 0;
        const bToday = todaySizeRentals[sz] || 0;
        const bTomorrow = tomorrowSizeRentals[sz] || 0;

        const sHariIni = Math.max(0, szTotal - bToday);
        const sBesok = Math.max(0, szTotal - bTomorrow);

        stokHariIniPerUkuran[sz] = sHariIni;
        stokBesokPerUkuran[sz] = sBesok;
        statusHariIniPerUkuran[sz] = classifySlotStatus(sHariIni, szTotal, k.status === 'aktif');
        statusBesokPerUkuran[sz] = classifySlotStatus(sBesok, szTotal, k.status === 'aktif');
      });

      const availableSizesHariIni = STANDARD_SIZES.filter(
        (sz) => (stockMap[sz] || 0) > 0 && stokHariIniPerUkuran[sz] > 0
      );
      const onlyRemainingSizeHariIni =
        availableSizesHariIni.length === 1 ? availableSizesHariIni[0] : null;

      const availableSizesBesok = STANDARD_SIZES.filter(
        (sz) => (stockMap[sz] || 0) > 0 && stokBesokPerUkuran[sz] > 0
      );
      const onlyRemainingSizeBesok =
        availableSizesBesok.length === 1 ? availableSizesBesok[0] : null;

      const statusHariIni = classifySlotStatus(stokHariIni, totalStok, k.status === 'aktif');
      const statusBesok = classifySlotStatus(stokBesok, totalStok, k.status === 'aktif');

      const stokTersedia = stokHariIni;
      const stokDisewa = bookedToday;

      let displayStatus = k.status;
      let tersedia = k.status === 'aktif';
      if (k.status === 'aktif' && isFullHariIni) {
        displayStatus = 'disewa';
        tersedia = false;
      }

      return {
        ...k,
        stok: totalStok,
        stokDisewa,
        stokTersedia,
        stokHariIni,
        stokBesok,
        isFullHariIni,
        isFullBesok,
        statusHariIni,
        statusBesok,
        stokPerUkuran: stockMap,
        stokHariIniPerUkuran,
        stokBesokPerUkuran,
        statusHariIniPerUkuran,
        statusBesokPerUkuran,
        availableSizesHariIni,
        onlyRemainingSizeHariIni,
        availableSizesBesok,
        onlyRemainingSizeBesok,
        tersediaHariIni: k.status === 'aktif' && !isFullHariIni,
        tersediaBesok: k.status === 'aktif' && !isFullBesok,
        tersedia,
        displayStatus,
      };
    });
  }

  async getAll() {
    const list = await prisma.kebaya.findMany({
      include: { stokUkuran: true },
      orderBy: { id: 'asc' },
    });
    return this.enrichWithStock(list);
  }

  async getPublic() {
    const list = await prisma.kebaya.findMany({
      where: { status: { in: ['aktif', 'segera'] } },
      include: { stokUkuran: true },
      orderBy: { id: 'asc' },
    });
    return this.enrichWithStock(list);
  }

  async findBySlug(slug) {
    const k = await prisma.kebaya.findUnique({
      where: { slug },
      include: { stokUkuran: true },
    });
    if (!k) return null;
    const [enriched] = await this.enrichWithStock([k]);
    return enriched;
  }

  async create(data) {
    const slug = (data.nama || 'kebaya-' + Date.now())
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = await prisma.kebaya.create({ data: { ...data, slug } });
    const [enriched] = await this.enrichWithStock([created]);
    return enriched;
  }

  async update(slug, data) {
    if (data.nama) {
      data.slug = data.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const updated = await prisma.kebaya.update({ where: { slug }, data });
    const [enriched] = await this.enrichWithStock([updated]);
    return enriched;
  }

  async delete(slug) {
    return prisma.kebaya.delete({ where: { slug } });
  }

  async setStatus(slug, status, { createdById, catatan } = {}) {
    const allowed = ['aktif', 'nonaktif', 'perbaikan', 'segera'];
    if (!allowed.includes(status)) return null;

    const existing = await prisma.kebaya.findUnique({ where: { slug } });
    if (!existing) return null;

    const updated = await prisma.kebaya.update({ where: { slug }, data: { status } });

    if (existing.status !== status) {
      await prisma.kebayaAvailabilityHistory.create({
        data: {
          kebayaId: existing.id,
          statusLama: existing.status,
          statusBaru: status,
          catatan: catatan || null,
          createdById: createdById || null,
        },
      });
    }

    return updated;
  }

  async cycleStatus(slug, { createdById, catatan } = {}) {
    const k = await prisma.kebaya.findUnique({ where: { slug } });
    if (!k) return null;
    const next = { aktif: 'nonaktif', nonaktif: 'perbaikan', perbaikan: 'aktif', segera: 'aktif' }[k.status] || 'aktif';

    await prisma.kebaya.update({ where: { slug }, data: { status: next } });

    await prisma.kebayaAvailabilityHistory.create({
      data: {
        kebayaId: k.id,
        statusLama: k.status,
        statusBaru: next,
        catatan: catatan || null,
        createdById: createdById || null,
      },
    });

    return next;
  }

  async getAvailabilityCalendar(slug, targetYear, targetMonth, targetUkuran = null) {
    const kebaya = await prisma.kebaya.findUnique({
      where: { slug },
      include: { stokUkuran: true },
    });
    if (!kebaya) return null;

    const stockMap = getStockMap(kebaya);
    const filterUkuran = targetUkuran && targetUkuran !== 'all' ? targetUkuran : null;

    const now = new Date();
    const y = parseInt(targetYear) || now.getFullYear();
    const m = parseInt(targetMonth) || (now.getMonth() + 1);

    const startDate = new Date(Date.UTC(y, m - 1, 1));
    const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59));

    const activeRentals = await prisma.transaksiSewa.findMany({
      where: {
        namaKebaya: kebaya.nama,
        status: { notIn: ['Dibatalkan', 'Telah Dikembalikan'] },
        tanggalSewa: { lte: endDate },
        tanggalPengembalian: { gte: startDate },
      },
      select: {
        kodeTransaksi: true,
        tanggalSewa: true,
        tanggalPengembalian: true,
        status: true,
        namaUser: true,
        noWa: true,
        ukuran: true,
      },
    });

    const isKebayaActive = kebaya.status === 'aktif';
    const daysInMonth = new Date(y, m, 0).getDate();
    const calendarDays = {};

    const overallTotalStock = Object.values(stockMap).reduce((a, b) => a + b, 0) || (kebaya.stok ?? 1);
    const sizeStock = filterUkuran ? (stockMap[filterUkuran] || 0) : overallTotalStock;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const rentalsOnDay = [];
      const bookedPerSizeOnDay = {};

      activeRentals.forEach((r) => {
        const sewaStr = r.tanggalSewa ? r.tanggalSewa.toISOString().slice(0, 10) : '';
        const kembaliStr = r.tanggalPengembalian ? r.tanggalPengembalian.toISOString().slice(0, 10) : '';
        if (sewaStr <= dayStr && kembaliStr >= dayStr) {
          rentalsOnDay.push(r);
          const uk = r.ukuran || 'M';
          bookedPerSizeOnDay[uk] = (bookedPerSizeOnDay[uk] || 0) + 1;
        }
      });

      // Per-size breakdown for this day
      const sizesBreakdown = {};
      STANDARD_SIZES.forEach((sz) => {
        const szStock = stockMap[sz] || 0;
        const szBooked = bookedPerSizeOnDay[sz] || 0;
        const szAvail = Math.max(0, szStock - szBooked);
        const szFull = szStock <= 0 || szBooked >= szStock;
        sizesBreakdown[sz] = {
          stock: szStock,
          booked: szBooked,
          availableSlots: szAvail,
          isFull: szFull,
          status: classifySlotStatus(szAvail, szStock, isKebayaActive),
        };
      });

      const availableSizes = STANDARD_SIZES.filter(
        (sz) => (stockMap[sz] || 0) > 0 && sizesBreakdown[sz].availableSlots > 0
      );
      const availableSizesCount = availableSizes.length;
      const onlyRemainingSize = availableSizesCount === 1 ? availableSizes[0] : null;

      let bookedOnDay = 0;
      if (filterUkuran) {
        bookedOnDay = bookedPerSizeOnDay[filterUkuran] || 0;
      } else {
        bookedOnDay = rentalsOnDay.length;
      }

      const availableSlots = Math.max(0, sizeStock - bookedOnDay);
      const isFull = !isKebayaActive || sizeStock <= 0 || bookedOnDay >= sizeStock;
      const statusLabel = classifySlotStatus(availableSlots, sizeStock, isKebayaActive);

      calendarDays[dayStr] = {
        date: dayStr,
        day,
        totalStock: sizeStock,
        bookedCount: bookedOnDay,
        availableSlots,
        isFull,
        status: statusLabel,
        targetUkuran: filterUkuran || 'all',
        sizes: sizesBreakdown,
        availableSizes,
        availableSizesCount,
        onlyRemainingSize,
      };
    }

    return {
      slug: kebaya.slug,
      nama: kebaya.nama,
      totalStock: sizeStock,
      targetUkuran: filterUkuran || 'all',
      stokPerUkuran: stockMap,
      kebayaStatus: kebaya.status,
      year: y,
      month: m,
      days: calendarDays,
      bookedRanges: activeRentals
        .filter((r) => !filterUkuran || r.ukuran === filterUkuran)
        .map((r) => ({
          kode: r.kodeTransaksi,
          start: r.tanggalSewa ? r.tanggalSewa.toISOString().slice(0, 10) : null,
          end: r.tanggalPengembalian ? r.tanggalPengembalian.toISOString().slice(0, 10) : null,
          status: r.status,
          user: r.namaUser || 'Pelanggan',
          noWa: r.noWa || '',
          ukuran: r.ukuran || 'M',
        })),
    };
  }

  async checkRangeAvailability(slug, startStr, endStr, targetUkuran = null) {
    const kebaya = await prisma.kebaya.findUnique({
      where: { slug },
      include: { stokUkuran: true },
    });
    if (!kebaya) return null;

    const stockMap = getStockMap(kebaya);
    const filterUkuran = targetUkuran && targetUkuran !== 'all' ? targetUkuran : null;
    const isKebayaActive = kebaya.status === 'aktif';

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const s = startStr || todayStr;
    const e = endStr || s;
    const validStart = s <= e ? s : e;
    const validEnd = s <= e ? e : s;

    const startDate = new Date(validStart + 'T00:00:00.000Z');
    const endDate = new Date(validEnd + 'T23:59:59.999Z');

    const activeRentals = await prisma.transaksiSewa.findMany({
      where: {
        namaKebaya: kebaya.nama,
        status: { notIn: ['Dibatalkan', 'Telah Dikembalikan'] },
        tanggalSewa: { lte: endDate },
        tanggalPengembalian: { gte: startDate },
      },
      select: {
        kodeTransaksi: true,
        tanggalSewa: true,
        tanggalPengembalian: true,
        status: true,
        ukuran: true,
      },
    });

    const overallTotalStock = Object.values(stockMap).reduce((a, b) => a + b, 0) || (kebaya.stok ?? 1);
    const sizeStock = filterUkuran ? (stockMap[filterUkuran] || 0) : overallTotalStock;

    const fullDates = [];
    const dailyDetails = {};
    let minAvailable = sizeStock;
    let maxBooked = 0;

    // Track min availability across range for EACH size
    const minAvailPerSize = {};
    const fullDatesPerSize = {};
    STANDARD_SIZES.forEach((sz) => {
      minAvailPerSize[sz] = stockMap[sz] || 0;
      fullDatesPerSize[sz] = [];
    });

    let curr = new Date(validStart + 'T00:00:00.000Z');
    const endBound = new Date(validEnd + 'T00:00:00.000Z');

    while (curr <= endBound) {
      const dStr = curr.toISOString().slice(0, 10);
      let bookedOnDay = 0;
      const bookedPerSizeOnDay = {};

      activeRentals.forEach((r) => {
        const sewa = r.tanggalSewa ? r.tanggalSewa.toISOString().slice(0, 10) : '';
        const kembali = r.tanggalPengembalian ? r.tanggalPengembalian.toISOString().slice(0, 10) : '';
        if (sewa <= dStr && kembali >= dStr) {
          const uk = r.ukuran || 'M';
          bookedPerSizeOnDay[uk] = (bookedPerSizeOnDay[uk] || 0) + 1;
          if (!filterUkuran || uk === filterUkuran) {
            bookedOnDay++;
          }
        }
      });

      // Update per-size min available and full dates
      STANDARD_SIZES.forEach((sz) => {
        const szStock = stockMap[sz] || 0;
        const bCount = bookedPerSizeOnDay[sz] || 0;
        const aSlots = Math.max(0, szStock - bCount);
        if (aSlots < minAvailPerSize[sz]) minAvailPerSize[sz] = aSlots;
        if (szStock <= 0 || bCount >= szStock) fullDatesPerSize[sz].push(dStr);
      });

      const availableSlots = Math.max(0, sizeStock - bookedOnDay);
      const isFull = !isKebayaActive || sizeStock <= 0 || bookedOnDay >= sizeStock;
      const statusLabel = classifySlotStatus(availableSlots, sizeStock, isKebayaActive);

      if (isFull) fullDates.push(dStr);
      if (availableSlots < minAvailable) minAvailable = availableSlots;
      if (bookedOnDay > maxBooked) maxBooked = bookedOnDay;

      dailyDetails[dStr] = {
        date: dStr,
        totalStock: sizeStock,
        bookedCount: bookedOnDay,
        availableSlots,
        isFull,
        status: statusLabel,
      };

      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    const isFull = !isKebayaActive || minAvailable <= 0;
    const isAvailable = isKebayaActive && minAvailable > 0;
    const overallStatus = !isKebayaActive
      ? 'disabled'
      : isFull
        ? 'full_booked'
        : classifySlotStatus(minAvailable, sizeStock, isKebayaActive) === 'limited'
          ? 'limited'
          : 'available';

    // Sizes available across the ENTIRE range
    const availableSizesAcrossRange = STANDARD_SIZES.filter(
      (sz) => (stockMap[sz] || 0) > 0 && minAvailPerSize[sz] > 0
    );
    const availableSizesCount = availableSizesAcrossRange.length;
    const onlyRemainingSize = availableSizesCount === 1 ? availableSizesAcrossRange[0] : null;

    // Summary for all sizes across the range
    const sizesSummary = {};
    STANDARD_SIZES.forEach((sz) => {
      const szStock = stockMap[sz] || 0;
      const szMinAvail = minAvailPerSize[sz];
      const szFull = szStock <= 0 || szMinAvail <= 0;
      sizesSummary[sz] = {
        stock: szStock,
        minAvailableSlots: szMinAvail,
        isFull: szFull,
        fullDates: fullDatesPerSize[sz],
        status: classifySlotStatus(szMinAvail, szStock, isKebayaActive),
      };
    });

    let message = '';
    if (!isKebayaActive) {
      message = 'Kebaya sedang nonaktif / tidak tersedia untuk disewa.';
    } else if (availableSizesCount === 0) {
      message = 'Semua ukuran kebaya Full Booked pada rentang tanggal ini.';
    } else if (onlyRemainingSize) {
      message = `Tersedia tinggal ukuran ${onlyRemainingSize} saja! (Sisa ${minAvailPerSize[onlyRemainingSize]} unit)`;
    } else if (filterUkuran && isFull) {
      message = `Ukuran ${filterUkuran} Full Booked pada rentang tanggal ini. Ukuran lain (${availableSizesAcrossRange.join(', ')}) masih tersedia!`;
    } else if (filterUkuran && isAvailable) {
      message = `Ukuran ${filterUkuran} Tersedia (${minAvailable} unit siap sewa)`;
    } else {
      message = `Tersedia ukuran ${availableSizesAcrossRange.join(', ')} (${minAvailable} unit)`;
    }

    return {
      slug: kebaya.slug,
      nama: kebaya.nama,
      totalStock: sizeStock,
      selectedUkuran: filterUkuran,
      stokPerUkuran: stockMap,
      kebayaStatus: kebaya.status,
      startDate: validStart,
      endDate: validEnd,
      minAvailableSlots: minAvailable,
      maxBooked,
      isFull,
      isAvailable,
      fullDates,
      status: overallStatus,
      sizesSummary,
      availableSizes: availableSizesAcrossRange,
      availableSizesCount,
      onlyRemainingSize,
      message,
      dailyDetails,
    };
  }
}

module.exports = KebayaService;
