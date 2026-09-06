import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { signUpAction } from "@/lib/actions/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold text-neutral-900">ZEN-A 시작하기</h1>
      <p className="mt-2 break-keep text-sm text-neutral-500">
        관심 있는 공구를 모아보고, 마감 소식도 놓치지 마세요.
      </p>

      {error && (
        <p className="mt-5 break-keep rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent-dark">
          {error}
        </p>
      )}

      <form action={signUpAction} className="mt-8 flex flex-col gap-5">
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
            minLength={6}
            placeholder="6자 이상 입력해주세요"
            className="h-14 rounded-xl border border-neutral-300 bg-white px-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <p className="text-xs text-neutral-400">비밀번호는 6자 이상으로 설정해주세요.</p>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-neutral-600">
          <input
            type="checkbox"
            name="agree"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary/20"
          />
          <span className="break-keep">
            서비스 이용약관 및 개인정보 처리방침에 동의합니다. (필수)
          </span>
        </label>

        <button
          type="submit"
          className="mt-2 h-14 rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary-dark"
        >
          이메일로 회원가입
        </button>
      </form>

      {/*
        소셜 로그인(카카오/네이버 등) OAuth 연동이 실제로 완료되면
        이 아래에 구분선 + 소셜 버튼 영역을 추가하면 됨. 아직 동작하지
        않는 버튼은 넣지 않음.
      */}

      <p className="mt-6 text-center text-sm text-neutral-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          로그인
        </Link>
      </p>
    </AuthShell>
  );
}
