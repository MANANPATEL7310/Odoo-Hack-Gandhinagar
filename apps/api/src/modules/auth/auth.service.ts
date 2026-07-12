import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../../lib/db.js";
import { env } from "../../config/env.js";
import { hashPassword, comparePassword } from "../../lib/hash.js";
import type { SignupInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "@template/shared";

// Custom API Errors
export class AuthError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

// In-memory store for password reset tokens (Hackathon MVP solution)
const resetTokens = new Map<string, { email: string; expires: Date }>();

export class AuthService {
  async signup(payload: SignupInput) {
    // 1. Check if employee already exists
    const existingEmployee = await db.employee.findUnique({
      where: { email: payload.email },
    });

    if (existingEmployee) {
      if (existingEmployee.status === "INACTIVE") {
        throw new AuthError(
          403,
          "Account is inactive. Please contact your administrator.",
          "ACCOUNT_INACTIVE_CONTACT_ADMIN",
        );
      }
      throw new AuthError(
        409,
        "Email address is already in use.",
        "EMAIL_TAKEN",
      );
    }

    // 2. Hash password and save Employee record
    const passwordHash = await hashPassword(payload.password);
    const employee = await db.employee.create({
      data: {
        email: payload.email,
        name: payload.name,
        passwordHash,
        role: "EMPLOYEE", // Forced server-side
        status: "ACTIVE",  // Default to Active
      },
    });

    // 3. Issue JWT Token
    const accessToken = this.generateToken(employee);

    return {
      accessToken,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        departmentId: employee.departmentId,
      },
    };
  }

  async login(payload: LoginInput) {
    // 1. Fetch Employee
    const employee = await db.employee.findUnique({
      where: { email: payload.email },
    });

    if (!employee) {
      throw new AuthError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    // 2. Verify Hash
    const isPasswordMatch = await comparePassword(payload.password, employee.passwordHash);
    if (!isPasswordMatch) {
      throw new AuthError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
    }

    // 3. Check Status
    if (employee.status === "INACTIVE") {
      throw new AuthError(403, "Account is inactive. Please contact admin.", "ACCOUNT_INACTIVE");
    }

    // 4. Issue Token
    const accessToken = this.generateToken(employee);

    return {
      accessToken,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        departmentId: employee.departmentId,
      },
    };
  }

  async forgotPassword(payload: ForgotPasswordInput) {
    const employee = await db.employee.findUnique({
      where: { email: payload.email },
    });

    // Always return 200 generic message even if email doesn't exist to prevent user enumeration
    if (employee && employee.status === "ACTIVE") {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
      
      resetTokens.set(resetToken, { email: payload.email, expires });
      
      // In development, log the reset token for manual testing verification
      console.log(`[DEV ONLY] Password reset token generated for ${payload.email}: ${resetToken}`);
    }

    return {
      message: "If the email is registered, you will receive instructions to reset your password.",
    };
  }

  async resetPassword(payload: ResetPasswordInput) {
    const record = resetTokens.get(payload.token);
    
    if (!record || record.expires.getTime() < Date.now()) {
      throw new AuthError(400, "Reset token is invalid or has expired.", "INVALID_OR_EXPIRED_TOKEN");
    }

    const employee = await db.employee.findUnique({
      where: { email: record.email },
    });

    if (!employee || employee.status !== "ACTIVE") {
      throw new AuthError(400, "Reset token is invalid or has expired.", "INVALID_OR_EXPIRED_TOKEN");
    }

    const newPasswordHash = await hashPassword(payload.newPassword);
    await db.employee.update({
      where: { id: employee.id },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate the consumed token
    resetTokens.delete(payload.token);

    return {
      message: "Password reset completed successfully.",
    };
  }

  async getMe(userId: string) {
    const employee = await db.employee.findUnique({
      where: { id: userId },
    });

    if (!employee || employee.status === "INACTIVE") {
      throw new AuthError(401, "User is unauthenticated or deactivated.", "UNAUTHENTICATED");
    }

    return {
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        departmentId: employee.departmentId,
      },
    };
  }

  private generateToken(employee: { id: string; email: string; name: string; role: string; departmentId: string | null }) {
    return jwt.sign(
      {
        sub: employee.id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        departmentId: employee.departmentId,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as unknown as number,
      },
    );
  }
}

export const authService = new AuthService();
