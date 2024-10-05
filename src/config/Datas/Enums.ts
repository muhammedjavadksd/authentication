

enum OrganizationStatus {
    Active = "Active",
    InActive = "In Active",
    Rejected = "Rejected",
    Blocked = "Blocked",
    Pending = "Pending"
}

enum JwtTimer {
    AccessTokenExpiresInMinutes = "15m",   // Access token expires in 15 minutes
    RefreshTokenExpiresInDays = "7d",       // Refresh token expires in 7 days
    OtpTimer = "15m",       // Refresh token expires in 7 days
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

export { OrganizationStatus, StatusCode, JwtTimer }