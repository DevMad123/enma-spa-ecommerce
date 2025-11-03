import axios from "axios";

// Authentification via cookies HttpOnly (Sanctum stateful)
// - Plus d'en-tête Authorization/Bearer ni de token en localStorage
// - Les cookies de session + cookie XSRF (XSRF-TOKEN) assurent l'auth côté API
const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const { response } = error;
      if (response?.status === 405) {
        alert("Method Not Allowed");
      }
      return response;
    } catch (e) {
      console.error(e);
    }
    throw error;
  }
);

export default axiosClient;

