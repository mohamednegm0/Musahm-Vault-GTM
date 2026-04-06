/**
 * Utility functions for JWT token handling
 */

/**
 * Decode JWT token and extract claims
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.codePointAt(0)!.toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Extract tenant ID from token
 * Musahm system uses CompanyId as tenantId
 * @returns Tenant ID or null if not found
 */
export const getTenantIdFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found in localStorage');
    return null;
  }
  
  const decoded = decodeToken(token);
  if (!decoded) {
    console.error('Failed to decode token');
    return null;
  }

  console.log('Token claims:', Object.keys(decoded)); // Debug: show available claims
  
  // Try different possible claim names (CompanyId is used as tenantId in Musahm system)
  const tenantId = decoded?.CompanyId || decoded?.companyId || decoded?.company_id || 
                   decoded?.tenantId || decoded?.tenant_id || decoded?.TenantId || null;
  
  if (!tenantId) {
    console.error('Tenant ID not found in token. Available claims:', decoded);
  }
  
  return tenantId;
};

/**
 * Extract user ID from token
 * Musahm system uses Id claim
 * @returns User ID or null if not found
 */
export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found in localStorage');
    return null;
  }
  
  const decoded = decodeToken(token);
  if (!decoded) {
    console.error('Failed to decode token');
    return null;
  }
  
  // Try different possible claim names (Id is used in Musahm system)
  const userId = decoded?.Id || decoded?.id || decoded?.ID || 
                 decoded?.sub || decoded?.userId || decoded?.user_id || null;
  
  if (!userId) {
    console.error('❌ User ID not found in token', {
      searchedFor: ['Id', 'id', 'ID', 'sub', 'userId', 'user_id'],
      availableClaims: Object.keys(decoded)
    });
  } else {
    console.log('✅ User ID extracted successfully:', userId);
  }
  
  return userId;
};

/**
 * Extract user email from token
 * @returns User email or null if not found
 */
export const getUserEmailFromToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.email || decoded?.Email || decoded?.emailAddress || null;
};

/**
 * Check if token is expired
 * @returns true if token is expired or invalid
 */
export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem('authToken');
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get all token claims for debugging
 * @returns All claims in the token
 */
export const getAllTokenClaims = (): any => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  return decodeToken(token);
};

/**
 * Get complete user info from token
 * @returns Object with tenantId, userId, email
 */
export const getUserInfo = (): { tenantId: string | null; userId: string | null; email: string | null } => {
  return {
    tenantId: getTenantIdFromToken(),
    userId: getUserIdFromToken(),
    email: getUserEmailFromToken()
  };
};

/**
 * Validate token contains required fields
 * @returns Object with validation results
 */
export const validateToken = (): { isValid: boolean; hasTenantId: boolean; hasUserId: boolean; errors: string[] } => {
  const errors: string[] = [];
  const tenantId = getTenantIdFromToken();
  const userId = getUserIdFromToken();

  if (!tenantId) {
    errors.push('❌ Tenant ID (CompanyId) not found in token');
  } else {
    console.log('✅ Tenant ID found:', tenantId);
  }

  if (!userId) {
    errors.push('⚠️ User ID (Id) not found in token');
  } else {
    console.log('✅ User ID found:', userId);
  }

  return {
    isValid: !errors.some(e => e.startsWith('❌')),
    hasTenantId: !!tenantId,
    hasUserId: !!userId,
    errors
  };
};
