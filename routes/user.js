import { Router } from "express"
import { allUsers, createUser } from "../controllers/user.js"
import { validateUser } from "../middlewares/user.js"

const router = Router()

router.post("/", validateUser, createUser)

router.get("/", allUsers)

export default router
