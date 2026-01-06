import express from "express";
import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  updateDriverLocation,
} from "../controllers/driverController.js";

const router = express.Router();

router.post("/", createDriver);
router.get("/", getDrivers);
router.get("/:id", getDriverById);
router.patch("/:id", updateDriver);
router.patch("/:id/location", updateDriverLocation);

export default router;
