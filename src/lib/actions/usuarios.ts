"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPerfilVerificado } from "@/lib/auth";
import { PROVINCIAS_ARGENTINA } from "@/lib/provincias";
import { cliente } from "@/config/cliente";

export interface UsuarioFormState {
  error?: string;
  ok?: boolean;
}

// Estas acciones usan createAdminClient (clave de servicio, se salta la
// RLS), así que verifican contra la base en vez de confiar en el header
// "x-perfil". Ver getPerfilVerificado() en src/lib/auth.ts.
async function requireAdmin() {
  const perfil = await getPerfilVerificado();
  if (!perfil || perfil.rol !== "admin") {
    throw new Error("No autorizado");
  }
  return perfil;
}

async function requireAdminOVendedor() {
  const perfil = await getPerfilVerificado();
  if (!perfil || (perfil.rol !== "admin" && perfil.rol !== "vendedor")) {
    throw new Error("No autorizado");
  }
  return perfil;
}

function validarCredenciales(email: string, password: string) {
  if (!email || !email.includes("@")) {
    return "El email no es válido.";
  }
  if (!password || password.length < 6) {
    return "La contraseña temporal debe tener al menos 6 caracteres.";
  }
  return null;
}

export async function crearVendedor(
  _prevState: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();

  const errorCredenciales = validarCredenciales(email, password);
  if (errorCredenciales) return { error: errorCredenciales };
  if (!nombre) return { error: "El nombre es obligatorio." };

  const admin = createAdminClient();

  const { data: nuevoUsuario, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !nuevoUsuario.user) {
    return {
      error: createError?.message ?? "No se pudo crear el usuario.",
    };
  }

  const { error: perfilError } = await admin.from("perfiles").insert({
    id: nuevoUsuario.user.id,
    rol: "vendedor",
    nombre,
    apellido: apellido || null,
    dni: dni || null,
    telefono: telefono || null,
    activo: true,
  });

  if (perfilError) {
    await admin.auth.admin.deleteUser(nuevoUsuario.user.id);
    return { error: perfilError.message };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function crearAdmin(
  _prevState: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();

  const errorCredenciales = validarCredenciales(email, password);
  if (errorCredenciales) return { error: errorCredenciales };
  if (!nombre) return { error: "El nombre es obligatorio." };

  const admin = createAdminClient();

  const { data: nuevoUsuario, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !nuevoUsuario.user) {
    return {
      error: createError?.message ?? "No se pudo crear el usuario.",
    };
  }

  const { error: perfilError } = await admin.from("perfiles").insert({
    id: nuevoUsuario.user.id,
    rol: "admin",
    nombre,
    apellido: apellido || null,
    telefono: telefono || null,
    activo: true,
  });

  if (perfilError) {
    await admin.auth.admin.deleteUser(nuevoUsuario.user.id);
    return { error: perfilError.message };
  }

  revalidatePath("/admin/administradores");
  return { ok: true };
}

export async function crearCliente(
  _prevState: UsuarioFormState,
  formData: FormData
): Promise<UsuarioFormState> {
  const creador = await requireAdminOVendedor();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const razonSocial = String(formData.get("razon_social") ?? "").trim();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const direccion = String(formData.get("direccion") ?? "").trim();
  const ciudad = String(formData.get("ciudad") ?? "").trim();
  const provincia = String(formData.get("provincia") ?? "").trim();

  const errorCredenciales = validarCredenciales(email, password);
  if (errorCredenciales) return { error: errorCredenciales };
  if (!razonSocial) return { error: "La razón social es obligatoria." };
  if (!nombre) return { error: "El nombre de contacto es obligatorio." };
  if (
    provincia &&
    !(PROVINCIAS_ARGENTINA as readonly string[]).includes(provincia)
  ) {
    return { error: "La provincia seleccionada no es válida." };
  }

  const admin = createAdminClient();

  const { data: nuevoUsuario, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !nuevoUsuario.user) {
    return {
      error: createError?.message ?? "No se pudo crear el usuario.",
    };
  }

  const { error: perfilError } = await admin.from("perfiles").insert({
    id: nuevoUsuario.user.id,
    rol: "cliente",
    nombre,
    razon_social: razonSocial,
    telefono: telefono || null,
    direccion: direccion || null,
    ciudad: ciudad || null,
    provincia: provincia || null,
    creado_por: creador.id,
    activo: true,
  });

  if (perfilError) {
    await admin.auth.admin.deleteUser(nuevoUsuario.user.id);
    return { error: perfilError.message };
  }

  revalidatePath("/vendedor/clientes");
  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function eliminarCliente(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", id)
    .single();

  if (!perfil || perfil.rol !== "cliente") {
    throw new Error(
      `Solo se pueden eliminar cuentas de ${cliente.etiquetas.clienteSingular.toLowerCase()}.`
    );
  }

  // Borra el usuario de Supabase Auth; el perfil se borra solo por el
  // ON DELETE CASCADE hacia la tabla perfiles.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);

  revalidatePath("/vendedor/clientes");
  revalidatePath("/admin/usuarios");
}

export async function eliminarVendedor(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- firma requerida por useActionState
  _prevState: UsuarioFormState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- firma requerida por useActionState
  _formData: FormData
): Promise<UsuarioFormState> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", id)
    .single();

  if (!perfil || perfil.rol !== "vendedor") {
    return { error: "Solo se pueden eliminar cuentas de vendedor." };
  }

  const { count } = await supabase
    .from("perfiles")
    .select("*", { count: "exact", head: true })
    .eq("creado_por", id);

  if (count && count > 0) {
    const { clienteSingular, clientePlural } = cliente.etiquetas;
    const etiqueta = (count === 1 ? clienteSingular : clientePlural).toLowerCase();
    return {
      error: `No se puede eliminar: tiene ${count} ${etiqueta} a su cargo. Reasigná o eliminá esas cuentas primero.`,
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: error.message };

  revalidatePath("/admin/usuarios");
  return { ok: true };
}

export async function alternarActivoPerfil(id: string, activo: boolean) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("perfiles")
    .update({ activo: !activo })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/administradores");
  revalidatePath("/admin/usuarios");
}
