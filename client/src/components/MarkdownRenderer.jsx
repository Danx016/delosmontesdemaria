import React from 'react'

/**
 * Renderizador ligero y elegante de Markdown para respuestas de IA.
 * Soporta:
 * - Encabezados (#, ##, ###)
 * - Tablas Markdown (| col | col |)
 * - Negritas (**texto**)
 * - Cursivas (*texto*, _texto_)
 * - Listas numeradas (1. item) y con viñetas (- item, * item)
 * - Líneas divisorias (---)
 * - Código inline (`code`)
 * - Enlaces ([texto](url))
 */

// Helper para procesar formato en línea: negrita, cursiva, código, links
function renderInline(text, keyPrefix = 'inline') {
  if (!text) return ''

  // Tokenizar por negritas, código inline, enlaces, cursivas
  // Regex que busca `code`, **bold**, *italic*, [link](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g

  const parts = text.split(regex)
  if (parts.length === 1) return text

  return parts.map((part, index) => {
    const k = `${keyPrefix}-${index}`

    // `código inline`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={k}
          style={{
            background: 'var(--bg-alt, #f1f5f9)',
            color: 'var(--primary-color, #15803d)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.86em',
            fontFamily: 'monospace',
            border: '1px solid var(--border-color, #e2e8f0)'
          }}
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    // **Negrita**
    if ((part.startsWith('**') && part.endsWith('**') && part.length > 4) ||
        (part.startsWith('__') && part.endsWith('__') && part.length > 4)) {
      return (
        <strong key={k} style={{ fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
          {renderInline(part.slice(2, -2), `${k}-b`)}
        </strong>
      )
    }

    // *Cursiva*
    if ((part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
        (part.startsWith('_') && part.endsWith('_') && part.length > 2)) {
      return (
        <em key={k} style={{ fontStyle: 'italic' }}>
          {renderInline(part.slice(1, -1), `${k}-i`)}
        </em>
      )
    }

    // [Enlace](url)
    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (linkMatch) {
      return (
        <a
          key={k}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
        >
          {linkMatch[1]}
        </a>
      )
    }

    return part
  })
}

// Verifica si una línea es separador de tabla: |---|---| o |:---|:---:|
function isTableSeparator(line) {
  const trimmed = line.trim()
  return /^\|?(\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?$/.test(trimmed)
}

// Extrae celdas de una fila de tabla Markdown
function parseTableRow(line) {
  let trimmed = line.trim()
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1)
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1)
  return trimmed.split('|').map((c) => c.trim())
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content || typeof content !== 'string') return null

  const rawLines = content.split('\n')
  const blocks = []
  let i = 0

  while (i < rawLines.length) {
    const line = rawLines[i]
    const trimmed = line.trim()

    // 1. Detectar inicio de tabla Markdown
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && i + 1 < rawLines.length && isTableSeparator(rawLines[i + 1])) {
      const headers = parseTableRow(line)
      i += 2 // Saltar fila de encabezado y separador
      const rows = []

      while (i < rawLines.length && rawLines[i].trim().startsWith('|')) {
        const rowCells = parseTableRow(rawLines[i])
        if (rowCells.some((c) => c.length > 0)) {
          rows.push(rowCells)
        }
        i++
      }

      blocks.push({
        type: 'table',
        headers,
        rows
      })
      continue
    }

    // 2. Encabezados (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      const match = /^(#{1,6})\s+(.*)$/.exec(trimmed)
      if (match) {
        const level = match[1].length
        blocks.push({
          type: 'heading',
          level,
          text: match[2]
        })
        i++
        continue
      }
    }

    // 3. Separador horizontal (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // 4. Lista numerada (1. item)
    const numMatch = /^(\d+)\.\s+(.*)$/.exec(trimmed)
    if (numMatch) {
      blocks.push({
        type: 'numbered-item',
        number: numMatch[1],
        text: numMatch[2]
      })
      i++
      continue
    }

    // 5. Lista con viñeta (- item, * item, • item)
    const bulletMatch = /^([*\-•])\s+(.*)$/.exec(trimmed)
    if (bulletMatch) {
      blocks.push({
        type: 'bullet-item',
        text: bulletMatch[2]
      })
      i++
      continue
    }

    // 6. Línea en blanco
    if (!trimmed) {
      blocks.push({ type: 'spacer' })
      i++
      continue
    }

    // 7. Párrafo de texto normal
    blocks.push({
      type: 'paragraph',
      text: line
    })
    i++
  }

  return (
    <div className={`ai-markdown-output ${className}`} style={{ lineHeight: 1.6 }}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'table':
            return (
              <div
                key={idx}
                style={{
                  overflowX: 'auto',
                  margin: '0.85rem 0',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  background: 'var(--card-bg, #ffffff)'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: '0.85rem'
                  }}
                >
                  <thead>
                    <tr style={{ background: 'var(--bg-alt, #f8fafc)', borderBottom: '2px solid var(--border-color, #e2e8f0)' }}>
                      {block.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          style={{
                            padding: '9px 12px',
                            fontWeight: 700,
                            color: 'var(--text-main, #0f172a)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {renderInline(h, `th-${idx}-${hIdx}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: rIdx < block.rows.length - 1 ? '1px solid var(--border-color, #e2e8f0)' : 'none',
                          background: rIdx % 2 === 1 ? 'rgba(0, 0, 0, 0.015)' : 'transparent'
                        }}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: '8px 12px',
                              color: 'var(--text-main, #1e293b)',
                              verticalAlign: 'top'
                            }}
                          >
                            {renderInline(cell, `td-${idx}-${rIdx}-${cIdx}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'heading': {
            const headingStyles = {
              1: { fontSize: '1.25rem', fontWeight: 800, margin: '1rem 0 0.4rem', color: 'var(--text-main, #0f172a)' },
              2: { fontSize: '1.1rem', fontWeight: 800, margin: '0.9rem 0 0.35rem', color: 'var(--primary-color, #15803d)', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '0.3rem' },
              3: { fontSize: '0.98rem', fontWeight: 700, margin: '0.75rem 0 0.3rem', color: 'var(--text-main, #1e293b)' },
              4: { fontSize: '0.92rem', fontWeight: 700, margin: '0.65rem 0 0.25rem', color: 'var(--text-main, #334155)' },
            }
            const Tag = block.level <= 2 ? 'h4' : 'h5'
            const s = headingStyles[block.level] || headingStyles[3]
            return (
              <Tag key={idx} style={s}>
                {renderInline(block.text, `h-${idx}`)}
              </Tag>
            )
          }

          case 'hr':
            return (
              <hr
                key={idx}
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--border-color, #e2e8f0)',
                  margin: '0.85rem 0'
                }}
              />
            )

          case 'numbered-item':
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.45rem',
                  margin: '0.3rem 0',
                  paddingLeft: '0.2rem'
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    color: 'var(--primary-color, #15803d)',
                    fontSize: '0.9rem',
                    minWidth: '1.2rem',
                    flexShrink: 0
                  }}
                >
                  {block.number}.
                </span>
                <div style={{ flex: 1, fontSize: '0.9rem' }}>
                  {renderInline(block.text, `num-${idx}`)}
                </div>
              </div>
            )

          case 'bullet-item':
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  margin: '0.25rem 0',
                  paddingLeft: '0.4rem'
                }}
              >
                <span
                  style={{
                    color: 'var(--primary-color, #15803d)',
                    fontSize: '1rem',
                    lineHeight: 1,
                    flexShrink: 0
                  }}
                >
                  •
                </span>
                <div style={{ flex: 1, fontSize: '0.9rem' }}>
                  {renderInline(block.text, `bullet-${idx}`)}
                </div>
              </div>
            )

          case 'spacer':
            return <div key={idx} style={{ height: '0.45rem' }} />

          case 'paragraph':
          default:
            return (
              <p
                key={idx}
                style={{
                  margin: '0.35rem 0',
                  fontSize: '0.9rem',
                  color: 'inherit'
                }}
              >
                {renderInline(block.text, `p-${idx}`)}
              </p>
            )
        }
      })}
    </div>
  )
}
