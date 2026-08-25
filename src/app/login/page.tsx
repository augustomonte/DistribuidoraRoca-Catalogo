import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-roca-gris px-4 py-16">
      <div className="w-full max-w-sm rounded-lg border border-roca-negro/10 bg-roca-blanco p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-mark.png"
            alt="Roca"
            width={255}
            height={255}
            priority
            className="h-20 w-20"
          />
        </div>
        <h1 className="mb-6 text-center text-lg font-semibold text-roca-negro">
          Ingresá a tu cuenta
        </h1>
        <LoginForm next={next} errorInicial={error} />
      </div>
    </div>
  );
}
