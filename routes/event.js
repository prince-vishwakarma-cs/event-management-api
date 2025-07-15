import { Router } from "express"
import { validateEvent } from "../middlewares/event.js"
import {
  cancelRegistration,
  createEvent,
  eventInfo,
  eventStats,
  registerForEvent,
  upcomingEvents,
} from "../controllers/event.js"

const router = Router()

router.post("/", validateEvent, createEvent)

router.get("/:id", eventInfo)

router.post("/:id/register", registerForEvent)

router.delete("/:id/register", cancelRegistration)

router.get("/", upcomingEvents)

router.get("/:id/stats", eventStats)

export default router