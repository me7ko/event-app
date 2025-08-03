export function setAuthCookie(token) {
  document.cookie = `token=${token}; path=/`;
}
