import express from 'express';
import { getMinecraftProfile } from '../controllers/minecraft.controller';

const router = express.Router();

router.get('/profile/:username', getMinecraftProfile);

export default router;
