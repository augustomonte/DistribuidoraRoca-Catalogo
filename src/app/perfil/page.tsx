import { redirect } from "next/navigation";
import { getPerfilActual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EditarPerfilForm } from "@/components/perfil/EditarPerfilForm";

export default async function PerfilPage() {
  const perfil = await getPerfilActual();
  if (!perfil) redirect("/login");

  // El email vive en auth.users, no en la tabla perfiles: se lee acá
  // para mostrarlo, pero no se edita desde este formulario (cambiar el
  // email de auth es un flujo de confirmación aparte, fuera de alcance
  // por ahora).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-tema-tinta">Mi perfil</h1>
      <EditarPerfilForm perfil={perfil} email={user?.email ?? ""} />
    </div>
  );
}
