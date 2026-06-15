/**
 * @typedef {Object} DiscoverProfileDto
 * @property {number}   userId             - Unique user identifier
 * @property {string}   fullName           - Display name
 * @property {number}   age                - Calculated age
 * @property {string}   gender             - Gender
 * @property {string}   originCountry      - Country of origin
 * @property {string}   originCity         - City of origin
 * @property {string}   currentLocation    - Current city/location
 * @property {string}   bio                - Short bio
 * @property {string}   profilePictureUrl  - URL to profile photo (may be null)
 * @property {string}   verificationStatus - Enum: UNVERIFIED | PENDING | VERIFIED_USER
 * @property {string}   socialBattery      - Enum: INTROVERT | AMBIVERT | EXTROVERT
 * @property {string}   planningStyle      - Enum: SPONTANEOUS | FLEXIBLE | STRICT_ITINERARY
 * @property {string}   budget             - Enum: BUDGET_FRIENDLY | MODERATE | LUXURY
 * @property {string[]} activities         - List of favorite activities
 * @property {string[]} destinationTypes   - List of preferred destination types
 * @property {string[]} experienceTypes    - List of preferred experience types
 * @property {string[]} languages          - Languages spoken
 * @property {string[]} lookingForWho      - Who they travel with
 * @property {string[]} lookingForWhat     - What they are looking for
 * @property {number}   compatibilityScore - 0–100 compatibility score
 * @property {boolean}  saved              - Whether the current user has saved this profile
 */

/**
 * @typedef {Object} DiscoverEventPayload
 * @property {"CARD_CLICK"|"FULL_PROFILE_OPEN"|"DWELL_RECORDED"|"SAVE"|"UNSAVE"} eventType
 * @property {"FEED_CARD"|"FULL_PROFILE"} surface
 * @property {number} [dwellTimeMs] - Only for DWELL_RECORDED events
 */


export {};