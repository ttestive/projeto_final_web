'use client'

/**
 * Specialized tests for chart components
 */

/**
 * Tests if chart data format is valid
 * @param {Array} data - Chart data array
 * @returns {boolean} - True if data format is valid, false otherwise
 */
export function validateChartDataFormat(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }
  
  // Check that all items have required properties
  return data.every(item => {
    return (
      typeof item === 'object' && 
      'subject' in item && 
      'grade' in item &&
      typeof item.subject === 'string' && 
      typeof item.grade === 'number'
    );
  });
}

/**
 * Tests if chart data values are within valid ranges
 * @param {Array} data - Chart data array
 * @param {number} minGrade - Minimum valid grade (default: 0)
 * @param {number} maxGrade - Maximum valid grade (default: 10)
 * @returns {boolean} - True if all values are within range, false otherwise
 */
export function validateChartDataRanges(data, minGrade = 0, maxGrade = 10) {
  if (!validateChartDataFormat(data)) {
    return false;
  }
  
  return data.every(item => {
    return item.grade >= minGrade && item.grade <= maxGrade;
  });
}

/**
 * Calculates average grade from chart data
 * @param {Array} data - Chart data array
 * @returns {number} - Average grade or 0 if data is invalid
 */
export function calculateAverageFromChartData(data) {
  if (!validateChartDataFormat(data) || data.length === 0) {
    return 0;
  }
  
  const total = data.reduce((sum, item) => sum + item.grade, 0);
  return total / data.length;
}

/**
 * Finds the highest grade from chart data
 * @param {Array} data - Chart data array
 * @returns {object|null} - Object with subject and grade of highest grade or null if data is invalid
 */
export function findHighestGradeFromChartData(data) {
  if (!validateChartDataFormat(data) || data.length === 0) {
    return null;
  }
  
  return data.reduce((highest, current) => {
    return current.grade > highest.grade ? current : highest;
  }, data[0]);
}

/**
 * Sample chart data for testing
 */
export const sampleChartData = [
  { subject: 'Matemática', grade: 8.5 },
  { subject: 'Português', grade: 7.0 },
  { subject: 'História', grade: 9.0 },
  { subject: 'Geografia', grade: 6.5 },
  { subject: 'Física', grade: 7.5 }
];

/**
 * Mock function to simulate getting chart data from API
 * @returns {Promise<Array>} - Promise that resolves to chart data
 */
export function getMockChartData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleChartData);
    }, 500);
  });
}

/**
 * Tests for chart data processing
 */
export const chartDataTestSuite = [
  {
    name: 'Chart data format validation - Valid data',
    testFn: () => validateChartDataFormat(sampleChartData)
  },
  {
    name: 'Chart data format validation - Invalid data',
    testFn: () => !validateChartDataFormat([{ wrong: 'format' }])
  },
  {
    name: 'Chart data range validation - Valid range',
    testFn: () => validateChartDataRanges(sampleChartData)
  },
  {
    name: 'Calculate average from chart data',
    testFn: () => {
      const avg = calculateAverageFromChartData(sampleChartData);
      return Math.abs(avg - 7.7) < 0.01; // Allow small rounding differences
    }
  },
  {
    name: 'Find highest grade from chart data',
    testFn: () => {
      const highest = findHighestGradeFromChartData(sampleChartData);
      return highest && highest.subject === 'História' && highest.grade === 9.0;
    }
  }
];