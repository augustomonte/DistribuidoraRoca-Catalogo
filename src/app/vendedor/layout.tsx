import { redirect } from "next/navigation";
import { getPerfilActual } from "@/lib/auth";
import { SeccionProtegida } from "@/components/layout/SeccionProtegida";

export default async function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await getPerfilActual();
  if (!perfil) redirect("/login");

  return <SeccionProtegida perfil={perfil}>{children}</SeccionProtegida>;
}
