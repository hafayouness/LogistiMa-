import Delivery, { DeliveryStatus } from "../models/Delivery.js";
import Driver from "../models/Driver.js";
import DispatcherService from "../services/DispatcherService.js";
import CacheService from "../services/CacheService.js";

/* CREATE */
export const createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    await CacheService.delPattern("deliveries:*");
    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* READ ALL */
export const getDeliveries = async (req, res) => {
  try {
    const cacheKey = "deliveries:all";
    const cached = await CacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const deliveries = await Delivery.findAll({ include: Driver });
    await CacheService.set(cacheKey, deliveries);
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeliveryById = async (req, res) => {
  try {
    const cacheKey = `delivery:${req.params.id}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ message: "Not found" });

    await CacheService.set(cacheKey, delivery);
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const { id } = req.params;

    const result = await DispatcherService.assignDeliveryToDriver(id, driverId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    await CacheService.del(`delivery:${id}`);
    await CacheService.delPattern("deliveries:*");

    const delivery = await Delivery.findByPk(id);
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const autoDispatch = async (req, res) => {
  try {
    const result = await DispatcherService.autoDispatch(req.params.id);
    if (!result.success) {
      return res.status(400).json(result);
    }

    const delivery = await Delivery.findByPk(req.params.id);
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findByPk(req.params.id);

    if (!delivery) return res.status(404).json({ message: "Not found" });

    delivery.status = status;
    if (status === DeliveryStatus.DELIVERED) {
      delivery.deliveredAt = new Date();
    }

    await delivery.save();
    await CacheService.del(`delivery:${delivery.id}`);
    await CacheService.delPattern("deliveries:*");

    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
