import { config } from "@/config";
import { EmailData } from "@/db/interfaces/Email/Email.interfaces";
import { Profile } from "@/db/models/Profile/model/Profile";
import { Role } from "@/db/models/Role/model/Role";
import { User } from "@/db/models/User/model/User";
import { AuthType } from "@/db/models/User/types/AuthType";
import { MailNotFound } from "@/errors/emailauth/MailNotFound";
import { PasswordNotVerified } from "@/errors/emailauth/PasswordNotVerified";
import { UnauthorizedUser } from "@/errors/user/UnauthorizedUser";
import { log } from "@/libraries/Log";
import mailer from "@/services/EmailService";
import { EmailTemplate } from "@/utils/EmailTemplate";
import authService from "./AuthService";

export interface EmailParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  name?: string;
  userEmail: string;
  token: string;
}

interface EmailUserParams extends EmailParams {
  name: string;
}

const sendEmailResetPassword = async ({
  name,
  userEmail,
  token,
}: ResetPasswordParams) => {
  const emailData: EmailData = {
    email: userEmail,
    subject: "Recover password",
    page: EmailTemplate.PasswordRecovery,
    locale: null,
    context: {
      email: userEmail,
      name: name || userEmail,
      url: `${config.email.routes.passwordRecovery}?tk=${token}`,
    },
  };

  const info = await mailer.sendEmail(emailData);

  log.debug("Sending email password reset to:", userEmail, info);
  return info;
};

export const emailResetUserPassword = async (email: string) => {
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({
    where: { email: lowerCaseEmail },
    include: [
      { model: Profile, as: "profile" },
      { model: Role, as: "roles" },
    ],
  });

  if (!user || user?.authType !== AuthType.Email) throw new MailNotFound();

  const { token } = authService.createToken({
    email: user.email,
    uid_azure: user.uid_azure,
    role: user.roles,
    type: "reset",
    userId: user.id,
  });
  const { email: userEmail, name } = user;

  return sendEmailResetPassword({ name, userEmail, token });
};

export const emailLoginCredentials = async ({
  email,
  password,
}: EmailParams) => {
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({
    where: { email: lowerCaseEmail },
    include: [
      { model: Profile, as: "profile" },
      { model: Role, as: "roles" },
      // { model: Employee, as: "employee" },
    ],
  });

  if (!user || user?.authType !== AuthType.Email) throw new MailNotFound();

  if (!user.isActive) throw new UnauthorizedUser();

  const authenticated = await user.authenticate(password);

  if (!authenticated) throw new PasswordNotVerified();

  const credentials = authService.getCredentials(user);
  return credentials;
};

export const emailCreateUserPassword = async ({
  email,
  password,
}: EmailParams) => {
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({
    where: { email: lowerCaseEmail },
    include: [
      { model: Profile, as: "profile" },
      { model: Role, as: "roles" },
    ],
  });

  if (!user || user?.authType !== AuthType.Email) throw new MailNotFound();

  user.password = password;
  await user.save();
  const credentials = authService.getCredentials(user);

  return credentials;
};

export const createUserFromEmail = async ({
  email,
  password,
  name,
}: EmailUserParams): Promise<User> => {
  const lowerCaseEmail = email.toLowerCase();
  const [firstName, ...restName] = name.split(" ");
  const lastName = restName.join(" ");

  const newUser: Partial<User> = {
    authType: AuthType.Email,
    email: lowerCaseEmail,
    uid_azure: null,
    firstName,
    isActive: true,
    isEmailConfirmed: true,
    lastName,
    name,
    password,
  };

  const user: User = await User.create(newUser);

  return user;
};
