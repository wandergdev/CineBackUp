export const getEnumValues = (enumObject: { [x: string]: any }) => {
  const enumKeys = Object.keys(enumObject);
  const enumValues = enumKeys.map(key => enumObject[key]);
  return enumValues;
};

export const cleanText = (text: string) => text.trim().replace(/ {1,}/g, " ");

interface NameProps {
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
}

export const getFullName = ({
  firstName,
  middleName,
  lastName,
  secondLastName,
}: NameProps): string => {
  const fullName = `${firstName ?? ""} ${middleName ?? ""} ${lastName ??
    ""} ${secondLastName ?? ""}`;

  return cleanText(fullName);
};

// Every day at 11:00PM Local Time
export const CRON_11PM = "0 23 * * *";

// Every day at 11:30PM Local Time
export const CRON_1130PM = "30 23 * * *";

// Every day at 12:00AM Local Time
export const CRON_Midnight = "0 */24 * * *";

// Every monday at 11:00AM Local Time
export const CRON_Every_Monday = "0 11 * * 1";

export enum Environment {
  Dev = "dev",
  Qa = "qa",
  Prod = "prod",
}
