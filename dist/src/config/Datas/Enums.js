"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtTimer = exports.StatusCode = exports.OrganizationStatus = void 0;
var OrganizationStatus;
(function (OrganizationStatus) {
    OrganizationStatus["Active"] = "Active";
    OrganizationStatus["InActive"] = "In Active";
    OrganizationStatus["Rejected"] = "Rejected";
    OrganizationStatus["Blocked"] = "Blocked";
    OrganizationStatus["Pending"] = "Pending";
})(OrganizationStatus || (exports.OrganizationStatus = OrganizationStatus = {}));
var JwtTimer;
(function (JwtTimer) {
    JwtTimer["AccessTokenExpiresInMinutes"] = "15m";
    JwtTimer["RefreshTokenExpiresInDays"] = "7d";
    JwtTimer["OtpTimer"] = "15m";
})(JwtTimer || (exports.JwtTimer = JwtTimer = {}));
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["OK"] = 200] = "OK";
    StatusCode[StatusCode["CREATED"] = 201] = "CREATED";
    StatusCode[StatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCode[StatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCode[StatusCode["SERVER_ERROR"] = 500] = "SERVER_ERROR";
    StatusCode[StatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    StatusCode[StatusCode["CONFLICT"] = 409] = "CONFLICT";
})(StatusCode || (exports.StatusCode = StatusCode = {}));
