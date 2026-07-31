export default function HomeSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} aria-busy="true" aria-label="Loading organization intelligence">
      <div className="skel" style={{ height: 260, borderRadius: 'var(--radius-xl)' }} />
      <div>
        <div className="skel" style={{ height: 18, width: 220, marginBottom: 14 }} />
        <div className="skel" style={{ height: 220, borderRadius: 'var(--radius-md)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,1.1fr) minmax(320px,1fr)', gap: 20 }}>
        <div className="skel" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
        <div className="skel" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1, 2].map(i => <div key={i} className="skel" style={{ height: 74, borderRadius: 'var(--radius-md)' }} />)}
      </div>
      <div className="skel" style={{ height: 260, borderRadius: 'var(--radius-md)' }} />
    </div>
  )
}
