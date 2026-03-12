// Utility functions for booking conflict detection and validation

/**
 * Check if two date ranges overlap
 * @param {Date} start1 - Start of first range
 * @param {Date} end1 - End of first range
 * @param {Date} start2 - Start of second range
 * @param {Date} end2 - End of second range
 * @returns {boolean} - True if ranges overlap
 */
export function checkDateRangeOverlap(start1, end1, start2, end2) {
  return start1 < end2 && end1 > start2
}

/**
 * Check for booking conflicts with existing bookings
 * @param {Array} existingBookings - Array of existing bookings
 * @param {Date} newStartDate - New booking start date
 * @param {Date} newEndDate - New booking end date
 * @returns {Object} - {hasConflict: boolean, conflictingBooking: object|null}
 */
export function checkBookingConflicts(existingBookings, newStartDate, newEndDate) {
  if (!existingBookings || existingBookings.length === 0) {
    return { hasConflict: false, conflictingBooking: null }
  }

  for (const booking of existingBookings) {
    const existingStart = new Date(booking.start_date)
    const existingEnd = new Date(booking.end_date)
    
    if (checkDateRangeOverlap(existingStart, existingEnd, newStartDate, newEndDate)) {
      return {
        hasConflict: true,
        conflictingBooking: booking
      }
    }
  }
  
  return { hasConflict: false, conflictingBooking: null }
}

/**
 * Validate basic booking request data
 * @param {Object} bookingData - Booking request data
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export function validateBookingRequest(bookingData) {
  const errors = []
  const { start_date, end_date, child, babysitter } = bookingData

  // Check if required fields are present
  if (!child) {
    errors.push('Child selection is required')
  }

  if (!start_date) {
    errors.push('Start date and time is required')
  }

  if (!end_date) {    
    errors.push('End date and time is required')
  }

  if (start_date && end_date) {
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    const now = new Date()

    // Check if start date is in the future
    if (startDate <= now) {
      errors.push('Booking date must be in the future')
    }

    // Check if start time is before end time
    if (startDate >= endDate) {
      errors.push('End time must be after start time')
    }

    // Check if booking spans multiple days
    if (startDate.toDateString() !== endDate.toDateString()) {
      errors.push('Bookings cannot span multiple days. Please create separate bookings for each day.')
    }

    // Check if booking is reasonable duration (not more than 12 hours)
    const durationHours = (endDate - startDate) / (1000 * 60 * 60)
    if (durationHours > 12) {
      errors.push('Booking duration cannot exceed 12 hours')
    }

    // Check if booking is at least 1 hour
    if (durationHours < 1) {
      errors.push('Booking must be at least 1 hour long')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Format booking conflict error message
 * @param {Object} conflictingBooking - The booking that conflicts
 * @returns {string} - Formatted error message
 */
export function formatConflictErrorMessage(conflictingBooking) {
  const startTime = new Date(conflictingBooking.start_date).toLocaleString()
  const endTime = new Date(conflictingBooking.end_date).toLocaleString()
  
  return `Selected time overlaps with an existing booking (${startTime} - ${endTime}). Please choose a different time.`
}

/**
 * Get time slots that are unavailable due to existing bookings
 * @param {Array} existingBookings - Array of existing bookings for a date
 * @returns {Array} - Array of unavailable time ranges
 */
export function getUnavailableTimeSlots(existingBookings) {
  if (!existingBookings || existingBookings.length === 0) return []

  return existingBookings.map(booking => ({
    start: new Date(booking.start_date),
    end: new Date(booking.end_date),
    id: booking.id,
    status: booking.status,
    startTime: booking.start_time || new Date(booking.start_date).toTimeString().slice(0, 5),
    endTime: booking.end_time || new Date(booking.end_date).toTimeString().slice(0, 5)
  }))
}

/**
 * Check if a proposed time slot conflicts with babysitter availability
 * @param {Array} availabilitySlots - Babysitter's availability
 * @param {Date} startDate - Proposed start date/time
 * @param {Date} endDate - Proposed end date/time
 * @returns {Object} - {isWithinAvailability: boolean, message: string}
 */
export function checkAvailabilityConflict(availabilitySlots, startDate, endDate) {
  if (!availabilitySlots || availabilitySlots.length === 0) {
    return {
      isWithinAvailability: false,
      message: "No availability information found for this babysitter"
    }
  }

  const dayOfWeek = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1 // Convert to Monday=0 format
  const startTime = startDate.toTimeString().slice(0, 5) // HH:MM format
  const endTime = endDate.toTimeString().slice(0, 5)

  // Find matching availability slots for the day
  const daySlots = availabilitySlots.filter(slot => slot.day_of_week === dayOfWeek)
  
  if (daySlots.length === 0) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return {
      isWithinAvailability: false,
      message: `This babysitter is not available on ${dayNames[dayOfWeek]}`
    }
  }

  // Check if any slot covers the entire booking time
  const isAvailable = daySlots.some(slot => {
    return startTime >= slot.start_time && endTime <= slot.end_time
  })

  if (!isAvailable) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const availableTimes = daySlots.map(slot => `${slot.start_time}-${slot.end_time}`)
    return {
      isWithinAvailability: false,
      message: `This babysitter is not available at the selected time on ${dayNames[dayOfWeek]}. Available times: ${availableTimes.join(', ')}`
    }
  }

  return {
    isWithinAvailability: true,
    message: "Time slot is within babysitter availability"
  }
}