/**
 * Utilidad para resolver avatares de usuario con iniciales estilizadas cuando no hay foto personalizada
 */
export function getAvatarUrl(user, nameFallback = null) {
  const avatar = typeof user === 'string' ? user : (user?.avatar || user?.foto_perfil || user?.vendedor_avatar);
  const name = nameFallback || (typeof user === 'object' && user ? (user.nombre || user.username || user.apodo || 'Usuario') : (typeof user === 'string' ? user : 'Usuario'));

  if (avatar && typeof avatar === 'string' && avatar.trim() !== '') {
    const isBrandLogo = avatar.includes('Logo.jpg') || avatar.includes('logo%20vaca') || avatar.includes('logo vaca');
    if (!isBrandLogo) {
      if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/') || avatar.startsWith('data:image/')) {
        return avatar;
      }
      // Verificar si es un archivo de imagen real con extensión válida
      const hasImageExt = /\.(jpe?g|png|webp|gif|svg|avif)($|\?)/i.test(avatar);
      if (hasImageExt && !avatar.includes(' ') && !avatar.includes('•')) {
        return `/uploads/profiles/${avatar}`;
      }
    }
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=15803d&color=ffffff&bold=true&size=256`;
}

export function handleAvatarError(e, name = 'Usuario') {
  if (!e?.target) return;
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=15803d&color=ffffff&bold=true&size=256`;
  if (e.target.src !== fallback) {
    e.target.src = fallback;
  }
}

