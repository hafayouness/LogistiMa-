import Driver from "../models/Driver.js";
import CacheService from "../services/CacheService.js";

export const createDriver = async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    await CacheService.delPattern("drivers:*");
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDrivers = async (req, res) => {
  try {
    const cacheKey = "drivers:all";
    const cached = await CacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const drivers = await Driver.findAll();
    await CacheService.set(cacheKey, drivers);
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: "Not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: "Not found" });

    await driver.update(req.body);
    await CacheService.delPattern("drivers:*");
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDriverLocation = async (req, res) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: "Not found" });

    driver.currentLocation = req.body.currentLocation;
    await driver.save();

    await CacheService.delPattern("drivers:*");
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
