import {
  CatalogoView,
  type CatalogoSearchParams,
} from "@/components/catalogo/CatalogoView";

export default async function VendedorCatalogoPage({
  searchParams,
}: {
  searchParams: Promise<CatalogoSearchParams>;
}) {
  return <CatalogoView searchParams={await searchParams} />;
}
