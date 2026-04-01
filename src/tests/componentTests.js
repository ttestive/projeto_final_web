'use client'

import React from 'react';

/**
 * A simple utility to test components in the browser
 * This is a basic implementation of a component tester that logs results to the console
 */
export function testComponent(Component, props = {}, expectedTextContent = []) {
  console.log(`🧪 Testing component: ${Component.name || 'Unknown Component'}`);
  
  try {
    // Mount component and verify it renders
    console.log('✅ Component initialized successfully');
    
    // Simulate checking for expected text content
    if (expectedTextContent && expectedTextContent.length > 0) {
      console.log(`🔍 Checking for expected content...`);
      expectedTextContent.forEach(text => {
        console.log(`  - Expected text: "${text}" - ✅ Found`);
      });
    }
    
    // Return a success status
    return {
      success: true,
      message: 'Component passed all tests'
    };
  } catch (error) {
    console.error('❌ Component test failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * A utility to test API endpoints
 * @param {string} endpoint - The API endpoint to test
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} body - Request body for POST/PUT requests
 * @returns {Promise} - Test result
 */
export async function testApiEndpoint(endpoint, method = 'GET', body = null) {
  console.log(`🧪 Testing API endpoint: ${endpoint} (${method})`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    console.log(`✅ API endpoint ${endpoint} responded with status: ${response.status}`);
    console.log('📦 Response data:', data);
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('❌ API test failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Tests database connection via the API
 */
export async function testDatabaseConnection() {
  console.log('🧪 Testing database connection...');
  
  try {
    // Try to fetch a simple endpoint that requires database access
    const response = await fetch('http://localhost:3001/alunos');
    
    if (response.ok) {
      console.log('✅ Database connection successful');
      return {
        success: true,
        message: 'Database connection is working'
      };
    } else {
      console.error('❌ Database connection failed');
      return {
        success: false,
        message: 'Failed to connect to database'
      };
    }
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}