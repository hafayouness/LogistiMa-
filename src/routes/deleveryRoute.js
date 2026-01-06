import express from "express";
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  assignDriver,
  updateDeliveryStatus,
  autoDispatch,
} from "../controllers/deliveryController.js";

const router = express.Router();

router.post("/", createDelivery);
router.get("/", getDeliveries);
router.get("/:id", getDeliveryById);
router.patch("/:id/assign", assignDriver);
router.patch("/:id/auto-dispatch", autoDispatch);
router.patch("/:id/status", updateDeliveryStatus);

export default router;
