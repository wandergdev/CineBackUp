export class PasswordNotVerified extends Error {
  constructor() {
    super(`Password is incorrect or could not be verified.`);
  }
}
