import { ExplorerApp } from "../components/explorer-app";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AU-Settle Pro</p>
        <h1 className="title">Geography-first migration evidence explorer</h1>
        <p className="subtitle">
          Split architecture foundation: Next.js frontend and FastAPI backend
          with deterministic, traceable evidence panels.
        </p>
      </section>
      <ExplorerApp />
    </main>
  );
}
