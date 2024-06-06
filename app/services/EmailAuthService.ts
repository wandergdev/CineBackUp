import { config } from "@/config";
import { EmailData } from "@/db/interfaces/Email/Email.interfaces";
import { Profile } from "@/db/models/Profile/model/Profile";
import { Role } from "@/db/models/Role/model/Role";
import { User } from "@/db/models/User/model/User";
import { AuthType } from "@/db/models/User/types/AuthType";
import { MailNotFound } from "@/errors/emailauth/MailNotFound";
import PasswordNotVerified from "@/errors/emailauth/PasswordNotVerified";
import { UnauthorizedUser } from "@/errors/user/UnauthorizedUser";
import { log } from "@/libraries/Log";
import mailer from "@/services/EmailService";
import { EmailTemplate } from "@/utils/EmailTemplate";
import authService, { AuthCredentials } from "./AuthService";

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

// Función para enviar el correo de confirmación
export const sendEmailConfirmation = async (user: User) => {
  const { token } = authService.createToken({
    email: user.email,
    role: user.roles,
    type: "confirmEmail",
    userId: user.id,
  });
  const emailData: EmailData = {
    email: user.email,
    subject: "Please confirm your email address",
    page: EmailTemplate.EmailConfirm,
    locale: user.profile?.locale,
    context: {
      url: `${config.emailAuth.emailConfirmUrl}?tk=${token}`,
      name: user.name || user.email,
      email: user.email, // Asegúrate de pasar la variable email al contexto
    },
  };
  await mailer.sendEmail(emailData);
};

// Función para enviar el correo de recuperación de contraseña
export const sendEmailResetPassword = async ({
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
      url: `${config.email.routes.passwordRecovery}?tk=${token}`,
      name: name || userEmail,
    },
  };
  const info = await mailer.sendEmail(emailData);
  log.debug("Sending email password reset to:", userEmail, info);
  return info;
};

// Función para restablecer la contraseña del usuario
export const emailResetUserPassword = async (email: string) => {
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({
    where: { email: lowerCaseEmail },
    include: [
      { model: Profile, as: "profile" },
      { model: Role, as: "roles" },
    ],
  });
  if (!user || user.authType !== AuthType.Email) throw new MailNotFound();
  if (!user.isActive) throw new UnauthorizedUser();
  if (!user.isEmailConfirmed) throw new UnauthorizedUser();

  const { token } = authService.createToken({
    email: user.email,
    role: user.roles,
    type: "reset",
    userId: user.id,
  });
  return sendEmailResetPassword({
    name: user.name,
    userEmail: user.email,
    token,
  });
};

// Función para crear un usuario a partir de un correo electrónico
export const createUserFromEmail = async ({
  email,
  password,
  name,
}: EmailUserParams): Promise<User> => {
  const lowerCaseEmail = email.toLowerCase();
  const [firstName, ...restName] = name.split(" ");
  const lastName = restName.join(" ");

  const newUser = {
    authType: AuthType.Email,
    email: lowerCaseEmail,
    uid_azure: null,
    firstName,
    isActive: false,
    isEmailConfirmed: false,
    lastName,
    name: `${firstName} ${lastName}`,
    password,
  };
  const user = await User.create(newUser);

  await sendEmailConfirmation(user); // Enviar correo de confirmación después de la creación del usuario
  return user;
};

// Función para las credenciales de login
export const emailLoginCredentials = async ({
  email,
  password,
}: EmailParams): Promise<AuthCredentials> => {
  const lowerCaseEmail = email.toLowerCase();
  const user = await User.findOne({
    where: { email: lowerCaseEmail },
    include: [
      { model: Profile, as: "profile" },
      { model: Role, as: "roles" },
    ],
  });

  if (!user) {
    throw new MailNotFound();
  }

  const authenticated = await user.authenticate(password);
  if (!authenticated) {
    throw new PasswordNotVerified();
  }

  if (!user.isActive || !user.isEmailConfirmed) {
    throw new UnauthorizedUser();
  }

  return authService.getCredentials(user);
};
