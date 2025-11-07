import prisma from '@repo/db/client';
import axios from 'axios';

async function run() {
  const expired = await prisma.wrongSendRequest.findMany({
    where: { status: 'PENDING', expiresAt: { lt: new Date() } },
    include: { sender: true, transaction: true },
  });

  for (const req of expired) {
    // use number (paise) to match Balance.amount (Int)
    const penalty = 5000; // ₹50 => 5000 paise
    const refundAmount = Number(req.amount) + penalty;

    await prisma.$transaction([
      prisma.wrongSendRequest.update({
        where: { id: req.id },
        data: { status: 'EXPIRED', penaltyPaid: true },
      }),
      // Update Balance via the Balance model (not nested on User)
      prisma.balance.upsert({
        where: { userId: req.senderId },
        update: { amount: { increment: refundAmount } },
        create: { userId: req.senderId, amount: refundAmount, locked: 0 },
      }),
    ]);

    // SMS to sender — convert paise -> rupees for human readable message
    const amountRupees = Number(req.amount) / 100;
    const totalRupees = refundAmount / 100;
    const senderNumber = (req as any).sender?.number;
    if (senderNumber) {
      await axios.get(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS}&message=${encodeURIComponent(
          `₹${amountRupees} + ₹50 penalty refunded! Total refunded: ₹${totalRupees}`
        )}&numbers=${senderNumber}`
      );
    }
  }
}

run().catch(console.error);