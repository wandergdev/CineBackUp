export class UnauthorizedUser extends Error {
  constructor() {
    super(`Inactive User cannot access to the portal.`);
  }
}
