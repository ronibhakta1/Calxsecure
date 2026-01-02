import 'dotenv/config'
import { PrismaClient, AuthType } from '../../generated';
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? true : false
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter });

/* -------------------------------------------------------------------------- */
/*  1. ALL 23 CIRCLES (official TRAI list – Nov 2025)                        */
/* -------------------------------------------------------------------------- */
const circles = [
  "Andhra Pradesh", "Assam", "Bihar & Jharkhand", "Chennai", "Delhi NCR",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Karnataka",
  "Kerala", "Kolkata", "Madhya Pradesh & Chhattisgarh", "Maharashtra & Goa",
  "Mumbai", "North East", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
  "Uttar Pradesh (East)", "Uttar Pradesh (West)", "West Bengal"
];

/* -------------------------------------------------------------------------- */
/*  2. REAL 2025 PLANS (price, validity, description)                       */
/* -------------------------------------------------------------------------- */
const jioPlans = [
  { amount: 149, validity: "28 days", desc: "1.5 GB/day + Unlimited Calls + 100 SMS/day" },
  { amount: 299, validity: "28 days", desc: "2 GB/day + Unlimited Calls + 100 SMS/day" },
  { amount: 349, validity: "28 days", desc: "2.5 GB/day + Unlimited Calls + JioHotstar" },
  { amount: 399, validity: "56 days", desc: "2 GB/day + Unlimited Calls + JioCinema" },
  { amount: 666, validity: "84 days", desc: "1.5 GB/day + Unlimited Calls + Disney+ Hotstar" },
  { amount: 899, validity: "84 days", desc: "2 GB/day + Unlimited Calls + JioHotstar 3-month" },
  { amount: 1199, validity: "84 days", desc: "3 GB/day + Unlimited Calls + Netflix" },
  { amount: 3599, validity: "365 days", desc: "2 GB/day + Unlimited Calls + Amazon Prime" },
  { amount: 3999, validity: "365 days", desc: "2.5 GB/day + Unlimited Calls + Netflix/Prime" },
];

const airtelPlans = [
  { amount: 199, validity: "28 days", desc: "1 GB/day + Unlimited Calls + Xstream Play" },
  { amount: 299, validity: "28 days", desc: "1.5 GB/day + Unlimited Calls + Disney+ Hotstar" },
  { amount: 379, validity: "30 days", desc: "2 GB/day + Unlimited Calls + Apollo 24|7" },
  { amount: 449, validity: "28 days", desc: "3 GB/day + Unlimited 5G + Amazon Prime" },
  { amount: 719, validity: "84 days", desc: "1.5 GB/day + Unlimited Calls + Hotstar" },
  { amount: 999, validity: "84 days", desc: "2.5 GB/day + Unlimited Calls + Netflix" },
  { amount: 2999, validity: "365 days", desc: "2 GB/day + Unlimited Calls + Disney+ Hotstar" },
  { amount: 3599, validity: "365 days", desc: "2.5 GB/day + Unlimited Calls + Netflix/Prime" },
];

const viPlans = [
  { amount: 99,  validity: "28 days", desc: "₹99 Talktime + 200 MB + Night Data" },
  { amount: 179, validity: "28 days", desc: "1 GB/day + Unlimited Calls + Weekend Rollover" },
  { amount: 349, validity: "28 days", desc: "1.5 GB/day + Unlimited Calls + SonyLIV" },
  { amount: 449, validity: "28 days", desc: "3 GB/day + Unlimited Calls + Data Delights" },
  { amount: 996, validity: "84 days", desc: "2 GB/day + Unlimited Calls + SonyLIV Premium" },
  { amount: 1449,validity: "180 days",desc: "1.5 GB/day + Unlimited Calls + Hero Unlimited" },
  { amount: 3599,validity: "365 days",desc: "2 GB/day + Unlimited Calls + 16 OTTs" },
  { amount: 3799,validity: "365 days",desc: "2.5 GB/day + Unlimited Night Data + Amazon Prime" },
];

