import {
    createWishlist,
    getAllWishlists,
    getWishlistById,
    updateWishlist,
    deleteWishlist,
    searchWishlists,
    getWishlistsByUserId,
    getMatchingUsers,
    __setWishlistService,
} from "../../src/controllers/wishlist";
import { WishlistService } from "../../src/services/wishlist";
import { Request, Response } from "express";
import { WishlistStatus } from "../../src/interfaces/wishlist";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { BadRequestException } from "../../src/exceptions/bad-request";
import { UnauthorizedException } from "../../src/exceptions/unauthorized";
import { Role } from "../../src/interfaces/user";
import { UUID } from "crypto";

describe("WishlistController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockService: jest.Mocked<WishlistService>;

    const userId = "123e4567-e89b-12d3-a456-426614174000" as UUID;
    const wishlistId = "223e4567-e89b-12d3-a456-426614174001" as UUID;

    const mockWishlist = {
        id: wishlistId,
        user_id: userId,
        title: "Beach Trip",
        location_name: "Cox's Bazar",
        location_point: { lat: 21.4272, long: 92.0058 },
        travel_date: new Date(),
        tags: ["beach", "fun"],
        note: "Bring sunscreen",
        blog_id: null,
        travel_place_id: null,
        cover_image: "img.jpg",
        status: WishlistStatus.PUBLIC,
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: {
                id: userId,
                name: "Test User",
                email: "test@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "01700000000",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockService = {
            createWishlist: jest.fn(),
            getAllWishlists: jest.fn(),
            getWishlistById: jest.fn(),
            updateWishlist: jest.fn(),
            deleteWishlist: jest.fn(),
            searchWishlists: jest.fn(),
            getWishlistsByUserId: jest.fn(),
            findMatchingUsers: jest.fn(),
        } as unknown as jest.Mocked<WishlistService>;

        __setWishlistService(mockService);
        jest.clearAllMocks();
    });

    describe("createWishlist", () => {
        it("should create wishlist", async () => {
            req.body = {
                title: "Beach Trip",
                location_name: "Cox's Bazar",
                location_point: { lat: 21.4272, long: 92.0058 },
                travel_date: new Date(),
            };

            mockService.createWishlist.mockResolvedValue(mockWishlist);

            await createWishlist(req as Request, res as Response);

            expect(mockService.createWishlist).toHaveBeenCalledWith(userId, expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockWishlist);
        });

        it("should throw for invalid input", async () => {
            req.body = { invalid: "data" };
            await expect(createWishlist(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw for invalid user", async () => {
            req.user = { id: "invalid-id" } as any;
            req.body = {
                title: "Beach Trip",
                location_name: "Cox's Bazar",
                location_point: { lat: 21.4272, long: 92.0058 },
                travel_date: new Date(),
            };

            await expect(createWishlist(req as Request, res as Response)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe("getAllWishlists", () => {
        it("should return all wishlists", async () => {
            mockService.getAllWishlists.mockResolvedValue([mockWishlist]);

            await getAllWishlists(req as Request, res as Response);

            expect(mockService.getAllWishlists).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([mockWishlist]);
        });
    });

    describe("getWishlistById", () => {
        it("should return wishlist by id", async () => {
            req.params = { id: wishlistId };
            mockService.getWishlistById.mockResolvedValue(mockWishlist);

            await getWishlistById(req as Request, res as Response);

            expect(mockService.getWishlistById).toHaveBeenCalledWith(wishlistId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockWishlist);
        });

        it("should throw for invalid id", async () => {
            req.params = { id: "invalid-uuid" };
            await expect(getWishlistById(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("updateWishlist", () => {
        it("should update wishlist", async () => {
            req.params = { id: wishlistId };
            req.body = { title: "New Title" };
            mockService.updateWishlist.mockResolvedValue(mockWishlist);

            await updateWishlist(req as Request, res as Response);

            expect(mockService.updateWishlist).toHaveBeenCalledWith(wishlistId, userId, expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockWishlist);
        });

        it("should throw for invalid id", async () => {
            req.params = { id: "invalid-id" };
            req.body = { title: "Updated" };
            await expect(updateWishlist(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });

        it("should throw for invalid body", async () => {
            req.params = { id: wishlistId };
            req.body = { status: "INVALID" };
            await expect(updateWishlist(req as Request, res as Response)).rejects.toThrow(UnprocessableEntityException);
        });

        it("should throw for invalid user", async () => {
            req.params = { id: wishlistId };
            req.body = { title: "Test" };
            req.user = { id: "invalid" } as any;
            await expect(updateWishlist(req as Request, res as Response)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe("deleteWishlist", () => {
        it("should delete wishlist", async () => {
            req.params = { id: wishlistId };
            mockService.deleteWishlist.mockResolvedValue();

            await deleteWishlist(req as Request, res as Response);

            expect(mockService.deleteWishlist).toHaveBeenCalledWith(wishlistId, userId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith({ success: true });
        });

        it("should throw for invalid id", async () => {
            req.params = { id: "invalid-id" };
            await expect(deleteWishlist(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });

        it("should throw for invalid user", async () => {
            req.params = { id: wishlistId };
            req.user = { id: "invalid" } as any;
            await expect(deleteWishlist(req as Request, res as Response)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe("searchWishlists", () => {
        it("should search wishlists", async () => {
            req.query = { title: "Beach" };
            mockService.searchWishlists.mockResolvedValue([mockWishlist]);

            await searchWishlists(req as Request, res as Response);

            expect(mockService.searchWishlists).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([mockWishlist]);
        });
    });

    describe("getWishlistsByUserId", () => {
        it("should return user wishlists", async () => {
            req.params = { id: userId };
            mockService.getWishlistsByUserId.mockResolvedValue([mockWishlist]);

            await getWishlistsByUserId(req as Request, res as Response);

            expect(mockService.getWishlistsByUserId).toHaveBeenCalledWith(userId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([mockWishlist]);
        });

        it("should throw for invalid user id", async () => {
            req.params = { id: "invalid-id" };
            await expect(getWishlistsByUserId(req as Request, res as Response)).rejects.toThrow(BadRequestException);
        });
    });

    describe("getMatchingUsers", () => {
        it("should return matching users", async () => {
            req.query = {
                userId,
                wishlistId,
                radius: "10",
                timeDiff: "15d",
                limit: "10",
                offset: "0",
            };

            mockService.findMatchingUsers.mockResolvedValue([{
                id: "matched-user-id" as UUID,
                name: "Test User",
                email: "test@example.com",
                role: Role.TRAVELER,
                displayPicture: null,
                bio: null,
                phone_number: "01700000000",
                is_verified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }]);

            await getMatchingUsers(req as Request, res as Response);

            expect(mockService.findMatchingUsers).toHaveBeenCalledWith(userId, {
                radius: 10,
                timeDiff: "15d",
                wishlistId,
                limit: 10,
                offset: 0,
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([
                expect.objectContaining({ id: "matched-user-id" }),
            ]);
        });
    });
});
