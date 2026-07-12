import jwt from "jsonwebtoken";
import { Role, EmployeeStatus } from "@prisma/client";
import { db } from "../../lib/db.js";
import { env } from "../../config/env.js";
import { hashPassword, verifyPassword } from "../../lib/crypto.js";
import { ConflictError, UnauthorizedError } from "../../lib/errors.js";
import type { LoginInput, SignupInput } from "./auth.schema.js";

function generateToken(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
}) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as unknown as number,
    },
  );
}

export async function loginService(payload: LoginInput) {
  const employee = await db.employee.findUnique({
    where: { email: payload.email },
  });

  if (!employee || employee.status === EmployeeStatus.INACTIVE) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const isPasswordCorrect = verifyPassword(
    payload.password,
    employee.passwordHash,
  );
  if (!isPasswordCorrect) {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const user = {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
  };

  const accessToken = generateToken(user);

  return {
    accessToken,
    user,
  };
}

export async function signupService(payload: SignupInput) {
  const existingEmployee = await db.employee.findUnique({
    where: { email: payload.email },
  });

  if (existingEmployee) {
    throw new ConflictError("Email is already registered.");
  }

  const passwordHash = hashPassword(payload.password);

  const employee = await db.employee.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: Role.EMPLOYEE, // Enforced server-side: registration always yields EMPLOYEE role
      status: EmployeeStatus.ACTIVE, // Enforced server-side: registration always yields ACTIVE status
    },
  });

  const user = {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
  };

  const accessToken = generateToken(user);

  return {
    accessToken,
    user,
  };
}
