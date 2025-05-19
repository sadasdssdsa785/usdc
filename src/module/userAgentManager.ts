// Daftar User-Agent yang lebih lengkap dan beragam
const userAgents = [
  // Windows Chrome
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // Windows Firefox
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',

  // Windows Edge
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.65',

  // macOS Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',

  // macOS Chrome
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',

  // macOS Firefox
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11.6; rv:124.0) Gecko/20100101 Firefox/124.0',

  // Linux Chrome
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',

  // Linux Firefox
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',

  // Android Chrome
  'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.86 Mobile Safari/537.36',

  // iOS Safari
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',

  // iPadOS Safari
  'Mozilla/5.0 (iPad; CPU OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',

  // Opera (desktop)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 OPR/108.0.0.0',

  // Brave (identik dengan Chrome)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',

  // Samsung Internet
  'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/110.0.5481.77 Mobile Safari/537.36',
];

  
  // Sistem tracking untuk user agent yang sudah digunakan
  class UserAgentManager {
    private static usedAgents: Set<string> = new Set();
    private static lastUsedAgent: string | null = null;
  
    static getRandomUserAgent(): string {
      // Reset jika semua user agent sudah digunakan
      if (this.usedAgents.size >= userAgents.length) {
        this.usedAgents.clear();
      }
  
      // Filter user agent yang belum digunakan
      const availableAgents = userAgents.filter(agent => !this.usedAgents.has(agent));
      
      // Pilih random dari yang tersedia
      const selectedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      
      // Catat penggunaan
      this.usedAgents.add(selectedAgent);
      this.lastUsedAgent = selectedAgent;
  
      return selectedAgent;
    }
  
    static getCurrentUserAgent(): string {
      return this.lastUsedAgent || this.getRandomUserAgent();
    }
  
    static resetUsageTracking(): void {
      this.usedAgents.clear();
      this.lastUsedAgent = null;
    }
  }
  
  export { UserAgentManager, userAgents };