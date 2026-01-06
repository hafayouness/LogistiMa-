import sequelize from "../config/database.js";
import Zone from "../models/Zone.js";
import Driver, { DriverStatus } from "../models/Driver.js";
import Delivery, { DeliveryStatus } from "../models/Delivery.js";

// utils
const randomBetween = (min, max) => Math.random() * (max - min) + min;

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding database...");
    await sequelize.sync({ force: true });

    // =====================
    // ZONES (20)
    // =====================
    const zonesData = Array.from({ length: 20 }).map((_, i) => ({
      name: `Zone ${i + 1}`,
      coordinates: {
        lat: randomBetween(33.52, 33.65),
        lng: randomBetween(-7.7, -7.45),
      },
    }));

    const zones = await Zone.bulkCreate(zonesData, { returning: true });

    // =====================
    // DRIVERS (50)
    // =====================
    const driversData = Array.from({ length: 50 }).map((_, i) => {
      const maxDeliveries = Math.floor(randomBetween(2, 5));
      const currentDeliveries = Math.floor(randomBetween(0, maxDeliveries + 1));

      return {
        name: `Driver ${i + 1}`,
        phone: `06${Math.floor(10000000 + Math.random() * 89999999)}`,
        status:
          currentDeliveries >= maxDeliveries
            ? DriverStatus.BUSY
            : DriverStatus.AVAILABLE,
        currentLocation: {
          lat: randomBetween(33.52, 33.65),
          lng: randomBetween(-7.7, -7.45),
        },
        currentDeliveries,
        maxDeliveries,
        zoneId: randomFrom(zones).id,
      };
    });

    const drivers = await Driver.bulkCreate(driversData, { returning: true });

    // =====================
    // DELIVERIES (100)
    // =====================
    const statuses = [
      DeliveryStatus.PENDING,
      DeliveryStatus.ASSIGNED,
      DeliveryStatus.IN_TRANSIT,
      DeliveryStatus.DELIVERED,
    ];

    const deliveriesData = Array.from({ length: 100 }).map((_, i) => {
      const status = randomFrom(statuses);
      const driver =
        status === DeliveryStatus.PENDING ? null : randomFrom(drivers);

      return {
        trackingNumber: `TRK-${String(i + 1).padStart(4, "0")}`,
        pickupAddress: `Pickup Address ${i + 1}`,
        deliveryAddress: `Delivery Address ${i + 1}`,
        pickupLocation: {
          lat: randomBetween(33.52, 33.65),
          lng: randomBetween(-7.7, -7.45),
        },
        deliveryLocation: {
          lat: randomBetween(33.52, 33.65),
          lng: randomBetween(-7.7, -7.45),
        },
        customerName: `Customer ${i + 1}`,
        customerPhone: `06${Math.floor(10000000 + Math.random() * 89999999)}`,
        status,
        zoneId: randomFrom(zones).id,
        driverId: driver ? driver.id : null,
        assignedAt: status === DeliveryStatus.ASSIGNED ? new Date() : null,
        pickedUpAt: status === DeliveryStatus.IN_TRANSIT ? new Date() : null,
        deliveredAt: status === DeliveryStatus.DELIVERED ? new Date() : null,
      };
    });

    await Delivery.bulkCreate(deliveriesData);

    console.log("✅ Seed terminé (20 zones + 50 drivers + 100 deliveries)");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur seed:", error);
    process.exit(1);
  }
};

seedDatabase();
