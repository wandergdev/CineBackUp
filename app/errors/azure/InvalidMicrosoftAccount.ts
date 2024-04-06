export class InvalidMicrosoftAccount extends Error {
  constructor() {
    super(
      `Employee does not exist and cannot be created. Possible invalid Microsoft Account.`,
    );
  }
}
