// server/src/features/academic/academic.controller.ts
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

  updateLevel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    const updatedLevel = await academicService.updateAcademicLevel(id, name);
    res.status(200).json({ status: "success", data: updatedLevel });
  });

  deleteLevel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await academicService.deleteAcademicLevel(id);
    res.status(204).send(); // 204 No Content is standard for a successful delete
  });

  updateSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    const updatedSubject = await academicService.updateSubject(id, name);
    res.status(200).json({ status: "success", data: updatedSubject });
  });

  deleteSubject = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await academicService.deleteSubject(id);
    res.status(204).send();
  });
}

export const academicController = new AcademicController();
