import crypto from 'crypto';

interface DeviceProfile {
  platform: string;
  hardwareConcurrency: number;
  vendor: string;
  renderer: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelDepth: number;
  };
  timezone: string;
  locale: string;
  fonts: string[];
  codecs: string[];
  battery: {
    charging: boolean;
    level: number;
    chargingTime: number;
    dischargingTime: number;
  };
  connection: {
    type: string;
    downlink: number;
    rtt: number;
  };
}

export class FingerprintManager {
  private static currentFingerprint: string | null = null;
  private static usedFingerprints: Set<string> = new Set();
  private static readonly MAX_FINGERPRINTS = 1000;

  // Platform profiles untuk randomisasi
  private static readonly PLATFORMS = [
    'Win32', 'Win64', 'MacIntel', 'Linux x86_64', 'Linux armv8l'
  ];

  private static readonly VENDORS = [
    'Google Inc.',
    'Apple Computer, Inc.',
    'Intel Inc.',
    'ARM',
    'NVIDIA Corporation',
    'AMD',
    'Microsoft'
  ];

  private static readonly RENDERERS = [
    'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0)',
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)',
    'ANGLE (AMD, AMD Radeon RX 6800 XT Direct3D11 vs_5_0 ps_5_0)',
    'Metal',
    'Intel Iris OpenGL Engine',
    'NVIDIA GeForce Direct3D11 vs_5_0 ps_5_0'
  ];

  private static readonly FONTS = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
    'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Segoe UI', 'San Francisco'
  ];

  private static readonly CODECS = [
    'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
    'video/webm; codecs="vp8, vorbis"',
    'video/webm; codecs="vp9"',
    'video/webm; codecs="av1"',
    'audio/mp4; codecs="mp4a.40.5"'
  ];

  private static readonly TIMEZONES = [
    'Asia/Jakarta',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Asia/Seoul',
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Australia/Sydney'
  ];

  private static readonly LOCALES = [
    'en-US', 'en-GB', 'id-ID', 'ja-JP', 'ko-KR', 'zh-CN', 'fr-FR', 'de-DE'
  ];

  private static readonly CONNECTION_TYPES = [
    '4g', '5g', 'wifi', 'ethernet'
  ];

  /**
   * Generate random hardware profile
   */
  private static generateDeviceProfile(): DeviceProfile {
    const screenSizes = [
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
      { width: 3840, height: 2160 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 }
    ];
    
    const screen = screenSizes[Math.floor(Math.random() * screenSizes.length)];
    
    return {
      platform: this.PLATFORMS[Math.floor(Math.random() * this.PLATFORMS.length)],
      hardwareConcurrency: [4, 6, 8, 12, 16][Math.floor(Math.random() * 5)],
      vendor: this.VENDORS[Math.floor(Math.random() * this.VENDORS.length)],
      renderer: this.RENDERERS[Math.floor(Math.random() * this.RENDERERS.length)],
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: 24,
        pixelDepth: 24
      },
      timezone: this.TIMEZONES[Math.floor(Math.random() * this.TIMEZONES.length)],
      locale: this.LOCALES[Math.floor(Math.random() * this.LOCALES.length)],
      fonts: this.getRandomSubset(this.FONTS, 5 + Math.floor(Math.random() * 5)),
      codecs: this.getRandomSubset(this.CODECS, 2 + Math.floor(Math.random() * 3)),
      battery: {
        charging: Math.random() > 0.5,
        level: Math.random(),
        chargingTime: Math.floor(Math.random() * 3600),
        dischargingTime: Math.floor(Math.random() * 7200)
      },
      connection: {
        type: this.CONNECTION_TYPES[Math.floor(Math.random() * this.CONNECTION_TYPES.length)],
        downlink: Math.floor(Math.random() * 100) + 10,
        rtt: Math.floor(Math.random() * 100) + 10
      }
    };
  }

  /**
   * Get random subset dari array
   */
  private static getRandomSubset<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Generate fingerprint unik berbasis random dan waktu
   */
  static generateFingerprint(): string {
    // Reset tracking jika terlalu banyak fingerprint
    if (this.usedFingerprints.size >= this.MAX_FINGERPRINTS) {
      this.usedFingerprints.clear();
    }

    // Generate fingerprint baru sampai dapat yang unik
    let fingerprint: string;
    do {
      const profile = this.generateDeviceProfile();
      const entropy = [
        Date.now(),
        Math.random(),
        profile.platform,
        profile.hardwareConcurrency,
        profile.vendor,
        profile.renderer,
        `${profile.screen.width}x${profile.screen.height}`,
        profile.timezone,
        profile.locale,
        profile.fonts.join(','),
        profile.codecs.join(','),
        `${profile.battery.charging}-${profile.battery.level}`,
        `${profile.connection.type}-${profile.connection.downlink}`,
        crypto.randomBytes(16).toString('hex')
      ].join('|');

      fingerprint = crypto.createHash('sha256').update(entropy).digest('hex');
    } while (this.usedFingerprints.has(fingerprint));

    // Track fingerprint
    this.usedFingerprints.add(fingerprint);
    this.currentFingerprint = fingerprint;

    return fingerprint;
  }

  /**
   * Ambil fingerprint aktif
   */
  static getCurrentFingerprint(): string | null {
    return this.currentFingerprint;
  }

  /**
   * Generate device fingerprint untuk puppeteer context
   */
  static generateDeviceFingerprint(): string {
    const profile = this.generateDeviceProfile();
    return JSON.stringify(profile);
  }

  /**
   * Inject fingerprint ke dalam page context
   */
  static async injectFingerprint(page: any): Promise<void> {
    const profile = this.generateDeviceProfile();
    
    await page.evaluateOnNewDocument((profile: DeviceProfile) => {
      // Override navigator properties
      Object.defineProperty(navigator, 'platform', { get: () => profile.platform });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => profile.hardwareConcurrency });
      
      // Override WebGL
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, contextType: '2d' | 'webgl' | 'webgl2' | 'bitmaprenderer', options?: any): RenderingContext | null {
        const context = getContext.apply(this, [contextType, options]);
        if (context && (contextType === 'webgl' || contextType === 'webgl2')) {
          const webglContext = context as WebGLRenderingContext;
          const getParameter = webglContext.getParameter.bind(webglContext);
          webglContext.getParameter = function(parameter: number): any {
            // Spoof WebGL parameters
            const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
              if (parameter === debugInfo.UNMASKED_VENDOR_WEBGL) return profile.vendor;
              if (parameter === debugInfo.UNMASKED_RENDERER_WEBGL) return profile.renderer;
            }
            return getParameter(parameter);
          };
          return webglContext;
        }
        return context;
      } as typeof HTMLCanvasElement.prototype.getContext;

      // Override screen properties
      Object.defineProperty(window.screen, 'width', { get: () => profile.screen.width });
      Object.defineProperty(window.screen, 'height', { get: () => profile.screen.height });
      Object.defineProperty(window.screen, 'colorDepth', { get: () => profile.screen.colorDepth });
      Object.defineProperty(window.screen, 'pixelDepth', { get: () => profile.screen.pixelDepth });

      // Override timezone & locale
      const dateTimeFormat = Intl.DateTimeFormat();
      Object.defineProperty(dateTimeFormat, 'resolvedOptions', {
        get: () => () => ({
          timeZone: profile.timezone,
          locale: profile.locale
        })
      });

      // Mock battery API
      (navigator as any).getBattery = () => Promise.resolve({
        charging: profile.battery.charging,
        level: profile.battery.level,
        chargingTime: profile.battery.chargingTime,
        dischargingTime: profile.battery.dischargingTime,
        addEventListener: () => {}
      });

      // Mock connection API
      Object.defineProperty(navigator, 'connection', {
        get: () => ({
          type: profile.connection.type,
          downlink: profile.connection.downlink,
          rtt: profile.connection.rtt,
          saveData: false,
          addEventListener: () => {}
        })
      });

      // Mock supported codecs
      const originalCanPlayType = HTMLMediaElement.prototype.canPlayType;
      HTMLMediaElement.prototype.canPlayType = function(codec: string) {
        if (profile.codecs.includes(codec)) return 'probably';
        return originalCanPlayType.call(this, codec);
      };

      // Font fingerprinting
      Object.defineProperty(document, 'fonts', {
        get: () => ({
          check: () => Promise.resolve(true),
          ready: Promise.resolve(),
          forEach: (callback: (font: any) => void) => {
            profile.fonts.forEach(font => {
              callback({
                family: font,
                style: 'normal',
                weight: '400',
                stretch: 'normal'
              });
            });
          }
        })
      });
    }, profile);
  }

  /**
   * Reset tracking fingerprint
   */
  static resetTracking(): void {
    this.usedFingerprints.clear();
    this.currentFingerprint = null;
  }
}

/**
 * Generate fingerprint device/browser berbasis properti navigator, WebGL, screen, timezone, locale
 * Hanya bisa dipanggil di context browser (puppeteer evaluate)
 */
export function generateDeviceFingerprint(): string {
  try {
    const nav = window.navigator;
    const screenData = window.screen;
    let webglVendor = '';
    let webglRenderer = '';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch {}
    const fingerprintRaw = [
      nav.userAgent,
      nav.platform,
      nav.hardwareConcurrency,
      webglVendor,
      webglRenderer,
      screenData.width + 'x' + screenData.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      Intl.DateTimeFormat().resolvedOptions().locale || (nav.languages ? nav.languages.join(',') : '')
    ].join('|');
    // Hashing for privacy
    return (window as any).crypto?.subtle ? '' : fingerprintRaw; // fallback: return raw if no subtle crypto
  } catch (e) {
    return '';
  }
}
