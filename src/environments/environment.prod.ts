export const environment = {
  production: true,

  // Reverse Proxy use kar rahe hain
  // Frontend: HTTPS pe chalega
  // API calls: /api se jayengi, IIS proxy karke HTTP API pe bhejega
  // 
  // IIS mein URL Rewrite rule lagana padega (web.config mein hai)
  apiUrl: '/api'
};
