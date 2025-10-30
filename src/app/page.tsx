import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import HomeClient from "./home-client";

export default async function Page() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Volleyball Stats — Demo</h1>

        {session ? (
          <a
            className="rounded border px-3 py-1.5"
            href="/api/auth/signout"
          >
            Sign out
          </a>
        ) : (
          <a
            className="rounded bg-blue-600 px-3 py-1.5 text-white"
            href="/api/auth/signin/google"
          >
            Sign in with Google
          </a>
        )}
      </header>

      {session ? (
        <HomeClient />
      ) : (
        <p className="text-gray-800">Please sign in to continue.</p>
      )}
    </main>
  );
}
