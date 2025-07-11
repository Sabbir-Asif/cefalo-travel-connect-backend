import { Request, Response } from "express";
import { WishlistRepository } from "../infrastructure/wishlist-impl";
import { WishlistService } from "../services/wishlist";
import { CreateWishlistSchema, UpdateWishlistSchema } from "../schemas/wishlist";
import { IdSchema } from "../schemas/id";
import { UnprocessableEntityException } from "../exceptions/validation";
import { BadRequestException } from "../exceptions/bad-request";
import { UnauthorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import { UUID } from "crypto";
import { CreateWishlistDto, UpdateWishlistDto } from "../dtos/wishlist";
import { CreateWishlist, UpdateWishlist } from "../interfaces/wishlist";

const wishlistRepository = new WishlistRepository();
let wishlistService = new WishlistService(wishlistRepository);

export const __setWishlistService = (svc: WishlistService) => {
  wishlistService = svc;
};

export const createWishlist = async (req: Request, res: Response) => {
  const parsed = CreateWishlistSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const rawUserId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(rawUserId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
  }

  const userId = parsedUserId.data as UUID;

  const wishlistDto = new CreateWishlistDto(parsed.data as CreateWishlist);

  const wishlist = await wishlistService.createWishlist(userId, wishlistDto);

  res.status(201).json(wishlist);
};

export const getAllWishlists = async (req: Request, res: Response) => {
  const wishlists = await wishlistService.getAllWishlists();

  res.status(200).json(wishlists);
};

export const getWishlistById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid wishlist id", ErrorCode.INVALID_WISHLIST_ID);
  }

  const wishlistId = parsedId.data as UUID

  const wishlist = await wishlistService.getWishlistById(wishlistId);

  res.status(200).json(wishlist);
};

export const updateWishlist = async (req: Request, res: Response) => {
  const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid wishlist id", ErrorCode.INVALID_WISHLIST_ID);
  }

  const wishlistId = parsedId.data as UUID;

  const parsed = UpdateWishlistSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new UnprocessableEntityException(parsed.error, "Validation error!", ErrorCode.UNPROCESSABLE_ENTITY);
  }

  const rawUserId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(rawUserId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
  }

  const userId = parsedUserId.data as UUID;

  const data = { ...parsed.data };
  if (data.blog_id) {
    data.blog_id = data.blog_id as UUID;
  }
  const wishlistUpdateDto = new UpdateWishlistDto(data as UpdateWishlist);

  const updatedWishlist = await wishlistService.updateWishlist(wishlistId, userId, wishlistUpdateDto);

  res.status(200).json(updatedWishlist);
};

export const deleteWishlist = async (req: Request, res: Response) => {
  const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid wishlist id", ErrorCode.INVALID_WISHLIST_ID);
  }

  const wishlistId = parsedId.data as UUID;

  const rawUserId = req.user?.id;
  const parsedUserId = IdSchema.safeParse(rawUserId);
  if (!parsedUserId.success) {
    throw new UnauthorizedException("User not found!", ErrorCode.USER_NOTFOUND);
  }

  const userId = parsedUserId.data as UUID;

  await wishlistService.deleteWishlist(wishlistId, userId);
  res.status(204).json({ success: true });
};

export const searchWishlists = async (req: Request, res: Response) => {
  const wishlists = await wishlistService.searchWishlists(req.query);
  res.status(200).json(wishlists);
};

export const getWishlistsByUserId = async (req: Request, res: Response) => {
  const id = req.params.id;
  const parsedId = IdSchema.safeParse(id);
  if (!parsedId.success) {
    throw new BadRequestException("Invalid user id", ErrorCode.INVALID_USER_ID);
  }

  const userId = parsedId.data as UUID;

  const wishlists = await wishlistService.getWishlistsByUserId(userId);

  res.status(200).json(wishlists);
};

export const getMatchingUsers = async (req: Request, res: Response) => {
  const userId = req.query.userId as UUID;
  const wishlistId = req.query.wishlistId as UUID | undefined;
  const radius = parseInt(req.query.radius as string) || 10;
  const timeDiff = req.query.timeDiff as string || '15d';
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  const users = await wishlistService.findMatchingUsers(userId, {
    radius,
    timeDiff,
    wishlistId,
    limit,
    offset
  });

  res.status(200).json(users);
};