"use client";

import type { DetailPanelResponse } from "../lib/types";

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-AU").format(value);
}

interface DetailPanelProps {
  data: DetailPanelResponse | null;
  isLoading: boolean;
  errorMessage: string | null;
}

export function DetailPanel({ data, isLoading, errorMessage }: DetailPanelProps) {
  if (isLoading) {
    return (
      <aside className="panel detail-panel">
        <p>Loading detail panel...</p>
      </aside>
    );
  }

  if (errorMessage) {
    return (
      <aside className="panel detail-panel">
        <p className="error-text">{errorMessage}</p>
      </aside>
    );
  }

  if (!data) {
    return (
      <aside className="panel detail-panel">
        <p>Pick a geography tile to inspect migration evidence.</p>
      </aside>
    );
  }

  return (
    <aside className="panel detail-panel">
      <header>
        <p className="eyebrow">Detail panel</p>
        <h3>{data.geography.display_name}</h3>
        <p>{data.geography.canonical_name}</p>
      </header>

      <section className="detail-section">
        <h4>Migration evidence</h4>
        <div className="badge-wrap">
          {data.badges.map((badge) => (
            <span key={badge} className="badge">
              {badge}
            </span>
          ))}
        </div>
        <p className="note">{data.migration_evidence.visa_context_note}</p>
        <dl className="mini-grid">
          <div>
            <dt>Occupation</dt>
            <dd>
              {data.occupation.label} ({data.occupation.anzsco_code})
            </dd>
          </div>
          <div>
            <dt>View mode</dt>
            <dd>{data.view_mode.toUpperCase()}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{data.migration_evidence.source.title}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{data.migration_evidence.source.last_updated}</dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <h4>Labour market</h4>
        <p className="subnote">
          Demo values from mocked backend data. Replace with ingested ABS/JSA
          data in the next slice.
        </p>
        <dl className="mini-grid">
          <div>
            <dt>Population</dt>
            <dd>{formatInteger(data.labour_market.population)}</dd>
          </div>
          <div>
            <dt>Employment</dt>
            <dd>{formatInteger(data.labour_market.employment)}</dd>
          </div>
          <div>
            <dt>Unemployment rate</dt>
            <dd>{data.labour_market.unemployment_rate.toFixed(1)}%</dd>
          </div>
        </dl>
      </section>

      <section className="detail-section">
        <h4>Industries</h4>
        <p className="subnote">
          Top industries are currently mocked placeholders aligned to selected
          geography level.
        </p>
        <ol className="industry-list">
          {data.industries.slice(0, 5).map((industry) => (
            <li key={industry.name}>
              <span>{industry.name}</span>
              <strong>{industry.employment_share.toFixed(1)}%</strong>
            </li>
          ))}
        </ol>
      </section>

      <section className="detail-section">
        <h4>Evidence links</h4>
        <ul className="link-list">
          {data.migration_evidence.references.map((reference) => (
            <li key={reference.url}>
              <a href={reference.url} target="_blank" rel="noreferrer">
                {reference.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
