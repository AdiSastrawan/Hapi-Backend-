class AuthenticationsHandler {
  constructor(usersService, authenticationService, tokenManager, validator) {
    this.usersService = usersService;
    this.authenticationService = authenticationService;
    this.tokenManager = tokenManager;
    this.validator = validator;
  }
  async postAuthenticationHandler(request, h) {
    this.validator.validatePostAuthenticationPayload(request.payload);
    const { username, password } = request.payload;
    const id = await this.usersService.verifyUserCredentials(username, password)
    const accessToken = await this.tokenManager.generateAccessToken({ id })
    const refreshToken = await this.tokenManager.generateRefreshToken({ id })

    await this.authenticationService.addRefreshToken(refreshToken)
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    })
    response.code(201)
    return response
  }
  async putAuthenticationHandler(request) {
    this.validator.validatePutAuthenticationPayload(request.payload)
    const { refreshToken } = request.payload
    await this.authenticationService.verifyRefreshToken(refreshToken)
    const { id } = this.tokenManager.verifyRefreshToken(refreshToken)
    const accessToken = await this.tokenManager.generateAccessToken({ id });
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    }
  }
  async deleteAuthenticationHandler(request) {
    this.validator.validateDeleteAuthenticationPayload(request.payload)
    const { refreshToken } = request.payload
    await this.authenticationService.verifyRefreshToken(refreshToken)
    await this.authenticationService.deleteRefreshToken(refreshToken)
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler
