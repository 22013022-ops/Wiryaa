export function saveSession({ token, user }) { localStorage.setItem('wiryaa-token', token); localStorage.setItem('wiryaa-user', JSON.stringify(user)) }
export function getSessionUser() { try { return JSON.parse(localStorage.getItem('wiryaa-user')) } catch { return null } }
