import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { signInAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <PageShell>
      <div className="mx-auto max-w-sm py-6 sm:py-10">
        <div className="rounded-lg border border-neutral-200 bg-white p-7 shadow-sm">
          <h1 className="text-xl font-bold text-neutral-900">로그인</h1>

          {error && (
            <p className="mt-4 break-keep rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">
              {error}
            </p>
          )}

          <form action={signInAction} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              name="email"
              required
              placeholder="이메일"
              className="rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            <input
              type="password"
              name="password"
              required
              placeholder="비밀번호"
              className="rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-dark"
            >
              로그인
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-500">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
