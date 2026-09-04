import { PageShell } from "@/components/PageShell";

export default function SignupSuccessPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-sm py-6 text-center sm:py-10">
        <div className="rounded-lg border border-neutral-200 bg-white p-7 shadow-sm">
          <h1 className="break-keep text-xl font-bold text-neutral-900">이메일을 확인해주세요</h1>
          <p className="mt-3 break-keep text-sm text-neutral-500">
            입력하신 이메일 주소로 인증 링크를 보냈습니다. 메일함에서 링크를 눌러 가입을
            완료해주세요.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
