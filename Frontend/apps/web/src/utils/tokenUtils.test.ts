/**
 * Test file for tokenUtils
 * Run these tests in browser console to verify token extraction
 */

import { 
  getTenantIdFromToken, 
  getUserIdFromToken, 
  getUserEmailFromToken,
  isTokenExpired,
  getAllTokenClaims 
} from './tokenUtils';

/**
 * Run all token tests
 */
export const runTokenTests = () => {
  console.group('🧪 Token Utils Tests');
  
  // Test 1: Get all claims
  console.group('Test 1: Get All Claims');
  const claims = getAllTokenClaims();
  if (claims) {
    console.log('✅ Token found and decoded');
    console.log('Available claims:', Object.keys(claims));
    console.log('Full payload:', claims);
  } else {
    console.error('❌ No token found or failed to decode');
  }
  console.groupEnd();

  // Test 2: Extract Tenant ID
  console.group('Test 2: Extract Tenant ID');
  const tenantId = getTenantIdFromToken();
  if (tenantId) {
    console.log('✅ Tenant ID extracted:', tenantId);
  } else {
    console.error('❌ Failed to extract Tenant ID');
    if (claims) {
      console.log('Searched in these claims:', Object.keys(claims));
    }
  }
  console.groupEnd();

  // Test 3: Extract User ID
  console.group('Test 3: Extract User ID');
  const userId = getUserIdFromToken();
  if (userId) {
    console.log('✅ User ID extracted:', userId);
  } else {
    console.error('❌ Failed to extract User ID');
  }
  console.groupEnd();

  // Test 4: Extract Email
  console.group('Test 4: Extract Email');
  const email = getUserEmailFromToken();
  if (email) {
    console.log('✅ Email extracted:', email);
  } else {
    console.log('⚠️ Email not found (optional)');
  }
  console.groupEnd();

  // Test 5: Check Expiration
  console.group('Test 5: Check Token Expiration');
  const expired = isTokenExpired();
  if (expired) {
    console.error('❌ Token is expired');
  } else {
    console.log('✅ Token is valid');
  }
  console.groupEnd();

  // Summary
  console.group('📊 Test Summary');
  const results = {
    'Token Decoded': !!claims,
    'Tenant ID Found': !!tenantId,
    'User ID Found': !!userId,
    'Email Found': !!email,
    'Token Valid': !expired
  };
  
  console.table(results);
  
  const passedTests = Object.values(results).filter(v => v).length;
  const totalTests = Object.keys(results).length;
  console.log(`\n${passedTests}/${totalTests} tests passed`);
  console.groupEnd();

  console.groupEnd();
  
  return results;
};

/**
 * Manual test functions for browser console
 */
export const testFunctions = {
  // Test individual functions
  getTenantId: () => {
    const result = getTenantIdFromToken();
    console.log('Tenant ID:', result);
    return result;
  },
  
  getUserId: () => {
    const result = getUserIdFromToken();
    console.log('User ID:', result);
    return result;
  },
  
  getEmail: () => {
    const result = getUserEmailFromToken();
    console.log('Email:', result);
    return result;
  },
  
  checkExpired: () => {
    const result = isTokenExpired();
    console.log('Is Expired:', result);
    return result;
  },
  
  getAllClaims: () => {
    const result = getAllTokenClaims();
    console.log('All Claims:', result);
    return result;
  },
  
  // Run all tests
  runAll: runTokenTests
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).tokenTests = testFunctions;
  console.log('💡 Token tests available: window.tokenTests');
  console.log('Run: tokenTests.runAll()');
}
