import { NextResponse } from "next/server";
import { StatEvent, StatKind } from "@/lib/types";


// In-memory store (resets on server restart)
const stats: StatEvent[] = [];


function isValidKind(k: string): k is StatKind {
return ["kill", "block", "ace", "dig", "assist", "error"].includes(k);
}


// GET /api/stats?player=&set=
export async function GET(request: Request) {
const { searchParams } = new URL(request.url);
const player = searchParams.get("player");
const setParam = searchParams.get("set");


let results = stats;
if (player) results = results.filter(s => s.player.toLowerCase() === player.toLowerCase());
if (setParam) {
const setNumber = Number(setParam);
if (!Number.isNaN(setNumber)) {
results = results.filter(s => s.setNumber === setNumber);
}
}


return NextResponse.json({ data: results }, { status: 200 });
}


// POST /api/stats -> { player, kind, setNumber }
export async function POST(request: Request) {
try {
const body = await request.json();
const player = String(body?.player ?? "").trim();
const kind = String(body?.kind ?? "");
const setNumber = Number(body?.setNumber);


if (!player) return NextResponse.json({ error: "Player is required" }, { status: 400 });
if (!isValidKind(kind)) return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
if (!Number.isInteger(setNumber) || setNumber < 1) {
return NextResponse.json({ error: "setNumber must be a positive integer" }, { status: 400 });
}


const event: StatEvent = {
id: crypto.randomUUID(),
player,
kind,
setNumber,
timestamp: new Date().toISOString(),
};
stats.push(event);


return NextResponse.json({ data: event }, { status: 201 });
} catch {
return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}
}