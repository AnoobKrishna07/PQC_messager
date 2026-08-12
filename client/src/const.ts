export const NOT_ADMIN_ERR_MSG =
  "You do not have required permission (10002)";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://realtime-chat-backend-ymee.onrender.com";

export const startLogin = () => {
  window.location.href = `${API_URL}/api/oauth/login`;
};