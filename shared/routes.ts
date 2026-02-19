import { z } from 'zod';
import { insertTriageSchema, insertSpecSchema, triageRequests, specifications, suppliers } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  triage: {
    list: {
      method: 'GET' as const,
      path: '/api/triage' as const,
      responses: {
        200: z.array(z.custom<typeof triageRequests.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/triage' as const,
      input: z.object({
        title: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof triageRequests.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/triage/:id' as const,
      responses: {
        200: z.custom<typeof triageRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/triage/:id' as const,
      input: insertTriageSchema.partial(),
      responses: {
        200: z.custom<typeof triageRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Specialized endpoint for the AI chat interaction
    chat: {
      method: 'POST' as const,
      path: '/api/triage/:id/chat' as const,
      input: z.object({
        message: z.string(),
      }),
      responses: {
        200: z.object({
          reply: z.string(),
          updatedRequest: z.custom<typeof triageRequests.$inferSelect>().optional(),
          recommendationAgreed: z.boolean().optional(),
          specificationReady: z.boolean().optional(),
        }),
      },
    },
    // Generate recommendation based on current state
    generateRecommendation: {
      method: 'POST' as const,
      path: '/api/triage/:id/recommend' as const,
      responses: {
        200: z.object({
          recommendation: z.custom<any>(), // Typed as Recommendation in schema but Zod validation is complex
        }),
      },
    },
  },
  specifications: {
    get: {
      method: 'GET' as const,
      path: '/api/triage/:id/spec' as const,
      responses: {
        200: z.custom<typeof specifications.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    save: {
      method: 'POST' as const,
      path: '/api/triage/:id/spec' as const,
      input: z.object({
        content: z.string(),
      }),
      responses: {
        200: z.custom<typeof specifications.$inferSelect>(),
      },
    },
  },
  suppliers: {
    list: {
      method: 'GET' as const,
      path: '/api/suppliers' as const,
      input: z.object({
        category: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof suppliers.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
