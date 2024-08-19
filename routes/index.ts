import { Application } from "express";
import homeRoutes from "./home.routes";
import positionRoutes from "./position.routes";

export default class Routes {
  constructor(app: Application) {
    app.use("/api", homeRoutes);
    app.use("/api/position", positionRoutes);
  }
}