// Utility functions for babysitter availability validation and helpers

/**
 * Check if a booking time falls within babysitter availability
 * @param {Array} availabilitySlots - Array of availability slots
 * @param {Date} startDate - Booking start date
 * @param {Date} endDate - Booking end date
 * @returns {Object} - {isValid: boolean, message: string, availableTimes: string[]}
 */
export function validateBookingAvailability(availabilitySlots, startDate, endDate) {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  if (!availabilitySlots || availabilitySlots.length === 0) {
    return {
      isValid: false,
      message: "No availability information found for this babysitter",
      availableTimes: []
    }
  }

  // Check if booking spans multiple days
  if (startDate.toDateString() !== endDate.toDateString()) {
    return {
      isValid: false,
      message: "Bookings cannot span multiple days. Please create separate bookings for each day.",
      availableTimes: []
    }
  }

  const dayOfWeek = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1 // Convert to Monday=0 format
  const startTime = startDate.toTimeString().slice(0, 5) // HH:MM format
  const endTime = endDate.toTimeString().slice(0, 5)

  // Find matching availability slots for the day
  const daySlots = availabilitySlots.filter(slot => slot.day_of_week === dayOfWeek)
  
  if (daySlots.length === 0) {
    const availableDays = [...new Set(availabilitySlots.map(slot => dayNames[slot.day_of_week]))]
    return {
      isValid: false,
      message: `This babysitter is not available on ${dayNames[dayOfWeek]}. Available days: ${availableDays.join(', ')}`,
      availableTimes: []
    }
  }

  // Check if any slot covers the entire booking time
  const isAvailable = daySlots.some(slot => {
    return startTime >= slot.start_time && endTime <= slot.end_time
  })

  const availableTimes = daySlots.map(slot => `${slot.start_time}-${slot.end_time}`)

  if (!isAvailable) {
    return {
      isValid: false,
      message: `This babysitter is not available at the selected time on ${dayNames[dayOfWeek]}. Available times: ${availableTimes.join(', ')}`,
      availableTimes
    }
  }

  return {
    isValid: true,
    message: "Booking time is within availability",
    availableTimes
  }
}

/**
 * Group availability slots by day of week
 * @param {Array} availabilitySlots - Array of availability slots
 * @returns {Object} - Grouped slots by day
 */
export function groupAvailabilityByDay(availabilitySlots) {
  const grouped = {}
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  if (!availabilitySlots) return grouped

  availabilitySlots.forEach(slot => {
    const dayName = dayNames[slot.day_of_week]
    if (!grouped[dayName]) {
      grouped[dayName] = []
    }
    grouped[dayName].push(slot)
  })

  return grouped
}

/**
 * Format availability for display
 * @param {Array} availabilitySlots - Array of availability slots
 * @returns {Array} - Formatted availability strings
 */
export function formatAvailabilityForDisplay(availabilitySlots) {
  const grouped = groupAvailabilityByDay(availabilitySlots)
  const formatted = []

  Object.entries(grouped).forEach(([dayName, slots]) => {
    const timeRanges = slots.map(slot => `${slot.start_time} - ${slot.end_time}`)
    formatted.push(`${dayName}: ${timeRanges.join(', ')}`)
  })

  return formatted
}

/**
 * Check for overlapping time slots
 * @param {Array} existingSlots - Existing availability slots for the same day
 * @param {string} startTime - New slot start time (HH:MM)
 * @param {string} endTime - New slot end time (HH:MM)
 * @returns {Object} - {hasOverlap: boolean, conflictingSlot: object|null}
 */
export function checkTimeSlotOverlap(existingSlots, startTime, endTime) {
  for (const slot of existingSlots) {
    if (startTime < slot.end_time && endTime > slot.start_time) {
      return {
        hasOverlap: true,
        conflictingSlot: slot
      }
    }
  }
  
  return {
    hasOverlap: false,
    conflictingSlot: null
  }
}

/**
 * Generate time options for availability form
 * @param {number} intervalMinutes - Interval between time options (default: 30)
 * @returns {Array} - Array of time strings in HH:MM format
 */
export function generateTimeOptions(intervalMinutes = 30) {
  const times = []
  const startHour = 6 // 6 AM
  const endHour = 23 // 11 PM
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      times.push(timeString)
    }
  }
  
  return times
}