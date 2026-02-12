
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ isAdmin: false }, { status: 400 });
        }

        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
        const isAdmin = adminEmails.map(e => e.trim()).includes(email);

        return NextResponse.json({ isAdmin });
    } catch (error) {
        return NextResponse.json({ isAdmin: false, error: "Internal Server Error" }, { status: 500 });
    }
}
