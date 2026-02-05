export const environment = {
  production: true,
  apiUrl: 'https://imc-st.com/elecciones/v2/backend/api',
  //socketUrl: 'https://imc-st.com:3000',
  // Configuración de servicios externos
  twilio: {
    enabled: false,
    accountSid: '',
    authToken: '',
    from: ''
  },
  whatsapp: {
    enabled: false,
    phoneNumberId: '',
    accessToken: ''
  },
  // Opciones de la aplicación
  appName: 'Sistema Electoral Colombia',
  defaultLanguage: 'es',
  itemsPerPage: 10,
  maxFileSize: 5242880, // 5MB en bytes
};
