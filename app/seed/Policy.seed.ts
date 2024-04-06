import { Policy } from "@/db/models/Policy/model/Policy";

export const createDefaultPolicies = async () => {
  /*
    About Permissions:
      - For default CRUD permissions, the first part of the permission name
      should match with the Controller "name" (the base url for the controller).
      - Also, for the permissions to work, the Controller default CRUD endpoints
      should have the AuthMiddleware.
      - For custom endpoints, you have to define custom permissions and use the hasCustomPermission middleware.
      (CRUD permissions have the format: <controller name>.<property|*>.<c|r|u|d|*>)
      (Custom permissions don't have any "." in their name)
  */

  const adminPolicy = await Policy.create({
    name: "Admin",
    description: "Has access to everything",
    isSystemManaged: true,
    permission: {
      "departments.*.*": true,
      "file.*.*": true,
      "profile.*.*": true,
      "region.*.*": true,
      "role.*.*": true,
      "self-users": true,
      "user.*.r": true,
      "group_members.*.*": true,
      "group.*.*": true,
      "audience.*.*": true,
      "annouccement.*.*": true,
      "icons.*.*": true,
    },
  });

  const employeePolicy = await Policy.create({
    name: "Employee Policy",
    description: "Has access to employee features",
    permission: {
      "departments.*.r": true,
      "file.*.r": true,
      "profile.*.r": true,
      "region.*.r": true,
      "self-users": true,
      "user.*.r": true,
    },
  });

  return {
    adminPolicy,
    employeePolicy,
  };
};
