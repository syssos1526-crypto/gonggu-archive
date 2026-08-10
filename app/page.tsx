import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, brand, name")
    .limit(5);

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-3xl font-bold">
        공구 아카이브
      </h1>

      <p className="mt-4">
        Supabase 연결 테스트
      </p>

      {error ? (
        <p className="mt-6 text-red-500">
          연결 실패: {error.message}
        </p>
      ) : (
        <div className="mt-6">
          <p className="text-green-600">
            ✅ Supabase 연결 성공!
          </p>

          <p className="mt-2">
            현재 등록된 상품: {products?.length ?? 0}개
          </p>

          {products && products.length > 0 && (
            <ul className="mt-4 space-y-2">
              {products.map((product) => (
                <li key={product.id}>
                  {product.brand} - {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </main>
  );
}