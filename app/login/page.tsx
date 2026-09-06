import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { signInAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-neutral-900">다시 만나서 반가워요</h1>
      <p className="mt-2 break-keep text-sm text-neutral-500">
        ZEN-A에서 관심 공구를 이어서 확인하세요.
      </p>

      {error && (
        <p className="mt-5 break-keep rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent-dark">
          {error}
        </p>
      )}

      <form action={signInAction} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-neutral-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="h-14 rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-neutral-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            placeholder="비밀번호를 입력해주세요"
            className="h-14 rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-neutral-600">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary/20"
          />
          로그인 상태 유지
        </label>

        <button
          type="submit"
          className="mt-2 h-14 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-dark"
        >
          로그인
        </button>
      </form>

      {/*
        소셜 로그인(카카오/네이버 등) OAuth 연동이 실제로 완료되면
        이 아래에 구분선 + 소셜 버튼 영역을 추가하면 됨. 아직 동작하지
        않는 버튼은 넣지 않음.
      */}

      <p className="mt-6 text-center text-sm text-neutral-500">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </AuthShell>
  );
}
