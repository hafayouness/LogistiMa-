import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Zone from "./Zone.js";

export const DriverStatus = {
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
  OFFLINE: "OFFLINE",
};

const Driver = sequelize.define(
  "Driver",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DriverStatus)),
      defaultValue: DriverStatus.AVAILABLE,
    },
    currentLocation: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    maxDeliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    currentDeliveries: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Zone,
        key: "id",
      },
    },
  },
  {
    tableName: "drivers",
    timestamps: true,
  }
);

export default Driver;
