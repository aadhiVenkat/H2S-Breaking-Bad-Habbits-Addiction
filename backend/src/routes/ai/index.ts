import { Router } from "express";
import { checkinRouter } from "./checkin.js";
import { coachRouter } from "./coach.js";
import { emergencyRouter } from "./emergency.js";
import { healthRouter } from "./health.js";
import { insightRouter } from "./insight.js";
import { nudgeRouter } from "./nudge.js";
import { planRouter } from "./plan.js";
import { relapseRouter } from "./relapse.js";
import { replacementsRouter } from "./replacements.js";

export const aiRouter = Router();

aiRouter.use("/health", healthRouter);
aiRouter.use("/plan", planRouter);
aiRouter.use("/coach", coachRouter);
aiRouter.use("/checkin", checkinRouter);
aiRouter.use("/emergency", emergencyRouter);
aiRouter.use("/relapse", relapseRouter);
aiRouter.use("/nudge", nudgeRouter);
aiRouter.use("/insight", insightRouter);
aiRouter.use("/replacements", replacementsRouter);
