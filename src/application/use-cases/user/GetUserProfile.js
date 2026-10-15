/**
 * Caso de Uso: GetUserProfile
 * Obtiene la información del perfil del usuario autenticado
 */
class GetUserProfile {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  async execute(userId) {
    if (!userId) throw new Error('ID de usuario requerido');
    const user = await this.usuarioRepository.buscarPorId(userId);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }
}

module.exports = GetUserProfile;
