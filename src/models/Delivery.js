import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Driver from "./Driver.js";
import Zone from "./Zone.js";

export const DeliveryStatus = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

const Delivery = sequelize.define(
  "Delivery",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    pickupAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pickupLocation: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    deliveryLocation: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DeliveryStatus)),
      defaultValue: DeliveryStatus.PENDING,
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Driver,
        key: "id",
      },
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Zone,
        key: "id",
      },
    },
    scheduledAt: DataTypes.DATE,
    assignedAt: DataTypes.DATE,
    pickedUpAt: DataTypes.DATE,
    deliveredAt: DataTypes.DATE,
  },
  {
    tableName: "deliveries",
    timestamps: true,
  }
);

export default Delivery;
