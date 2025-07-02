import express from 'express';
import { searchLocationHandler, reverseGeocodeHandler } from '../controllers/location';
import { errorHandler } from '../global-error-handler';

const locationRouter = express.Router();

locationRouter.get('/search', errorHandler(searchLocationHandler));
locationRouter.get('/reverse', errorHandler(reverseGeocodeHandler));

export default locationRouter;
