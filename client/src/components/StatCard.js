import React from 'react';

export function StatCard({ label, value, hint }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <p className="muted">{hint}</p> : null}
    </article>
  );
}
