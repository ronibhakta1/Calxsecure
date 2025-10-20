import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const filePath = path.join(process.cwd(), "data", "bills.json");
  
  const bills = JSON.parse(await fs.readFile(filePath, "utf-8"));
  const newBill = { id: bills.length + 1, ...data };
  bills.push(newBill);
  
  await fs.writeFile(filePath, JSON.stringify(bills, null, 2));
  
  return NextResponse.json({ success: true });
}