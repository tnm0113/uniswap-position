import { Request, Response } from "express";
import { findAll } from "../db";

export default class PositionController {
    async findAll(req: Request, res: Response) {
        try {
            let result = await findAll();
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({
                message: "Internal Server Error!"
            });
        }
      }
}