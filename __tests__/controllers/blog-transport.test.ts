import {
    createBlogtransport,
    getTransportsForBlog,
    deleteBlogTransport,
    __setBlogTransportService,
} from "../../src/controllers/blog-transport";
import { BlogTransportService } from "../../src/services/blog-transport";
import { Request, Response } from "express";
import { UUID } from "crypto";
import { UnprocessableEntityException } from "../../src/exceptions/validation";
import { TransportType } from "../../src/interfaces/transport";

jest.mock("../../src/services/blog-transport");

describe("BlogTransport Controller", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockBlogTransportService: jest.Mocked<BlogTransportService>;

    beforeEach(() => {
        req = { body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockBlogTransportService = {
            createBlogTransport: jest.fn(),
            getTransportsForBlog: jest.fn(),
            deleteBlogTransport: jest.fn(),
        } as unknown as jest.Mocked<BlogTransportService>;

        __setBlogTransportService(mockBlogTransportService);
        jest.clearAllMocks();
    });

    describe("createBlogtransport", () => {
        it("should create blog transport and return 201", async () => {
            const fakeBlogId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID;
            const fakeTransportId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID;

            req.body = { blog_id: fakeBlogId, transport_id: fakeTransportId };

            const result = { blog_id: fakeBlogId, transport_id: fakeTransportId };
            mockBlogTransportService.createBlogTransport.mockResolvedValue(result);

            await createBlogtransport(req as Request, res as Response);

            expect(mockBlogTransportService.createBlogTransport).toHaveBeenCalledWith(
                fakeBlogId,
                fakeTransportId
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(result);
        });

        it("should throw UnprocessableEntityException for invalid body", async () => {
            req.body = { blog_id: "invalid", transport_id: "still-invalid" };

            await expect(createBlogtransport(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );

            expect(mockBlogTransportService.createBlogTransport).not.toHaveBeenCalled();
        });
    });

    describe("getTransportsForBlog", () => {
        it("should return transports for blog", async () => {
            const blogId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID;
            req.params = { id: blogId };

            const transports = [{
                id: "transport1" as UUID,
                type: TransportType.BUS,
                name: "City Bus",
                starting_location: "Station A",
                starting_point: { lat: 23.8, long: 90.4 },
                destination: "Station B",
                destination_point: { lat: 24.8, long: 91.4 },
                departure_time: new Date(),
                arrival_time: new Date(new Date().getTime() + 3600000),
                fare: "150.00",
                created_at: new Date(),
                updated_at: new Date()
            }];

            mockBlogTransportService.getTransportsForBlog.mockResolvedValue(transports);

            await getTransportsForBlog(req as Request, res as Response);

            expect(mockBlogTransportService.getTransportsForBlog).toHaveBeenCalledWith(blogId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(transports);
        });

        it("should throw UnprocessableEntityException for invalid blog id", async () => {
            req.params = { id: "invalid" };

            await expect(getTransportsForBlog(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );

            expect(mockBlogTransportService.getTransportsForBlog).not.toHaveBeenCalled();
        });
    });

    describe("deleteBlogTransport", () => {
        it("should delete transport and return 204", async () => {
            const blogId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as UUID;
            const transportId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as UUID;

            req.params = { blogId, transportId };

            mockBlogTransportService.deleteBlogTransport.mockResolvedValue(1);

            await deleteBlogTransport(req as Request, res as Response);

            expect(mockBlogTransportService.deleteBlogTransport).toHaveBeenCalledWith(blogId, transportId);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.json).toHaveBeenCalledWith(1);
        });

        it("should throw UnprocessableEntityException for invalid blogId", async () => {
            req.params = { blogId: "invalid", transportId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" };

            await expect(deleteBlogTransport(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );

            expect(mockBlogTransportService.deleteBlogTransport).not.toHaveBeenCalled();
        });

        it("should throw UnprocessableEntityException for invalid transportId", async () => {
            req.params = { blogId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", transportId: "invalid" };

            await expect(deleteBlogTransport(req as Request, res as Response)).rejects.toThrow(
                UnprocessableEntityException
            );

            expect(mockBlogTransportService.deleteBlogTransport).not.toHaveBeenCalled();
        });
    });
});
