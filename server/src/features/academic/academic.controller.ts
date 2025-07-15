import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { academicService } from "./academic.service";

class AcademicController {
  createLevel = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const newLevel = await academicService.createAcademicLevel(name);
    res.status(201).json({ status: "success", data: newLevel });
  });

  createSubject = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const newSubject = await academicService.createSubject(name);
    res.status(201).json({ status: "success", data: newSubject });
  });
  getLevels = asyncHandler(async (_req: Request, res: Response) => {
    const levels = await academicService.getAcademicLevels();
    res.status(200).json({ status: "success", data: levels });
  });

  getSubjects = asyncHandler(async (_req: Request, res: Response) => {
    const subjects = await academicService.getSubjects();
    res.status(200).json({ status: "success", data: subjects });
  });
}

export const academicController = new AcademicController();
