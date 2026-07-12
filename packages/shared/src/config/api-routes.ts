/**
 * API Routes Registry — Single Source of Truth
 *
 * This file is the central contract between the backend and frontend.
 *
 * ✅ BACKEND DEVELOPER: When you add a new endpoint, register it here FIRST.
 * ✅ FRONTEND DEVELOPER: Always import route paths from here. Never hardcode strings.
 *
 * Path Format: Full path as the frontend will call it (e.g. "/auth/login")
 * Method:      HTTP verb in uppercase (GET | POST | PUT | PATCH | DELETE)
 * Auth:        Whether the route requires a valid Bearer token
 */

export const apiRoutes = {
  // ─── Health ────────────────────────────────────────────────────────────────
  health: {
    check: {
      path: "/health",
      method: "GET",
      auth: false,
      description: "Returns server health status.",
    },
  },

  // ─── Auth Module ───────────────────────────────────────────────────────────
  auth: {
    signup: {
      path: "/auth/signup",
      method: "POST",
      auth: false,
      description: "Create a new Employee account.",
    },
    login: {
      path: "/auth/login",
      method: "POST",
      auth: false,
      description: "Authenticate with email & password. Returns access token.",
    },
    forgotPassword: {
      path: "/auth/forgot-password",
      method: "POST",
      auth: false,
      description: "Initiate password reset.",
    },
    resetPassword: {
      path: "/auth/reset-password",
      method: "POST",
      auth: false,
      description: "Complete password reset.",
    },
    me: {
      path: "/auth/me",
      method: "GET",
      auth: true,
      description: "Validate session / fetch current user profile.",
    },
  },

  // ─── Org Setup Module ──────────────────────────────────────────────────────
  departments: {
    list: {
      path: "/departments",
      method: "GET",
      auth: true,
      description: "Get departments hierarchy org-wide.",
    },
    create: {
      path: "/departments",
      method: "POST",
      auth: true,
      description: "Create a new department (Admin only).",
    },
    update: {
      path: "/departments/:id",
      method: "PUT",
      auth: true,
      description: "Update a department (Admin only).",
    },
    deactivate: {
      path: "/departments/:id/deactivate",
      method: "PATCH",
      auth: true,
      description: "Deactivate a department (Admin only).",
    },
  },

  assetCategories: {
    list: {
      path: "/asset-categories",
      method: "GET",
      auth: true,
      description: "Get asset categories.",
    },
    create: {
      path: "/asset-categories",
      method: "POST",
      auth: true,
      description: "Create a new asset category (Admin only).",
    },
    update: {
      path: "/asset-categories/:id",
      method: "PUT",
      auth: true,
      description: "Update an asset category (Admin only).",
    },
    delete: {
      path: "/asset-categories/:id",
      method: "DELETE",
      auth: true,
      description: "Delete an asset category (Admin only).",
    },
  },

  employees: {
    list: {
      path: "/employees",
      method: "GET",
      auth: true,
      description: "List employees (Admin/Department Head only).",
    },
    updateRole: {
      path: "/employees/:id/role",
      method: "PATCH",
      auth: true,
      description: "Update employee role (Admin only).",
    },
    updateStatus: {
      path: "/employees/:id/status",
      method: "PATCH",
      auth: true,
      description: "Update employee status (Admin only).",
    },
  },

  // ─── Asset Registry Module ─────────────────────────────────────────────────
  assets: {
    list: {
      path: "/assets",
      method: "GET",
      auth: true,
      description: "List all assets with filtering and pagination.",
    },
    getById: {
      path: "/assets/:id",
      method: "GET",
      auth: true,
      description: "Get asset by ID with allocation and maintenance history details.",
    },
    create: {
      path: "/assets",
      method: "POST",
      auth: true,
      description: "Register a new asset (Asset Manager/Admin only).",
    },
    update: {
      path: "/assets/:id",
      method: "PUT",
      auth: true,
      description: "Update asset details (Asset Manager/Admin only).",
    },
    retire: {
      path: "/assets/:id/retire",
      method: "PATCH",
      auth: true,
      description: "Retire an asset (Asset Manager/Admin only).",
    },
    dispose: {
      path: "/assets/:id/dispose",
      method: "PATCH",
      auth: true,
      description: "Dispose of a retired asset (Asset Manager/Admin only).",
    },
  },

  // ─── Allocation Module ─────────────────────────────────────────────────────
  allocations: {
    create: {
      path: "/allocations",
      method: "POST",
      auth: true,
      description: "Allocate an asset (Asset Manager/Admin/Dept Head).",
    },
    return: {
      path: "/allocations/:id/return",
      method: "PATCH",
      auth: true,
      description: "Return an allocated asset.",
    },
  },

  transferRequests: {
    create: {
      path: "/transfer-requests",
      method: "POST",
      auth: true,
      description: "Request an asset transfer.",
    },
    approve: {
      path: "/transfer-requests/:id/approve",
      method: "PATCH",
      auth: true,
      description: "Approve a transfer request.",
    },
    reject: {
      path: "/transfer-requests/:id/reject",
      method: "PATCH",
      auth: true,
      description: "Reject a transfer request.",
    },
  },

  // ─── Booking Module ────────────────────────────────────────────────────────
  bookings: {
    list: {
      path: "/bookings",
      method: "GET",
      auth: true,
      description: "List bookings (calendar view).",
    },
    create: {
      path: "/bookings",
      method: "POST",
      auth: true,
      description: "Book an asset.",
    },
    cancel: {
      path: "/bookings/:id/cancel",
      method: "PATCH",
      auth: true,
      description: "Cancel a booking.",
    },
    reschedule: {
      path: "/bookings/:id/reschedule",
      method: "PATCH",
      auth: true,
      description: "Reschedule an upcoming booking.",
    },
  },

  // ─── Maintenance Module ────────────────────────────────────────────────────
  maintenanceRequests: {
    create: {
      path: "/maintenance-requests",
      method: "POST",
      auth: true,
      description: "Submit a maintenance request.",
    },
    approve: {
      path: "/maintenance-requests/:id/approve",
      method: "PATCH",
      auth: true,
      description: "Approve a maintenance request.",
    },
    reject: {
      path: "/maintenance-requests/:id/reject",
      method: "PATCH",
      auth: true,
      description: "Reject a maintenance request.",
    },
    assignTechnician: {
      path: "/maintenance-requests/:id/assign-technician",
      method: "PATCH",
      auth: true,
      description: "Assign technician to a request.",
    },
    start: {
      path: "/maintenance-requests/:id/start",
      method: "PATCH",
      auth: true,
      description: "Start maintenance work.",
    },
    resolve: {
      path: "/maintenance-requests/:id/resolve",
      method: "PATCH",
      auth: true,
      description: "Resolve maintenance request.",
    },
  },

  // ─── Audit Module ──────────────────────────────────────────────────────────
  audits: {
    createCycle: {
      path: "/audit-cycles",
      method: "POST",
      auth: true,
      description: "Initiate a new audit cycle.",
    },
    updateItem: {
      path: "/audit-cycle-items/:id",
      method: "PATCH",
      auth: true,
      description: "Verify or report status of an audit cycle item.",
    },
    closeCycle: {
      path: "/audit-cycles/:id/close",
      method: "PATCH",
      auth: true,
      description: "Close an audit cycle.",
    },
  },

  // ─── Dashboard & Reports Module ────────────────────────────────────────────
  dashboard: {
    summary: {
      path: "/dashboard",
      method: "GET",
      auth: true,
      description: "Returns summary statistics and KPIs for the authenticated user.",
    },
  },

  reports: {
    utilization: {
      path: "/reports/utilization",
      method: "GET",
      auth: true,
      description: "Fetch utilization report.",
    },
    maintenanceFrequency: {
      path: "/reports/maintenance-frequency",
      method: "GET",
      auth: true,
      description: "Fetch maintenance frequency report.",
    },
    retirementForecast: {
      path: "/reports/retirement-forecast",
      method: "GET",
      auth: true,
      description: "Fetch retirement forecast report.",
    },
    departmentAllocationSummary: {
      path: "/reports/department-allocation-summary",
      method: "GET",
      auth: true,
      description: "Fetch department allocation summary report.",
    },
    bookingHeatmap: {
      path: "/reports/booking-heatmap",
      method: "GET",
      auth: true,
      description: "Fetch booking heatmap report.",
    },
    export: {
      path: "/reports/:reportType/export",
      method: "GET",
      auth: true,
      description: "Export reports as CSV/PDF stream.",
    },
  },

  // ─── Notifications & Activity Log Module ──────────────────────────────────
  notifications: {
    list: {
      path: "/notifications",
      method: "GET",
      auth: true,
      description: "Fetch notifications for the authenticated user.",
    },
    read: {
      path: "/notifications/:id/read",
      method: "PATCH",
      auth: true,
      description: "Mark notification as read.",
    },
  },

  activityLogs: {
    list: {
      path: "/activity-logs",
      method: "GET",
      auth: true,
      description: "Fetch activity logs (role-scoped).",
    },
  },
} as const;

// ─── Derived Types (auto-generated, do not edit manually) ─────────────────────
export type ApiRoutes = typeof apiRoutes;
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
