import {
  CatalogoView,
  type CatalogoSearchParams,
} from "@/components/catalogo/CatalogoView";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<CatalogoSearchParams>;
}) {
  return <CatalogoView searchParams={await searchParams} />;
}
