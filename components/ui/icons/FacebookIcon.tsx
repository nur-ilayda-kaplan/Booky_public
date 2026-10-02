export function FacebookIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#1877F2"
      className={className}
      aria-hidden="true"
    >
      <path d="M13.5 22v-8.5h2.85l.43-3.31H13.5V8.06c0-.96.27-1.61 1.64-1.61h1.75V3.5c-.3-.04-1.34-.13-2.55-.13-2.52 0-4.24 1.54-4.24 4.36v2.43H7.24v3.31h2.86V22h3.4Z" />
    </svg>
  );
}
