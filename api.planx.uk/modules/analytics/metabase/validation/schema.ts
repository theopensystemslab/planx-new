import { z } from "zod";

// Constants
const VALIDATION_CONSTANTS = {
  NAME: {
    MIN: 0,
    MAX: 100,
    PATTERN: /^[\w\s-]+$/,
  },
  DESCRIPTION: {
    MAX: 500,
  },
} as const;

// Base schemas for reusable components
const baseStringSchema = z.string().min(1, "Field cannot be empty");
const baseNumberSchema = z
  .number()
  .int("Must be an integer")
  .positive("Must be positive");

// Collection validation schemas
export const collectionSchemas = {
  name: baseStringSchema
    .min(VALIDATION_CONSTANTS.NAME.MIN, "Name is too short")
    .max(VALIDATION_CONSTANTS.NAME.MAX, "Name is too long")
    .regex(VALIDATION_CONSTANTS.NAME.PATTERN, "Invalid characters in name"),

  description: z
    .string()
    .max(VALIDATION_CONSTANTS.DESCRIPTION.MAX, "Description is too long")
    .optional(),

  parent_id: z.string().optional(),

  namespace: z.string().optional(),

  authority_level: z.null().optional(),
};

// Dashboard validation schemas
export const dashboardSchemas = {
  dashboardId: baseNumberSchema,

  name: collectionSchemas.name,

  description: collectionSchemas.description,

  collectionId: baseNumberSchema
    .min(0, "Position must be 0 or greater")
    .nullable()
    .optional(),

  collectionPosition: baseNumberSchema
    .min(0, "Position must be 0 or greater")
    .nullable()
    .optional(),

  isDeepCopy: z.boolean().optional().default(false),
};

// Combined schemas for API endpoints
export const apiSchemas = {
  newCollection: z.object({
    body: z.object({
      ...collectionSchemas,
    }),
  }),

  copyDashboard: z.object({
    body: z.object({
      ...dashboardSchemas,
    }),
  }),

  updateFilter: z.object({
    body: z.object({
      dashboardId: dashboardSchemas.dashboardId,
      filter: baseStringSchema,
      value: baseStringSchema,
    }),
  }),
  generatePublicLink: z.object({
    params: z.object({
      dashboardId: z.coerce
        .number()
        .int("Must be an integer")
        .positive("Dashboard ID must be positive"),
    }),
    body: z.object({}).optional(), // Empty object, this one doesn't need a body
    query: z.object({}).optional(),
  }),
};

// Types
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

// Validation functions
export function validateMetabaseRequest<T extends keyof typeof apiSchemas>(
  schemaKey: T,
  data: unknown,
): ValidationResult<z.infer<(typeof apiSchemas)[T]>> {
  try {
    const schema = apiSchemas[schemaKey];
    const validated = schema.parse(data);

    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      };
    }

    return {
      success: false,
      errors: [
        {
          field: "unknown",
          message: "Validation failed",
        },
      ],
    };
  }
}

// Helper functions for common validation tasks
export const metabaseValidators = {
  isValidDashboardId: (id: unknown): id is number => {
    try {
      return dashboardSchemas.dashboardId.safeParse(id).success;
    } catch {
      return false;
    }
  },

  isValidCollectionName: (name: unknown): name is string => {
    try {
      return collectionSchemas.name.safeParse(name).success;
    } catch {
      return false;
    }
  },

  validateFilterUpdate: (
    dashboardId: unknown,
    filter: unknown,
    value: unknown,
  ): ValidationResult<{
    dashboardId: number;
    filter: string;
    value: string;
  }> => {
    const schema = apiSchemas.updateFilter.shape.body;
    try {
      const validated = schema.parse({ dashboardId, filter, value });
      return {
        success: true,
        data: validated,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        };
      }
      return {
        success: false,
        errors: [
          { field: "unknown", message: "Invalid filter update parameters" },
        ],
      };
    }
  },
};

export interface PublicLinkResponse {
  url: string;
}
