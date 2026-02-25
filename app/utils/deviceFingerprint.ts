/**
 * Device Fingerprinting Utility
 * 
 * Generates a unique fingerprint for the current device/browser.
 */

/**
 * Generate a unique device fingerprint based on browser characteristics
 */
export const generateDeviceFingerprint = async (): Promise<string> => {
  const components: string[] = [];
  
  // User agent
  components.push(navigator.userAgent);
  
  // Language
  components.push(navigator.language);
  
  // Screen resolution
  components.push(`${screen.width}x${screen.height}`);
  components.push(`${screen.colorDepth}`);
  
  // Timezone offset
  components.push(String(new Date().getTimezoneOffset()));
  
  // Hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency) {
    components.push(String(navigator.hardwareConcurrency));
  }
  
  // Device memory (if available)
  if ('deviceMemory' in navigator) {
    components.push(String((navigator as any).deviceMemory));
  }
  
  // Platform
  components.push(navigator.platform);
  
  // Touch support
  components.push(String('ontouchstart' in window));
  
  // Canvas fingerprint (simplified)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Homebit', 2, 2);
      components.push(canvas.toDataURL());
    }
  } catch (e) {
    // Canvas fingerprinting blocked or failed
    components.push('canvas-blocked');
  }
  
  // WebGL vendor and renderer
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push((gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push((gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    // WebGL not available
    components.push('webgl-unavailable');
  }
  
  // Combine all components
  const fingerprint = components.join('|');
  
  // Hash the fingerprint using SubtleCrypto API
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (e) {
    // Fallback to simple hash if SubtleCrypto is not available
    return simpleHash(fingerprint);
  }
};

/**
 * Simple hash function as fallback
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Get or create device ID from localStorage
 */
export const getDeviceId = async (): Promise<string> => {
  const stored = localStorage.getItem('device_id');
  if (stored) {
    return stored;
  }
  
  const deviceId = await generateDeviceFingerprint();
  localStorage.setItem('device_id', deviceId);
  return deviceId;
};

/**
 * Get device name based on user agent
 */
export const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  
  // Mobile devices
  if (/iPhone/.test(ua)) {
    return 'iPhone';
  }
  if (/iPad/.test(ua)) {
    return 'iPad';
  }
  if (/Android/.test(ua)) {
    const match = ua.match(/Android.*;\s([^)]+)\)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return 'Android Device';
  }
  
  // Desktop
  if (/Mac/.test(ua)) {
    return 'Mac';
  }
  if (/Windows/.test(ua)) {
    return 'Windows PC';
  }
  if (/Linux/.test(ua)) {
    return 'Linux PC';
  }
  
  return 'Unknown Device';
};

/**
 * Get user's IP address (requires external service)
 */
export const getUserIpAddress = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (e) {
    // Fallback - will be determined by server
    return '0.0.0.0';
  }
};

/**
 * Get user's geolocation (requires permission)
 */
export const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Permission denied or error
        resolve(null);
      },
      {
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

/**
 * Prepare device registration data
 */
export const prepareDeviceRegistration = async () => {
  const [deviceId, ipAddress, location] = await Promise.all([
    getDeviceId(),
    getUserIpAddress(),
    getUserLocation(),
  ]);
  
  return {
    device_id: deviceId,
    device_name: getDeviceName(),
    user_agent: navigator.userAgent,
    ip_address: ipAddress,
    latitude: location?.latitude,
    longitude: location?.longitude,
  };
};
