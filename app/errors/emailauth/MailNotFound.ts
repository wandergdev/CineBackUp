export class MailNotFound extends Error {
  constructor() {
    super(`User with this email does not exist on database.`);
  }
}
