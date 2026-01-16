export const environment = {
  production: false,
  apiUrl: (process.env as any).NG_APP_API_URL || 'http://localhost:8000'
};