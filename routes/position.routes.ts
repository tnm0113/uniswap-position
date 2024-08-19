import { Router } from "express";
import PositionController from "../controllers/position.controller";

class PositionRoutes {
  router = Router();
  controller = new PositionController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() { 
    this.router.get("/", this.controller.findAll);
  }
}

export default new PositionRoutes().router;