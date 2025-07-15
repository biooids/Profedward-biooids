// src/routes/shelf.routes.ts

import { Router } from "express";
import { shelfController } from "../features/shelf/shelf.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router: Router = Router();

// Apply the authentication middleware to ALL routes in this file.
// A user must be logged in to perform any shelf action.
router.use(verifyToken);

router
  .route("/")
  .post(shelfController.handleCreateShelf)
  .get(shelfController.handleGetMyShelves);

router
  .route("/:shelfId")
  .patch(shelfController.handleUpdateShelf)
  .delete(shelfController.handleDeleteShelf);

export default router;
