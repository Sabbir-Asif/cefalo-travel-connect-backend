import jwt from "jsonwebtoken";
import { TokenService } from "../../src/services/token";
import { UUID } from "crypto";

jest.mock("jsonwebtoken");

describe("TokenService", () => {
  const mockUserId = "11111111-1111-1111-1111-111111111111" as UUID;
  const fakeToken = "fake.jwt.token";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("signAccessToken", () => {
    it("should call jwt.sign with correct parameters and return token", () => {
      (jwt.sign as jest.Mock).mockReturnValue(fakeToken);

      const token = TokenService.signAccessToken(mockUserId);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserId },
        expect.anything(),
        { algorithm: "RS256", expiresIn: "60m" }
      );
      expect(token).toBe(fakeToken);
    });
  });

  describe("verifyAccessToken", () => {
    it("should call jwt.verify with correct parameters and return decoded payload", () => {
      const decodedPayload = { userId: mockUserId };
      (jwt.verify as jest.Mock).mockReturnValue(decodedPayload);

      const result = TokenService.verifyAccessToken(fakeToken);

      expect(jwt.verify).toHaveBeenCalledWith(
        fakeToken,
        expect.anything(),
        { algorithms: ["RS256"] }
      );
      expect(result).toEqual(decodedPayload);
    });

    it("should throw if jwt.verify throws", () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => TokenService.verifyAccessToken(fakeToken)).toThrow("Invalid token");
    });
  });

  describe("decode", () => {
    it("should call jwt.decode and return decoded token", () => {
      const decoded = { userId: mockUserId };
      (jwt.decode as jest.Mock).mockReturnValue(decoded);

      const result = TokenService.decode(fakeToken);

      expect(jwt.decode).toHaveBeenCalledWith(fakeToken);
      expect(result).toEqual(decoded);
    });
  });
});
