export class RoleNotFound extends Error {
  constructor() {
    super(`Role with the provided id does not exist on database.`);
  }
}
