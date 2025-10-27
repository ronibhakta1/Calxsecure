import { PrismaClient } from '@prisma/client'
import bcrypt from "bcrypt";

const prisma = new PrismaClient()

async function main() {
  // 🚨 USERS
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

  // 🚨 MERCHANTS
  const merchantsData = [
    {
      email: "bses@merchant.com",
      name: "BSES Rajdhani Power Ltd",
      upiId: "upi-bses-rajdhani",
      auth_type: "Google",
    },
    {
      email: "delhijal@merchant.com",
      name: "Delhi Jal Board",
      upiId: "upi-delhi-jal",
      auth_type: "Github",
    },
    {
      email: "indane@merchant.com",
      name: "Indane Gas",
      auth_type: "Google",
      upiId: "upi-indane-gas",
    },
    {
      email: "airtel@merchant.com",
      name: "Airtel Payments",
      auth_type: "Google",
      upiId: "upi-airtel-payments",
    },
    {
      email: "tatasky@merchant.com",
      name: "Tata Sky DTH",
      auth_type: "Github",
      upiId: "upi-tata-sky",
    },
    {
      email: "tpddl@merchant.com",
      name: "TPDDL Electricity",
      auth_type: "Google",
      upiId: "upi-tpddl-electricity",
    },
    {
      email: "jio@merchant.com",
      name: "Jio Recharge",
      auth_type: "Github",
      upiId: "upi-jio-recharge",
    },
  ];

  // Create merchants but skip duplicates when emails already exist
  await prisma.merchant.createMany({
    data: merchantsData,
    skipDuplicates: true,
  });

  const merchantList = await prisma.merchant.findMany();

  // 🚨 P2P Requests
  await prisma.p2PRequest.createMany({
    data: [
      {
        senderId: Nasir.id,
        receiverNumber: "2222222222",
        amount: 500,
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

  // 🚨 BILL SCHEDULES (with Merchant linking)
  const findMerchant = (name: string) =>
    merchantList.find((m) => m.name?.includes(name))?.id ?? null;

  await prisma.billSchedule.createMany({
    data: [
      {
        userId: Nasir.id,
        merchantId: findMerchant("BSES"),
        billType: "ELECTRICITY",
        provider: "BSES Rajdhani",
        accountNo: "EL-123456789",
        amount: 751,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        merchantId: findMerchant("Delhi Jal"),
        billType: "WATER",
        provider: "Delhi Jal Board",
        accountNo: "WB-987654321",
        amount: 320,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        merchantId: findMerchant("Indane"),
        billType: "GAS",
        provider: "Indane Gas",
        accountNo: "GAS-456789123",
        amount: 950,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        merchantId: findMerchant("Airtel"),
        billType: "PHONE_RECHARGE",
        provider: "Airtel",
        accountNo: "1111111111",
        amount: 299,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Nasir.id,
        merchantId: findMerchant("Tata Sky"),
        billType: "DTH",
        provider: "Tata Sky",
        accountNo: "DTH-789123456",
        amount: 451,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Vikas.id,
        merchantId: findMerchant("TPDDL"),
        billType: "ELECTRICITY",
        provider: "TPDDL",
        accountNo: "EL-456789123",
        amount: 420,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: Vikas.id,
        merchantId: findMerchant("Jio"),
        billType: "PHONE_RECHARGE",
        provider: "Jio",
        accountNo: "2222222222",
        amount: 199,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log(`
✅ SEEDED DATA:
📱 Users: Nasir & Vikas
🏦 Balances + OnRamp Transactions
💳 Merchants: ${merchantList.length}
🧾 BillSchedules: 7 linked to Merchants
💸 P2P Transfers & Requests Created
🚀 READY!
  `);
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
