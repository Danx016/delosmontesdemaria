import React, { useState, useEffect } from 'react'
import { getProductImageUrl } from '../utils/productImage'

/**
 * Universal Media Renderer:
 * Handles inline SVG strings, HTML snippets, direct URLs, uploaded category/product files,
 * blob previews, and clean FontAwesome icon fallbacks without unwanted default logos.
 */
export default function MediaRenderer({
  src,
  alt = 'Media',
  icon = 'fa-box',
  color = '#2e7d32',
  className = '',
  style = {},
  fallbackSrc = null,
  type = 'category' // 'category' | 'product'
}) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  const content = (src || '').trim()

  // Si hubo error de carga o no hay contenido, renderizamos el icono limpio
  if (hasError || !content) {
    return (
      <div
        className={`media-icon-fallback ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: color || 'var(--primary-color)',
          fontSize: '1.25rem',
          ...style,
        }}
      >
        <i className={`fa ${icon || 'fa-box'}`} />
      </div>
    )
  }

  // 1. Detectar si es código SVG o snippet HTML
  if (
    content.startsWith('<') &&
    (content.includes('svg') ||
      content.includes('img') ||
      content.includes('path') ||
      content.includes('div') ||
      content.includes('span') ||
      content.includes('i '))
  ) {
    return (
      <div
        className={`media-html-container ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  // 2. Si es una URL o nombre de archivo de imagen
  let finalSrc = content
  if (type === 'product') {
    finalSrc = getProductImageUrl(content)
  } else {
    if (!content.startsWith('http') && !content.startsWith('data:') && !content.startsWith('/') && !content.startsWith('blob:')) {
      if (content.startsWith('uploads/')) {
        finalSrc = `/${content}`
      } else if (content.startsWith('categories/') || content.startsWith('products/') || content.startsWith('profiles/') || content.startsWith('banners/')) {
        finalSrc = `/uploads/${content}`
      } else {
        finalSrc = `/uploads/categories/${content}`
      }
    }
  }

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...style,
      }}
      onError={() => {
        if (fallbackSrc) {
          setHasError(true)
        } else {
          setHasError(true)
        }
      }}
    />
  )
}
