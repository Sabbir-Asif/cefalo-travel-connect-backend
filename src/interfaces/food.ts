import { UUID } from 'crypto';
import { z } from 'zod';
import { UpdateFoodSchema } from '../schemas/food';

export interface Food {
  id: UUID;
  name: string;
  category: string;
  provider: string;
  location: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFood {
  name: string;
  category: string;
  provider: string;
  location: string;
}

export type UpdateFood = z.infer<typeof UpdateFoodSchema>;
