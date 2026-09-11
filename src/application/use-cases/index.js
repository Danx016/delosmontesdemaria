/**
 * Exportador centralizado de Casos de Uso (Application Layer)
 */
module.exports = {
  auth: {
    LoginUser: require('./auth/LoginUser'),
    RegisterUser: require('./auth/RegisterUser'),
    GoogleAuthUser: require('./auth/GoogleAuthUser'),
    RequestPasswordReset: require('./auth/RequestPasswordReset'),
    ResetPassword: require('./auth/ResetPassword')
  },
  product: {
    CreateProduct: require('./product/CreateProduct'),
    UpdateProduct: require('./product/UpdateProduct'),
    DeleteProduct: require('./product/DeleteProduct'),
    SearchProducts: require('./product/SearchProducts')
  },
  purchase: {
    GenerateWompiSignature: require('./purchase/GenerateWompiSignature'),
    UpdateOrderStatus: require('./purchase/UpdateOrderStatus')
  },
  admin: {
    GetAdminStats: require('./admin/GetAdminStats'),
    ManageUsersAdmin: require('./admin/ManageUsersAdmin'),
    ProcessAdminAIChat: require('./admin/ProcessAdminAIChat')
  },
  banner: {
    ObtenerBannersUseCase: require('./banner/ObtenerBannersUseCase')
  },
  chat: {
    ProcessPublicAIChat: require('./chat/ProcessPublicAIChat')
  },
  coupon: {
    ValidarCuponUseCase: require('./coupon/ValidarCuponUseCase')
  },
  support: {
    ProcessSupportAIChat: require('./support/ProcessSupportAIChat')
  },
  user: {
    DeleteAccount: require('./user/DeleteAccount'),
    ManageAddresses: require('./user/ManageAddresses'),
    UpdateProfile: require('./user/UpdateProfile')
  }
};