/* -------------------------------------------------------------------------- */
/*  3. MAIN SEED FUNCTION                                                    */
/* -------------------------------------------------------------------------- */
async function main() {
  /* ---------- USERS ---------- */
  const Nasir = await prisma.user.upsert({
    where: { number: '1111111111' },
    update: {},
    create: {
      number: '1111111111',
      password: await bcrypt.hash('Nasir', 10),
      userpin: '1234',
      name: 'Nasir',
      sessionToken: uuid(),
      Balance: { create: { amount: 20000, locked: 0 } },
      OnRampTransaction: {
        create: { startTime: new Date(), status: "Success", amount: 20000, token: "token__1", provider: "HDFC Bank" },
      },
    },
  });

  const Vikas = await prisma.user.upsert({
    where: { number: '2222222222' },
    update: {},
    create: {
      number: '2222222222',
      password: await bcrypt.hash('Vikas', 10),
      userpin: '5678',
      name: 'Vikas',
      sessionToken: uuid(),
      Balance: { create: { amount: 2000, locked: 0 } },
      OnRampTransaction: {
        create: { startTime: new Date(), status: "Failure", amount: 2000, token: "token__2", provider: "HDFC Bank" },
      },
    },
  });

  /* ---------- MERCHANTS ---------- */
  const merchantsData: { email: string; name: string; upiId: string; auth_type: AuthType }[] = [
    { email: "bses@merchant.com", name: "BSES Rajdhani Power Ltd", upiId: "upi-bses-rajdhani", auth_type: AuthType.Google },
    { email: "delhijal@merchant.com", name: "Delhi Jal Board", upiId: "upi-delhi-jal", auth_type: AuthType.Github },
    { email: "indane@merchant.com", name: "Indane Gas", upiId: "upi-indane-gas", auth_type: AuthType.Google },
    { email: "airtel@merchant.com", name: "Airtel Payments", upiId: "upi-airtel-payments", auth_type: AuthType.Google },
    { email: "tatasky@merchant.com", name: "Tata Sky DTH", upiId: "upi-tata-sky", auth_type: AuthType.Github },
    { email: "tpddl@merchant.com", name: "TPDDL Electricity", upiId: "upi-tpddl-electricity", auth_type: AuthType.Google },
    { email: "jio@merchant.com", name: "Jio Recharge", upiId: "upi-jio-recharge", auth_type: AuthType.Github },
  ];
  await prisma.merchant.createMany({ data: merchantsData, skipDuplicates: true });
  const merchantList = await prisma.merchant.findMany();

  /* ---------- P2P REQUESTS ---------- */
  await prisma.p2PRequest.createMany({
    data: [
      { senderId: Nasir.id, receiverNumber: "2222222222", amount: 500, message: "Dinner split", status: "PENDING" },
      { senderId: Vikas.id, receiverNumber: "1111111111", amount: 200, message: "Movie ticket", status: "PENDING" },
    ],
  });

  /* ---------- P2P TRANSFERS ---------- */
  await prisma.p2pTransfer.createMany({
    data: [
      { amount: 1000, timestamp: new Date(), fromUserId: Nasir.id, toUserId: Vikas.id },
      { amount: 300, timestamp: new Date(Date.now() - 86400000), fromUserId: Vikas.id, toUserId: Nasir.id },
    ],
  });

  /* ---------- BILL SCHEDULES ---------- */
  const findMerchant = (name: string) => merchantList.find(m => m.name?.includes(name))?.id ?? null;
  await prisma.billSchedule.createMany({
    data: [
      { userId: Nasir.id, merchantId: findMerchant("BSES"), billType: "ELECTRICITY", provider: "BSES Rajdhani", accountNo: "EL-123456789", amount: 751, dueDate: new Date(Date.now() + 3 * 86400000), nextPayment: new Date(Date.now() + 30 * 86400000) },
      { userId: Nasir.id, merchantId: findMerchant("Delhi Jal"), billType: "WATER", provider: "Delhi Jal Board", accountNo: "WB-987654321", amount: 320, dueDate: new Date(Date.now() + 7 * 86400000) },
      { userId: Nasir.id, merchantId: findMerchant("Indane"), billType: "GAS", provider: "Indane Gas", accountNo: "GAS-456789123", amount: 950, dueDate: new Date(Date.now() + 10 * 86400000) },
      { userId: Nasir.id, merchantId: findMerchant("Airtel"), billType: "PHONE_RECHARGE", provider: "Airtel", accountNo: "1111111111", amount: 299, dueDate: new Date(Date.now() + 20 * 86400000) },
      { userId: Nasir.id, merchantId: findMerchant("Tata Sky"), billType: "DTH", provider: "Tata Sky", accountNo: "DTH-789123456", amount: 451, dueDate: new Date(Date.now() + 25 * 86400000) },
      { userId: Vikas.id, merchantId: findMerchant("TPDDL"), billType: "ELECTRICITY", provider: "TPDDL", accountNo: "EL-456789123", amount: 420, dueDate: new Date(Date.now() + 5 * 86400000) },
      { userId: Vikas.id, merchantId: findMerchant("Jio"), billType: "PHONE_RECHARGE", provider: "Jio", accountNo: "2222222222", amount: 199, dueDate: new Date(Date.now() + 15 * 86400000) },
    ],
  });

  /* ---------- REAL RECHARGE PLANS (ALL 23 CIRCLES) ---------- */
  const allPlans: any[] = [];

  for (const circle of circles) {
    for (const p of jioPlans)   allPlans.push({ operator: "Jio",    circle, ...p });
    for (const p of airtelPlans) allPlans.push({ operator: "Airtel", circle, ...p });
    for (const p of viPlans)    allPlans.push({ operator: "Vi",     circle, ...p });
  }

  const payload = allPlans.map(p => ({
    operator: p.operator,
    circle:   p.circle,
    amount:   p.amount,
    description: p.desc,
    validity: p.validity,
    planCode: `${p.operator}-${p.amount}-${p.circle.slice(0,3)}`.replace(/[^a-z0-9]/gi, '_'),
    planType: p.amount < 200 ? "TOPUP" : "DATA",
  }));

  await prisma.rechargePlan.deleteMany({});                 // wipe old fake data
  await prisma.rechargePlan.createMany({ data: payload, skipDuplicates: true });

  console.log(`LIVE 2025 DATA SEEDED`);
  console.log(`   Circles : ${circles.length}`);
  console.log(`   Plans   : ${payload.length} (Jio ${jioPlans.length} × 23, Airtel ${airtelPlans.length} × 23, Vi ${viPlans.length} × 23)`);
}

/* -------------------------------------------------------------------------- */
/*  RUN                                                                      */
/* -------------------------------------------------------------------------- */
main()
  .then(async () => await prisma.$disconnect())
  .catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1); });