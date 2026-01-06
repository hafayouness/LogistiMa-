import Redlock from "redlock";
import sequelize from "../config/database.js";
import { redisLock } from "../config/Redis.js";
import Driver, { DriverStatus } from "../models/Driver.js";
import Delivery, { DeliveryStatus } from "../models/Delivery.js";
import QueueService from "./QueueService.js";

class DispatcherService {
  constructor() {
    this.LOCK_TTL = parseInt(process.env.LOCK_TTL || "5000");

    this.redlock = new Redlock([redisLock], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
      automaticExtensionThreshold: 500,
    });

    this.redlock.on("error", (error) => {
      console.error("Redlock error:", error);
    });
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  calculateDistance(loc1, loc2) {
    const R = 6371;
    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLon = this.deg2rad(loc2.lng - loc1.lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(loc1.lat)) *
        Math.cos(this.deg2rad(loc2.lat)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async findNearestAvailableDriver(location, zoneId) {
    const where = { status: DriverStatus.AVAILABLE };
    if (zoneId) where.zoneId = zoneId;

    const drivers = await Driver.findAll({ where, raw: true });
    if (!drivers.length) return null;

    let nearestDriver = null;
    let minDistance = Infinity;

    for (const driver of drivers) {
      if (driver.currentDeliveries < driver.maxDeliveries) {
        const distance = this.calculateDistance(
          location,
          driver.currentLocation
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      }
    }

    return nearestDriver;
  }

  async assignDeliveryToDriver(deliveryId, driverId) {
    const lockKey = `driver:${driverId}:lock`;
    let lock;

    try {
      lock = await this.redlock.acquire([lockKey], this.LOCK_TTL);

      const result = await sequelize.transaction(async (t) => {
        const driver = await Driver.findByPk(driverId, {
          lock: t.LOCK.UPDATE,
          transaction: t,
        });

        if (!driver) throw new Error("Driver not found");
        if (driver.status !== DriverStatus.AVAILABLE)
          throw new Error("Driver is not available");
        if (driver.currentDeliveries >= driver.maxDeliveries)
          throw new Error("Driver capacity reached");

        const delivery = await Delivery.findByPk(deliveryId, {
          lock: t.LOCK.UPDATE,
          transaction: t,
        });

        if (!delivery) throw new Error("Delivery not found");
        if (delivery.status !== DeliveryStatus.PENDING)
          throw new Error("Delivery not pending");

        await delivery.update(
          {
            driverId: driver.id,
            status: DeliveryStatus.ASSIGNED,
            assignedAt: new Date(),
          },
          { transaction: t }
        );

        await driver.update(
          {
            currentDeliveries: driver.currentDeliveries + 1,
            status:
              driver.currentDeliveries + 1 >= driver.maxDeliveries
                ? DriverStatus.BUSY
                : DriverStatus.AVAILABLE,
          },
          { transaction: t }
        );

        await QueueService.addRouteCalculation({
          deliveryId: delivery.id,
          pickupLocation: delivery.pickupLocation,
          deliveryLocation: delivery.deliveryLocation,
        });

        await QueueService.addReceiptGeneration({
          deliveryId: delivery.id,
          trackingNumber: delivery.trackingNumber,
          customerName: delivery.customerName,
          driverId: driver.id,
        });

        return { success: true };
      });

      return result;
    } catch (error) {
      console.error("Assignment error:", error);
      return { success: false, error: error.message };
    } finally {
      if (lock) {
        try {
          await lock.release();
        } catch (e) {
          console.error("Lock release error:", e);
        }
      }
    }
  }

  async autoDispatch(deliveryId) {
    try {
      const delivery = await Delivery.findByPk(deliveryId);
      if (!delivery) return { success: false, error: "Delivery not found" };

      const driver = await this.findNearestAvailableDriver(
        delivery.pickupLocation,
        delivery.zoneId
      );

      if (!driver) return { success: false, error: "No available driver" };

      return this.assignDeliveryToDriver(deliveryId, driver.id);
    } catch (error) {
      console.error("Auto dispatch error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new DispatcherService();
