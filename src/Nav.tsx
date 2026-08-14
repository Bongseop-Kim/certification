import { useEffect, useRef } from 'react'

export function Nav({ title, meta, onBack }: { title: string; meta?: string; onBack?: () => void }) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (document.activeElement === document.body) titleRef.current?.focus()
  }, [])

  return (
    <header className="navbar">
      {onBack && (
        <button className="back" onClick={onBack} aria-label="뒤로">
          ←
        </button>
      )}
      <h1 className="t" ref={titleRef} tabIndex={-1}>{title}</h1>
      {meta && <span className="meta">{meta}</span>}
    </header>
  )
}
