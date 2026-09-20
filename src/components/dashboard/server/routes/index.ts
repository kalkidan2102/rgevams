import { Router } from "express";
import authRoutes from "./auth.routes";
import adminRoutes from "./admin.routes";
import volcanoRoutes from "./Volcano.routes";
import earthquakeRoutes from "./earthquake.routes";
import seismicRoutes from "./seismic.routes";
import reportRoutes from "./report.routes";
import contentRoutes from "./content.routes";
import aiRoutes from "./ai.routes";
import spatialRoutes from "./spatial.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/", spatialRoutes);
apiRouter.use("/", volcanoRoutes);
apiRouter.use("/", earthquakeRoutes);
apiRouter.use("/", seismicRoutes);
apiRouter.use("/", reportRoutes);
apiRouter.use("/", contentRoutes);
apiRouter.use("/", aiRoutes);

// Additional direct aliases for backward-compatible root routes
apiRouter.use("/", authRoutes);
apiRouter.use("/", adminRoutes);

export default apiRouter;
