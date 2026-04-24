export function Footer() {
  return (
    <footer className="mt-auto py-4 text-center text-xs text-muted-foreground select-none">
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>Fet des de l'Empordà ❤️ amb molta IA</span>
        <span aria-hidden="true">·</span>
        <span className="font-mono">v{__APP_VERSION__}</span>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/reparteix/reparteix"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:text-foreground hover:underline"
        >
          GitHub
        </a>
      </p>
    </footer>
  )
}
