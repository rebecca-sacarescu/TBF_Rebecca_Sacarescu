/**
 * @typedef {"OPEN" | "FULL" | "CLOSED" | "CANCELLED"} TripStatus
 * @typedef {"CITY_BREAK" | "ROAD_TRIP" | "BEACH_ESCAPE" | "HIKING_NATURE" | "CULTURE_FOOD" | "BACKPACKING"} TripType
 * @typedef {"BUDGET_FRIENDLY" | "MODERATE" | "LUXURY"} Budget
 * @typedef {"PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"} TripJoinRequestStatus
 */

/**
 * @typedef {Object} CreateTripInputDto
 * @property {string} title
 * @property {string} destinationCity
 * @property {string} destinationCountry
 * @property {string} startDate
 * @property {string} endDate
 * @property {Budget} budget
 * @property {TripType} tripType
 * @property {string} description
 * @property {number} targetGroupSize
 */

/**
 * @typedef {Object} TripCardResponseDto
 * @property {number} tripId
 * @property {number} ownerUserId
 * @property {string} ownerFullName
 * @property {string|null} ownerProfilePictureUrl
 * @property {string} title
 * @property {string} destinationCity
 * @property {string} destinationCountry
 * @property {string} startDate
 * @property {string} endDate
 * @property {Budget} budget
 * @property {TripType} tripType
 * @property {string} description
 * @property {number} targetGroupSize
 * @property {number} currentMemberCount
 * @property {number} spotsLeft
 * @property {TripStatus} status
 */

/**
 * @typedef {Object} TripJoinRequestResponseDto
 * @property {number} requestId
 * @property {number} requesterUserId
 * @property {string} requesterFullName
 * @property {string|null} requesterProfilePictureUrl
 * @property {string|null} requesterCurrentLocation
 * @property {string} message
 * @property {TripJoinRequestStatus} status
 * @property {string} createdAt
 */