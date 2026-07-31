// ─── SHARED HTML EXPORT (Blob download) ───────────────────────────────────────
// Reused by all export points (Executive Briefing, account plans, etc.) — master §3.1.

export function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(href), 1000)
}

export function openHtmlInNewTab(html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  window.open(href, '_blank')
  setTimeout(() => URL.revokeObjectURL(href), 4000)
}
