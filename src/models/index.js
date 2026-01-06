import Zone from "./Zone.js";
import Driver from "./Driver.js";
import Delivery from "./Delivery.js";

Zone.hasMany(Driver, { foreignKey: "zoneId", as: "drivers" });
Driver.belongsTo(Zone, { foreignKey: "zoneId", as: "zone" });

Zone.hasMany(Delivery, { foreignKey: "zoneId", as: "deliveries" });
Delivery.belongsTo(Zone, { foreignKey: "zoneId", as: "zone" });

Driver.hasMany(Delivery, { foreignKey: "driverId", as: "deliveries" });
Delivery.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });

export { Zone, Driver, Delivery };
