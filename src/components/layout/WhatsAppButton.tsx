const NUMERO_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5490000000000";

export function WhatsAppButton() {
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(
    "Hola, quería consultar sobre productos de Mayorista Roca Ferretería."
  )}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-roca-blanco shadow-lg transition-transform duration-200 ease-out hover:scale-105 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-current">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.7 4.61 1.906 6.475L4 29l7.72-1.867A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.938a9.9 9.9 0 0 1-5.05-1.386l-.362-.215-4.583 1.108 1.13-4.47-.236-.377A9.9 9.9 0 0 1 5.062 15c0-5.478 4.463-9.938 10.942-9.938 5.478 0 9.938 4.46 9.938 9.938S21.482 24.938 16.004 24.938Zm5.44-7.44c-.298-.15-1.762-.87-2.036-.968-.273-.1-.472-.15-.67.15-.198.298-.767.968-.94 1.166-.174.198-.348.223-.646.075-.298-.15-1.258-.464-2.396-1.48-.886-.79-1.484-1.766-1.658-2.064-.174-.298-.02-.46.13-.608.134-.133.298-.348.447-.522.15-.174.198-.298.298-.497.1-.198.05-.372-.025-.522-.075-.15-.67-1.617-.918-2.214-.242-.58-.487-.502-.67-.512l-.57-.01c-.198 0-.522.075-.795.373-.273.298-1.043 1.02-1.043 2.487 0 1.467 1.068 2.885 1.217 3.083.15.198 2.102 3.21 5.093 4.502.712.307 1.267.49 1.7.627.714.227 1.364.195 1.878.118.573-.086 1.762-.72 2.01-1.415.248-.694.248-1.29.174-1.414-.075-.124-.273-.198-.571-.348Z" />
      </svg>
    </a>
  );
}
