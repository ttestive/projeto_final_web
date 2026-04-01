'use client'

/**
 * Unit test utilities for testing individual components and functions
 */

/**
 * Runs a single test and reports the result
 * @param {string} testName - Name of the test
 * @param {function} testFn - Test function that returns true if test passes, false if it fails
 * @returns {object} - Test result object
 */
export function runTest(testName, testFn) {
  console.log(`Running test: ${testName}`);
  try {
    const result = testFn();
    if (result) {
      console.log(`✅ PASS: ${testName}`);
      return { name: testName, passed: true, message: 'Test passed' };
    } else {
      console.log(`❌ FAIL: ${testName}`);
      return { name: testName, passed: false, message: 'Test failed' };
    }
  } catch (error) {
    console.error(`❌ ERROR: ${testName}`, error);
    return { name: testName, passed: false, message: `Error: ${error.message}` };
  }
}

/**
 * Runs a set of tests and collects results
 * @param {Array} tests - Array of test objects with name and testFn properties
 * @returns {Array} - Array of test results
 */
export function runTestSuite(tests) {
  console.log(`Running test suite with ${tests.length} tests`);
  return tests.map(test => runTest(test.name, test.testFn));
}

/**
 * Asserts that two values are equal
 * @param {any} actual - Actual value
 * @param {any} expected - Expected value
 * @returns {boolean} - True if values are equal, false otherwise
 */
export function assertEquals(actual, expected) {
  if (typeof actual === 'object' && typeof expected === 'object') {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
  return actual === expected;
}

/**
 * Asserts that a value is truthy
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is truthy, false otherwise
 */
export function assertTruthy(value) {
  return !!value;
}

/**
 * Asserts that a value is falsy
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is falsy, false otherwise
 */
export function assertFalsy(value) {
  return !value;
}

/**
 * Asserts that a string contains a substring
 * @param {string} string - String to check
 * @param {string} substring - Substring to look for
 * @returns {boolean} - True if string contains substring, false otherwise
 */
export function assertContains(string, substring) {
  return string.includes(substring);
}

/**
 * Asserts that an array contains an item
 * @param {Array} array - Array to check
 * @param {any} item - Item to look for
 * @returns {boolean} - True if array contains item, false otherwise
 */
export function assertArrayContains(array, item) {
  if (typeof item === 'object') {
    return array.some(element => JSON.stringify(element) === JSON.stringify(item));
  }
  return array.includes(item);
}

/**
 * Test functions for student data processing
 */

/**
 * Test function that validates a student object has all required properties
 * @param {object} student - Student object to validate
 * @returns {boolean} - True if student has all required properties, false otherwise
 */
export function validateStudentObject(student) {
  return (
    student &&
    typeof student === 'object' &&
    'nome' in student &&
    'idade' in student &&
    'materias' in student &&
    Array.isArray(student.materias)
  );
}

/**
 * Test function that calculates the average grade for a student
 * @param {object} student - Student object with materias array
 * @returns {number} - Average grade or 0 if no grades
 */
export function calculateStudentAverage(student) {
  if (!validateStudentObject(student) || student.materias.length === 0) {
    return 0;
  }
  
  const total = student.materias.reduce((sum, materia) => {
    const grade = parseFloat(materia.nota);
    return sum + (isNaN(grade) ? 0 : grade);
  }, 0);
  
  return total / student.materias.length;
}

/**
 * Test function to check if a student is passing based on average grade
 * @param {object} student - Student object
 * @param {number} passingGrade - Minimum grade to pass (default: 7)
 * @returns {boolean} - True if student is passing, false otherwise
 */
export function isStudentPassing(student, passingGrade = 7) {
  const average = calculateStudentAverage(student);
  return average >= passingGrade;
}

/**
 * Sample test data for running tests
 */
export const sampleStudentData = {
  nome: 'João Silva',
  idade: 20,
  faltas: 3,
  materias: [
    { nome: 'Matemática', nota: 8.5 },
    { nome: 'Português', nota: 7.0 },
    { nome: 'História', nota: 9.0 },
    { nome: 'Geografia', nota: 6.5 }
  ]
};

/**
 * Sample test suite for student data functions
 */
export const studentDataTestSuite = [
  {
    name: 'Student object validation - Valid student',
    testFn: () => validateStudentObject(sampleStudentData)
  },
  {
    name: 'Student object validation - Invalid student',
    testFn: () => !validateStudentObject({ nome: 'Test' })
  },
  {
    name: 'Calculate student average - Valid calculation',
    testFn: () => assertEquals(calculateStudentAverage(sampleStudentData), 7.75)
  },
  {
    name: 'Student passing status - Student is passing',
    testFn: () => isStudentPassing(sampleStudentData)
  },
  {
    name: 'Student passing status - Student with higher passing grade',
    testFn: () => !isStudentPassing(sampleStudentData, 8.0)
  }
];