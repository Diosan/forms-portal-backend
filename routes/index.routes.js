// ++++++++++++++++++++++++++++++++++++++++++
import accessLogsRoutes from "./accesslogs.routes.js";
import authenticateRoutes from "./authenticate.routes.js";
// import configRoutes from './config.routes.js';
// import accountRoutes from './account.routes.js';
import adminUserRoutes from "./admin_users.routes.js";
import ttpsAdminRoutes from "./ttps_admin.routes.js";
import userRoutes from "./users.routes.js";
import passwordRoutes from "./password.routes.js";
// import notificationsRoutes from './notifications.routes.js';
import errorLogsRoutes from "./errorlogs.routes.js";
import errortypesRoutes from "./errortypes.routes.js";
// import permissionsRoutes from './permissions.routes.js';
import submissionsRoutes from "./submissions.routes.js";
import accusedRoutes from "./accuseds.routes.js";
// import rolesRoutes from './roles.routes.js';
import pdfRoutes from "./pdf.routes.js";
import efilingRoutes from "./efiling.routes.js";

export const setupRoutes =  (app) => {
  accessLogsRoutes(app);
  authenticateRoutes(app);
  pdfRoutes(app);
  efilingRoutes(app);
  // configRoutes(app);
  // accountRoutes(app);
  adminUserRoutes(app);
  ttpsAdminRoutes(app);
  // notificationsRoutes(app);
  errorLogsRoutes(app);
  errortypesRoutes(app);
  // permissionsRoutes(app);
  // rolesRoutes(app);
  submissionsRoutes(app);
  accusedRoutes(app);
  userRoutes(app);
};
