import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";

const prisma = new PrismaClient()

async function main() {
  // 🚨 NASIR
  const Nasir = await prisma.user.upsert({
    where: { number: '1111111111' },
    update: {},
    create: {
      number: '1111111111',
      password: await bcrypt.hash('Nasir', 10),
      userpin: '1234',
      name: 'Nasir',
      Balance: {
        create: {
          amount: 20000,
          locked: 0
        }
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Success",
          amount: 20000,
          token: "token__1",
          provider: "HDFC Bank",
        },
      },
    },
  })

  // 🚨 VIKAS
  const Vikas = await prisma.user.upsert({
    where: { number: '2222222222' },
    update: {},
    create: {
      number: '2222222222',
      password: await bcrypt.hash('Vikas', 10),
      userpin: '5678',
      name: 'Vikas',
      Balance: {
        create: {
          amount: 2000,
          locked: 0
        }
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Failure",
          amount: 2000,
          token: "token__2",
          provider: "HDFC Bank",
        },
      },
    },
  })

  // 🚨 P2P Requests
  await prisma.p2PRequest.createMany({
    data: [
      {
        senderId: Nasir.id,
        receiverNumber: "2222222222",
        amount: 500, // Already Int
        message: "Dinner split",
        status: "PENDING",
      },
      {
        senderId: Vikas.id,
        receiverNumber: "1111111111",
        amount: 200, 
        message: "Movie ticket",
        status: "PENDING",
      },
    ],
  });

  // 🚨 P2P Transfers
  await prisma.p2pTransfer.createMany({
    data: [
      {
        amount: 1000,
        timestamp: new Date(),
        fromUserId: Nasir.id,
        toUserId: Vikas.id,
      },
      {
        amount: 300,
        timestamp: new Date(Date.now() - 86400000),
        fromUserId: Vikas.id,
        toUserId: Nasir.id,
      },
    ],
  });

  // 🚨 BillSchedules (amounts as Ints, multiplied by 100 if needed)
  await prisma.billSchedule.createMany({
    data: [
      {
        userId: Nasir.id,
        billType: "ELECTRICITY",
        provider: "BSES Rajdhani",
        accountNo: "EL-123456789",
        amount: 751, // Rounded from 750.50
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        billType: "WATER",
        provider: "Delhi Jal Board",
        accountNo: "WB-987654321",
        amount: 320,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        billType: "GAS",
        provider: "Indane Gas",
        accountNo: "GAS-456789123",
        amount: 950,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        billType: "PHONE_RECHARGE",
        provider: "Airtel",
        accountNo: "1111111111",
        amount: 299,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        billType: "DTH",
        provider: "Tata Sky",
        accountNo: "DTH-789123456",
        amount: 451, // Rounded from 450.75
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Vikas.id,
        billType: "ELECTRICITY",
        provider: "TPDDL",
        accountNo: "EL-456789123",
        amount: 420,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Vikas.id,
        billType: "PHONE_RECHARGE",
        provider: "Jio",
        accountNo: "2222222222",
        amount: 199,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`✅ SEEDED DATA:
📱 Nasir (PIN: 1234) - Balance: ₹20,000
📱 Vikas (PIN: 5678) - Balance: ₹2,000
🏦 2 OnRamp Transactions
💸 2 P2P Transfers  
📝 2 Pending Requests
⚡ 7 Scheduled Bills
🚀 READY!`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
