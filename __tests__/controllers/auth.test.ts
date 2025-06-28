import { signup, login, refreshAccessToken, logout, __setAuthService, __setRefreshTokenService } from "../../src/controllers/auth";
  import { AuthService } from "../../src/services/auth";
  import { RefreshTokenService } from "../../src/services/refresh-token";
  import { Request, Response } from "express";
  import { UUID } from "crypto";
  import { ErrorCode } from "../../src/exceptions/root";
  import { BadRequestException } from "../../src/exceptions/bad-request";
  import { CreateUserDto } from "../../src/dtos/user";
  import { Role, UserResponse } from "../../src/interfaces/user";
  
  jest.mock("../../src/services/token", () => ({
    TokenService: {
      signAccessToken: jest.fn(() => "mocked-access-token"),
    },
  }));
  
  const mockUser: UserResponse = {
    id: "user-id" as UUID,
    name: "Test User",
    email: "test@example.com",
    phone_number: "01800000000",
    role: Role.TRAVELER,
    displayPicture: null,
    bio: null,
    is_verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const mockRefreshToken = {
    id: "token-id" as UUID,
    user_id: "user-id" as UUID,
    token: "refresh-token-id" as UUID,
    expires_at: new Date(Date.now() + 7 * 86400000),
    revoked: false,
    created_at: new Date(),
  };
  
  describe("AuthController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next = jest.fn();
  
    const authService = {
      signup: jest.fn(),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
  
    const refreshTokenService = {
      issue: jest.fn(),
      verifyAndRotate: jest.fn(),
      revoke: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenService>;
  
    beforeAll(() => {
      __setAuthService(authService);
      __setRefreshTokenService(refreshTokenService);
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
  
      req = {
        body: {},
        cookies: {},
      };
  
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
  
    describe("signup", () => {
      it("should return 201 and user on success", async () => {
        req.body = {
          name: "Test User",
          email: "test@example.com",
          phone_number: "01800000000",
          password: "secret123",
        };
  
        authService.signup.mockResolvedValueOnce(mockUser);
  
        await signup(req as Request, res as Response);
  
        expect(authService.signup).toHaveBeenCalledWith(new CreateUserDto(req.body));
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockUser);
      });
    });
  
    describe("login", () => {
      it("should return token and set refresh token cookie", async () => {
        req.body = {
          email: "test@example.com",
          password: "secret123",
        };
  
        authService.login.mockResolvedValueOnce({ user: mockUser, token: "access-token" });
        refreshTokenService.issue.mockResolvedValueOnce(mockRefreshToken);
  
        await login(req as Request, res as Response);
  
        expect(authService.login).toHaveBeenCalledWith("test@example.com", "secret123");
        expect(refreshTokenService.issue).toHaveBeenCalledWith("user-id");
        expect(res.cookie).toHaveBeenCalledWith(
          "refreshToken",
          "refresh-token-id",
          expect.objectContaining({
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          })
        );
        expect(res.json).toHaveBeenCalledWith({
          accessToken: "access-token",
          user: mockUser,
        });
      });
    });
  
    describe("refreshAccessToken", () => {
      it("should refresh token and return new access token", async () => {
        req.cookies = {
          refreshToken: "existing-refresh-token",
        };
  
        refreshTokenService.verifyAndRotate.mockResolvedValueOnce(mockRefreshToken);
  
        await refreshAccessToken(req as Request, res as Response, next);
  
        expect(refreshTokenService.verifyAndRotate).toHaveBeenCalledWith("existing-refresh-token");
        expect(res.cookie).toHaveBeenCalledWith(
          "refreshToken",
          "refresh-token-id",
          expect.objectContaining({
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ accessToken: "mocked-access-token" });
      });
  
      it("should throw error if no refresh token", async () => {
        req.cookies = {};
  
        await expect(refreshAccessToken(req as Request, res as Response, next)).rejects.toThrow(
          new BadRequestException("Refresh token is required", ErrorCode.REFRESH_TOKEN_NOT_FOUND)
        );
      });
    });
  
    describe("logout", () => {
      it("should revoke token and clear cookie", async () => {
        req.cookies = {
          refreshToken: "existing-refresh-token",
        };
  
        await logout(req as Request, res as Response, next);
  
        expect(refreshTokenService.revoke).toHaveBeenCalledWith("existing-refresh-token");
        expect(res.cookie).toHaveBeenCalledWith(
          "refreshToken",
          "",
          expect.objectContaining({
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            expires: expect.any(Date),
          })
        );
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.send).toHaveBeenCalled();
      });
  
      it("should throw error if no refresh token", async () => {
        req.cookies = {};
  
        await expect(logout(req as Request, res as Response, next)).rejects.toThrow(
          new BadRequestException("Refresh token is required", ErrorCode.REFRESH_TOKEN_NOT_FOUND)
        );
      });
    });
  });
  