export function Nav({ title, meta, onBack }: { title: string; meta?: string; onBack?: () => void }) {
  return (
    <div className="navbar">
      {onBack && (
        <button className="back" onClick={onBack} aria-label="뒤로">
          ←
        </button>
      )}
      <span className="t">{title}</span>
      {meta && <span className="meta">{meta}</span>}
    </div>
  )
}
