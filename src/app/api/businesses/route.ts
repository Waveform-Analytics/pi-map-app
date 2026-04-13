import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/businesses.json');

export async function GET() {
  const data = fs.readFileSync(filePath, 'utf-8');
  return NextResponse.json(JSON.parse(data));
}

export async function POST(request: Request) {
  const shops = await request.json();

  if (!Array.isArray(shops)) {
    return NextResponse.json({ error: 'Expected an array of businesses' }, { status: 400 });
  }

  fs.writeFileSync(filePath, JSON.stringify(shops, null, 2) + '\n', 'utf-8');
  return NextResponse.json({ ok: true, count: shops.length });
}
