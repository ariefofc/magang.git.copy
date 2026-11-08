const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { auth, checkRole } = require('../middleware/auth');
const midtransClient = require('midtrans-client');
const { generateQrisDynamic, toBase64Png, crc16Hex } = require('../helpers/qris');

// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
function findTransaksi(idOrKode) {
  const clean = String(idOrKode || '').trim();
  const isNum = /^\d+$/.test(clean);
  return prisma.transaksiSewa.findUnique({
    where: isNum ? { id: parseInt(clean) } : { kodeTransaksi: clean },
  });
}

function nominalDP(t) {
  const skema = (t.skemaBayar || 'dp 50%').toLowerCase();
  let pct = 0.5;
  if (skema.includes('70')) pct = 0.7;
  else if (skema.includes('100') || skema.includes('lunas')) pct = 1.0;
  return Math.ceil(Number(t.totalHarga) * pct);
}

function labelSkema(t) {
  const skema = (t.skemaBayar || '').toLowerCase();
  if (skema.includes('70')) return 'DP 70%';
  if (skema.includes('100') || skema.includes('lunas')) return 'Lunas 100%';
  return 'DP 50%';
}

function isPaid(t) {
  return t.paymentStatus === 'paid' || t.sudahBayar === true;
}

function getSnap() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

function getCoreApi() {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });
}

function isMidtransReady() {
  return !!(process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_CLIENT_KEY);
}

// ═══════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════

