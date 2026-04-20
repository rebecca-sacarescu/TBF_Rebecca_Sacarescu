/**
 * @typedef {Object} MatchResponseDto
 * @property {number}   matchId            - Unique match identifier, used for DELETE /matches/{matchId}
 * @property {number}   otherUserId        - userId of the other person in the match
 * @property {string}   fullName           - Display name of the matched user
 * @property {number}   age                - Age of the matched user
 * @property {string}   currentLocation    - Current city/location of the matched user
 * @property {string}   originCountry      - Country of origin of the matched user
 * @property {string}   profilePictureUrl  - URL to profile photo (may be null/empty)
 * @property {string}   bio                - Short bio of the matched user
 * @property {string}   socialBattery      - Enum: INTROVERT | AMBIVERT | EXTROVERT
 * @property {string}   planningStyle      - Enum: SPONTANEOUS | FLEXIBLE | STRICT_ITINERARY
 * @property {string}   budget             - Enum: BUDGET_FRIENDLY | MODERATE | LUXURY
 * @property {number}   compatibilityScore - 0–100 compatibility percentage
 * @property {boolean}  superLikeInvolved  - true if either user used SUPER_LIKE
 * @property {string}   matchedAt          - ISO 8601 date-time string
 * @property {string[]} contextBadges      - Array of short context badge strings
 * @property {string}   whyYouMatched      - Human-readable explanation string from backend
 */

// ASSUMPTION: all fields above come directly from MatchResponseDto on the backend.
// superLikeInvolved is used for badge rendering and is already factored into backend sort order.
// Do not reorder the matches list in frontend — backend handles sort.
export {};