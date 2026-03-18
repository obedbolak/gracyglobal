export default function JobsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Coming Soon
        </h1>
        <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
          Remote Jobs Platform
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          We're working hard to bring you the best remote job opportunities. Stay tuned!
        </p>
      </div>
    </div>
  );
}