// GET /api/payment/:id - Payment page data
router.get('/:id', async (req, res) => {
  try {
    const transaksi = await findTransaksi(req.params.id);
    if (!transaksi) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });

    const nominal = nominalDP(transaksi);
    const skema = labelSkema(transaksi);
    const midtransReady = isMidtransReady();
    const paid = isPaid(transaksi);

    let snapToken = transaksi.snapToken || null, snapError = null;
    if (midtransReady && !paid && !snapToken) {
      try {
        const snap = getSnap();
        const orderId = `${transaksi.kodeTransaksi}-${Date.now()}`;
        const result = await snap.createTransaction({
          transaction_details: { order_id: orderId, gross_amount: nominal },
          customer_details: { first_name: transaksi.namaUser, phone: transaksi.noWa },
          item_details: [{
            id: 'KEBAYA-' + transaksi.id,
            price: nominal, quantity: 1,
            name: `Sewa ${transaksi.namaKebaya} (${skema})`.substring(0, 50),
          }],
          enabled_payments: ['qris', 'gopay', 'shopeepay', 'dana', 'ovo', 'bank_transfer'],
          expiry: {
            unit: 'minutes',
            duration: parseInt(process.env.MIDTRANS_EXPIRY_MINUTES) || 30,
          },
        });
        snapToken = result.token;
        await prisma.transaksiSewa.update({
          where: { id: transaksi.id },
          data: { snapToken, transactionId: orderId, paymentStatus: 'pending' },
        });
      } catch (e) { snapError = e.message; }
    }

    // Midtrans QRIS or static QRIS
    let qrisImageData = null, qrisError = null;
    if (!paid) {
      if (midtransReady) {
        try {
          const core = getCoreApi();
          const qrisOrderId = `${transaksi.kodeTransaksi}-QRIS-${Date.now()}`;
          const charge = await core.charge({
            payment_type: 'qris',
            transaction_details: {
              order_id: qrisOrderId,
              gross_amount: nominal,
            },
            qris: { acquirer: 'gopay' },
            customer_details: { first_name: transaksi.namaUser, phone: transaksi.noWa },
          });

          if (charge.qr_string) {
            qrisImageData = await toBase64Png(charge.qr_string, parseInt(process.env.QRIS_QR_SIZE) || 280);
          } else if (charge.actions && charge.actions[0]?.url) {
            qrisImageData = charge.actions[0].url;
          }

          if (qrisImageData) {
            await prisma.transaksiSewa.update({
              where: { id: transaksi.id },
              data: {
                qrisUrl: charge.actions?.[0]?.url || null,
                transactionId: transaksi.transactionId || qrisOrderId,
              },
            });
          }
        } catch (e) {
          qrisError = e.message;
        }
      }

      if (!qrisImageData) {
        const staticString = (process.env.QRIS_STATIC_STRING || '').trim();
        if (staticString && staticString.startsWith('00020101') && staticString !== 'TEMPEL_RAW_STRING_QRIS_DANA_BISNIS_ANDA_DI_SINI') {
          try {
            const payload = generateQrisDynamic(staticString, nominal);
            qrisImageData = await toBase64Png(payload, parseInt(process.env.QRIS_QR_SIZE) || 280);
          } catch (e) { qrisError = e.message; }
        }
      }
    }

    res.json({
      transaksi,
      kode_transaksi: transaksi.kodeTransaksi,
      kebaya_name: transaksi.namaKebaya,
      customer: transaksi.namaUser,
      warna_custom: transaksi.warnaCustomAi !== 'Default' ? transaksi.warnaCustomAi : null,
      gambar_ai: transaksi.gambarAiResult ? (transaksi.gambarAiResult.startsWith('data:') ? transaksi.gambarAiResult : `/${transaksi.gambarAiResult}`) : null,
      nominal,
      skema,
      isPaid: paid,
      midtransReady,
      snapToken,
      snapError,
      snapUrl: process.env.MIDTRANS_SNAP_URL,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
      qrisImageData,
      qrisError,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/:id/initiate - Generate Snap token
router.post('/:id/initiate', async (req, res) => {
  try {
    const transaksi = await findTransaksi(req.params.id);
    if (!transaksi) return res.status(404).json({ message: 'Not found' });
    if (isPaid(transaksi)) return res.json({ success: false, message: 'Sudah lunas.', paid: true });

    if (transaksi.snapToken) {
      return res.json({
        success: true, snap_token: transaksi.snapToken,
        client_key: process.env.MIDTRANS_CLIENT_KEY,
        snap_url: process.env.MIDTRANS_SNAP_URL,
      });
    }

    const nominal = nominalDP(transaksi);
    const snap = getSnap();
    const orderId = `${transaksi.kodeTransaksi}-${Date.now()}`;

    const result = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: nominal },
      customer_details: { first_name: transaksi.namaUser, phone: transaksi.noWa },
      item_details: [{
        id: 'KEBAYA-' + transaksi.id, price: nominal, quantity: 1,
        name: `Sewa ${transaksi.namaKebaya} (${labelSkema(transaksi)})`.substring(0, 50),
      }],
      enabled_payments: ['qris', 'gopay', 'shopeepay', 'dana', 'ovo', 'bank_transfer'],
      expiry: {
        unit: 'minutes',
        duration: parseInt(process.env.MIDTRANS_EXPIRY_MINUTES) || 30,
      },
    });

    await prisma.transaksiSewa.update({
      where: { id: transaksi.id },
      data: { snapToken: result.token, transactionId: orderId, paymentStatus: 'pending' },
    });

    res.json({
      success: true, snap_token: result.token,
      client_key: process.env.MIDTRANS_CLIENT_KEY,
      snap_url: process.env.MIDTRANS_SNAP_URL,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/payment/:id/status
router.get('/:id/status', async (req, res) => {
  try {
    let t = await findTransaksi(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });

    // Active polling fallback via Midtrans Core API when pending
    if (t.paymentStatus !== 'paid' && !t.sudahBayar && t.transactionId && isMidtransReady()) {
      try {
        const core = getCoreApi();
        const midtransRes = await core.transaction.status(t.transactionId);
        if (midtransRes.transaction_status === 'settlement' || midtransRes.transaction_status === 'capture') {
          t = await prisma.transaksiSewa.update({
            where: { id: t.id },
            data: {
              paymentStatus: 'paid',
              sudahBayar: true,
              paidAt: new Date(),
              jumlahDibayar: parseInt(midtransRes.gross_amount) || nominalDP(t),
              status: 'Menunggu Konfirmasi',
            },
          });
        }
      } catch { /* Midtrans status check silent fail */ }
    }

    const isPaidStatus = isPaid(t);
    res.json({
      paymentStatus: t.paymentStatus,
      status: isPaidStatus ? 'paid' : t.status,
      sudahBayar: t.sudahBayar,
      paidAt: t.paidAt,
      isPaid: isPaidStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/payment/:id/refresh-qris
router.get('/:id/refresh-qris', async (req, res) => {
  try {
    const t = await findTransaksi(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });

    const nominal = nominalDP(t);
    let qrisImageData = null;

    if (isMidtransReady() && !isPaid(t)) {
      try {
        const core = getCoreApi();
        const qrisOrderId = `${t.kodeTransaksi}-QRIS-${Date.now()}`;
        const charge = await core.charge({
          payment_type: 'qris',
          transaction_details: { order_id: qrisOrderId, gross_amount: nominal },
          qris: { acquirer: 'gopay' },
          customer_details: { first_name: t.namaUser, phone: t.noWa },
        });
        if (charge.qr_string) {
          qrisImageData = await toBase64Png(charge.qr_string, parseInt(process.env.QRIS_QR_SIZE) || 280);
        } else if (charge.actions?.[0]?.url) {
          qrisImageData = charge.actions[0].url;
        }
        if (qrisImageData) {
          await prisma.transaksiSewa.update({
            where: { id: t.id },
            data: { transactionId: qrisOrderId },
          });
        }
      } catch { /* fallback */ }
    }

    if (!qrisImageData) {
      const staticString = (process.env.QRIS_STATIC_STRING || '').trim();
      if (staticString && staticString.startsWith('00020101')) {
        const payload = generateQrisDynamic(staticString, nominal);
        qrisImageData = await toBase64Png(payload, parseInt(process.env.QRIS_QR_SIZE) || 280);
      }
    }

    res.json({ success: true, qrisImageData, nominal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/payment/:id/confirm-qris (Admin manual)
router.post('/:id/confirm-qris', auth, checkRole('admin', 'super_admin'), async (req, res) => {
  try {
    const t = await findTransaksi(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });

    const transaksi = await prisma.transaksiSewa.update({
      where: { id: t.id },
      data: {
        paymentStatus: 'paid',
        sudahBayar: true,
        paidAt: new Date(),
        jumlahDibayar: nominalDP(t),
        status: 'Menunggu Konfirmasi',
      },
    });
    res.json({ success: true, transaksi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/:id/simulate-sandbox
router.post('/:id/simulate-sandbox', async (req, res) => {
  try {
    if (process.env.MIDTRANS_IS_PRODUCTION === 'true') {
      return res.status(400).json({ message: 'Simulasi hanya untuk sandbox.' });
    }
    const t = await findTransaksi(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });

    const transaksi = await prisma.transaksiSewa.update({
      where: { id: t.id },
      data: {
        paymentStatus: 'paid',
        sudahBayar: true,
        paidAt: new Date(),
        jumlahDibayar: nominalDP(t),
        status: 'Menunggu Konfirmasi',
      },
    });
    res.json({ success: true, message: 'Pembayaran sandbox berhasil disimulasikan.', transaksi, isPaid: true, status: 'paid' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payment/webhook/midtrans
router.post('/webhook/midtrans', async (req, res) => {
  try {
    const notification = req.body;
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let transaksi = await prisma.transaksiSewa.findFirst({
      where: { transactionId: orderId },
    });

    if (!transaksi && orderId) {
      const parts = orderId.split('-');
      if (parts.length >= 2) {
        const kode = `${parts[0]}-${parts[1]}`;
        transaksi = await prisma.transaksiSewa.findUnique({
          where: { kodeTransaksi: kode },
        });
      }
    }

    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    }

    let paymentStatus = 'pending';
    let newStatus = transaksi.status;

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'challenge';
      } else {
        paymentStatus = 'paid';
        newStatus = 'Menunggu Konfirmasi';
      }
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
      paymentStatus = 'failed';
    } else if (transactionStatus === 'expire') {
      paymentStatus = 'expired';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending';
    }

    await prisma.transaksiSewa.update({
      where: { id: transaksi.id },
      data: {
        paymentStatus,
        sudahBayar: paymentStatus === 'paid',
        paidAt: paymentStatus === 'paid' ? new Date() : transaksi.paidAt,
        jumlahDibayar: paymentStatus === 'paid' ? parseInt(notification.gross_amount) : Number(transaksi.jumlahDibayar),
        status: newStatus,
        snapToken: paymentStatus === 'paid' ? null : transaksi.snapToken,
      },
    });

    res.status(200).json({ message: 'OK' });
  } catch (err) {
    console.error('[Midtrans Webhook]', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
