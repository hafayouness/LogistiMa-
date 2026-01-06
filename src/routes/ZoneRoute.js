import express from "express";
import {
  createZone,
  getZones,
  getZoneById,
  updateZone,
  deleteZone,
} from "../controllers/zoneController.js";

const router = express.Router();

router.post("/", createZone);
router.get("/", getZones);
router.get("/:id", getZoneById);
router.patch("/:id", updateZone);
router.delete("/:id", deleteZone);

export default router;
