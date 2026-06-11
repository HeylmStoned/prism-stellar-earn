import React from 'react';
import { depositPipeline, pipelineSummary } from '@prism/stellar-earn-core';

const statusLabel: Record<string, string> = {
  done: 'Done',
  wip: 'In progress',
  planned: 'Planned',
};

export function ImplementationPipeline() {
  const summary = pipelineSummary();

  return (
    <section className="panel" id="implementation-progress">
      <div className="section-header">
        <div>
          <p className="eyebrow">Work in progress</p>
          <h2>Implementation pipeline</h2>
          <p className="muted">
            Public tracker aligned with the Prism Stellar architecture doc. This repo shows what is shipped, what is
            actively being built, and what remains private production work.
          </p>
        </div>
        <a className="button-secondary" href="https://github.com/HeylmStoned/prism-stellar-earn/blob/main/docs/architecture.md" rel="noreferrer" target="_blank">
          Architecture doc
        </a>
      </div>

      <div className="grid-3">
        <div className="mini-card">
          <p className="eyebrow">Done</p>
          <h3>{summary.done}</h3>
          <p className="muted">Live in the public demo or packages.</p>
        </div>
        <div className="mini-card">
          <p className="eyebrow">In progress</p>
          <h3>{summary.wip}</h3>
          <p className="muted">Active engineering in this repo.</p>
        </div>
        <div className="mini-card">
          <p className="eyebrow">Planned</p>
          <h3>{summary.planned}</h3>
          <p className="muted">Next milestones after current WIP.</p>
        </div>
      </div>

      <div className="pipeline-list">
        {depositPipeline.map((step) => (
          <article className="pipeline-row" key={step.id}>
            <div>
              <p className="eyebrow">{step.layer}</p>
              <h3>{step.title}</h3>
              <p className="muted">{step.description}</p>
            </div>
            <span className={`pipeline-status pipeline-status-${step.status}`}>{statusLabel[step.status]}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
