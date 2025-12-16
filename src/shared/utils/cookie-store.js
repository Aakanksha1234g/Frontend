import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export function getCookie(name) {
  const value = Cookies.get(name);
  if (value) {
    const decoded = jwtDecode(value);
    return decoded;
  }
  return null;
}

export function setCookie(name, value) {
  Cookies.set(name, value);
}

export function removeCookie(name) {
  Cookies.remove(name);
}

export function getDecodedCookie(value) {
  if (value) {
    const decoded = jwtDecode(value);
    return decoded;
  }
  return null;
}

export function isAuthenticated() {
  return Cookies.get('auth_token') !== undefined;
}

export function logout() {
  // Remove all cookies set by js-cookie (you may want to specify which ones if you know them)
  Object.keys(Cookies.get()).forEach(function (cookieName) {
    Cookies.remove(cookieName);
  });

  // Clear localStorage
  localStorage.clear();

  // Clear sessionStorage
  sessionStorage.clear();
}
