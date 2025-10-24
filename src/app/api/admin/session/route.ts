import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body || {};

    if (!access_token) {
      return NextResponse.json({ error: "missing_token" }, { status: 400 });
    }

    // Créer la réponse et définir le cookie HTTP-only (nom: sb-admin-session)
    const res = NextResponse.json({ ok: true });

    // Stocker le token (ou l'objet de session) dans un cookie HTTP-only sécurisé
    res.cookies.set({
      name: "sb-admin-session",
      value: JSON.stringify({ access_token, refresh_token }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Permet de supprimer le cookie de session côté serveur
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: "sb-admin-session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // expire immédiatement
  });
  return res;
}
