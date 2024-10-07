
enum JwtTimer {
    AccessTokenExpiresInMinutes = "15m",
    RefreshTokenExpiresInDays = "7d",
    OtpTimer = "15m",
}

enum StatusCode {
    OK = 200,
    CREATED = 201,
    UNAUTHORIZED = 401,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    SERVER_ERROR = 500,
    FORBIDDEN = 403,
    CONFLICT = 409,
}

export { StatusCode, JwtTimer }