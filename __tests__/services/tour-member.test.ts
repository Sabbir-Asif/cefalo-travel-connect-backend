import { TourMemberService } from "../../src/services/tour-member";
import { NotFoundException } from "../../src/exceptions/not-found";
import { ErrorCode } from "../../src/exceptions/root";
import { UUID } from "crypto";
import { User } from "../../src/interfaces/user";
import { Role } from "../../src/interfaces/user";
import { UserResponseDto } from "../../src/dtos/user";

const travelplanId = "travelplan-uuid" as UUID;
const userId = "user-uuid" as UUID;

const mockTravelPlan = { id: travelplanId, name: "Bandarban Trip" };
const mockUser: User = {
    id: userId,
    name: "Alice",
    email: "alice@example.com",
    password: "hashedPassword",
    role: Role.TRAVELER,
    displayPicture: null,
    bio: "I love mountains.",
    phone_number: "01812345678",
    is_verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("TourMemberService", () => {
    const tourMemberRepository = {
        create: jest.fn(),
        delete: jest.fn(),
        membersForTravelPlan: jest.fn()
    };

    const travelPlanRepository = {
        getById: jest.fn()
    };

    const userRepository = {
        findById: jest.fn()
    };

    let service: TourMemberService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new TourMemberService(
            tourMemberRepository as any,
            travelPlanRepository as any,
            userRepository as any
        );
    });

    describe("createTourMember", () => {
        it("should create a member for a valid travel plan and user", async () => {
            travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
            userRepository.findById.mockResolvedValue(mockUser);
            tourMemberRepository.create.mockResolvedValue({ travelplan_id: travelplanId, user_id: userId });

            const result = await service.createTourMember(travelplanId, userId);

            expect(result).toEqual({ travelplan_id: travelplanId, user_id: userId });
        });

        it("should throw if travel plan does not exist", async () => {
            travelPlanRepository.getById.mockResolvedValue(null);

            await expect(service.createTourMember(travelplanId, userId)).rejects.toThrow(
                new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND)
            );
        });

        it("should throw if user does not exist", async () => {
            travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
            userRepository.findById.mockResolvedValue(null);

            await expect(service.createTourMember(travelplanId, userId)).rejects.toThrow(
                new NotFoundException("User not found", ErrorCode.USER_NOTFOUND)
            );
        });
    });

    describe("deleteTourMember", () => {
        it("should delete a member from a travel plan", async () => {
            travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
            userRepository.findById.mockResolvedValue(mockUser);
            tourMemberRepository.delete.mockResolvedValue(1);

            const result = await service.deleteTourMember(travelplanId, userId);

            expect(result).toBe(1);
        });

        it("should throw if travel plan does not exist", async () => {
            travelPlanRepository.getById.mockResolvedValue(null);

            await expect(service.deleteTourMember(travelplanId, userId)).rejects.toThrow(
                new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND)
            );
        });

        it("should throw if user does not exist", async () => {
            travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
            userRepository.findById.mockResolvedValue(null);

            await expect(service.deleteTourMember(travelplanId, userId)).rejects.toThrow(
                new NotFoundException("User not found", ErrorCode.USER_NOTFOUND)
            );
        });

        it("should throw if member not found in travel plan", async () => {
            travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
            userRepository.findById.mockResolvedValue(mockUser);
            tourMemberRepository.delete.mockResolvedValue(0);

            await expect(service.deleteTourMember(travelplanId, userId)).rejects.toThrow(
                new NotFoundException("Member not found in travel plan", ErrorCode.USER_NOTFOUND)
            );
        });
    });

    describe("getMembersForTravelPlan", () => {
        it("should return a list of UserResponseDto for valid travel plan", async () => {
            travelPlanRepository.getById.mockResolvedValue(mockTravelPlan);
            tourMemberRepository.membersForTravelPlan.mockResolvedValue([mockUser]);

            const result = await service.getMembersForTravelPlan(travelplanId);

            expect(Array.isArray(result)).toBe(true);
            expect(result[0]).toBeInstanceOf(UserResponseDto);
            expect(result[0].id).toBe(userId);
        });

        it("should throw if travel plan does not exist", async () => {
            travelPlanRepository.getById.mockResolvedValue(null);

            await expect(service.getMembersForTravelPlan(travelplanId)).rejects.toThrow(
                new NotFoundException("Travel plan not found", ErrorCode.TRAVEL_PLAN_NOT_FOUND)
            );
        });
    });
});
