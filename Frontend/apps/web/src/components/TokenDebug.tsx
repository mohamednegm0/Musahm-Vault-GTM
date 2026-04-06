import React, { useEffect, useState } from 'react';
import { getAllTokenClaims, getTenantIdFromToken, getUserIdFromToken, getUserEmailFromToken, isTokenExpired } from '../utils/tokenUtils';

/**
 * Debug component to display token information
 * Useful for troubleshooting authentication issues
 */
const TokenDebug: React.FC = () => {
  const [tokenClaims, setTokenClaims] = useState<any>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [expired, setExpired] = useState<boolean>(false);

  useEffect(() => {
    const claims = getAllTokenClaims();
    setTokenClaims(claims);
    setTenantId(getTenantIdFromToken());
    setUserId(getUserIdFromToken());
    setUserEmail(getUserEmailFromToken());
    setExpired(isTokenExpired());
  }, []);

  if (!tokenClaims) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3 style={{ color: '#dc2626' }}>No Token Found</h3>
        <p>Please log in to see token information.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontFamily: 'monospace' }}>
      <h2 style={{ marginBottom: '16px' }}>Token Debug Information</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: expired ? '#dc2626' : '#059669' }}>
          Status: {expired ? '🔴 Expired' : '🟢 Active'}
        </h3>
      </div>

      <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3>Extracted Values:</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Tenant ID:</td>
              <td style={{ padding: '8px', color: tenantId ? '#059669' : '#dc2626' }}>
                {tenantId || '❌ Not Found'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>User ID:</td>
              <td style={{ padding: '8px', color: userId ? '#059669' : '#dc2626' }}>
                {userId || '❌ Not Found'}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', fontWeight: 'bold' }}>Email:</td>
              <td style={{ padding: '8px' }}>
                {userEmail || 'Not Found'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>All Token Claims:</h3>
        <pre style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '6px',
          overflow: 'auto',
          maxHeight: '400px',
          fontSize: '12px'
        }}>
          {JSON.stringify(tokenClaims, null, 2)}
        </pre>
      </div>

      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        <p><strong>Note:</strong> This component should only be used in development.</p>
        <p>Available claim keys: {Object.keys(tokenClaims).join(', ')}</p>
      </div>
    </div>
  );
};

export default TokenDebug;
