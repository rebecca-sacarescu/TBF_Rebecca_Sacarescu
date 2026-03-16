/**
 * @typedef {Object} SignupRequest
 * @property {string} email
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} AuthResponseDto
 * @property {string} token
 */

// ASSUMPTION: AuthResponseDto has a field called "token".
// If your backend returns "accessToken" or "jwt", update TokenService and API calls accordingly.

export {};