import Zone from "../models/Zone.js";
import CacheService from "../services/CacheService.js";

export const createZone = async (req, res) => {
  try {
    const zone = await Zone.create(req.body);
    await CacheService.delPattern("zones:*");
    res.status(201).json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getZones = async (req, res) => {
  try {
    const cacheKey = "zones:all";
    const cached = await CacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const zones = await Zone.findAll();
    await CacheService.set(cacheKey, zones);
    res.json(zones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: "Not found" });
    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: "Not found" });

    await zone.update(req.body);
    await CacheService.delPattern("zones:*");
    res.json(zone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: "Not found" });

    await zone.destroy();
    await CacheService.delPattern("zones:*");
    res.json({ message: "Zone deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
