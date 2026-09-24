/** Skeleton screen shaped like the product's cards, shown while a screen loads. */
export function PageSkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-label="Loading">
      <div className="sk sk--line" style={{ width: 120 }} />
      <div className="sk sk--title" style={{ width: 'min(420px, 70%)' }} />
      <div className="skeleton-grid">
        <div className="sk sk--card sk--tall" />
        <div className="sk sk--card" />
        <div className="sk sk--card" />
        <div className="sk sk--card" />
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="sk sk--card sk--drill" aria-hidden="true" />
      ))}
    </>
  );
}
