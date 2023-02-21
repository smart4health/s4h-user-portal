export class NotLoggedInError extends Error {
  constructor() {
    super();
    this.translationKey = 'LOGIN_USER_NOT_LOGGEDIN';
    this.name = 'NotLoggedInError';
  }
}
