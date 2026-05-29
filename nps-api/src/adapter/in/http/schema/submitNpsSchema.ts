export const submitNpsSchema = {
  body: {
    type: "object",
    required: ["score"],
    properties: {
      score: {
        type: "number",
        multipleOf: 1,
        minimum: 0,
        maximum: 10,
        description: "Nota NPS de 0 a 10",
      },
      comment: {
        type: "string",
        maxLength: 1000,
        description: "Comentário opcional",
      },
      name: {
        type: "string",
        maxLength: 100,
        description: "Nome do avaliador (opcional)",
      },
      page: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        description: "Identificador da página avaliada",
        default: "portfolio",
      },
    },
  },
  response: {
    201: {
      type: "object",
      properties: {
        id: { type: "string" },
        score: { type: "integer" },
        comment: { type: ["string", "null"] },
        page: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  },
};

export const getSummarySchema = {
  querystring: {
    type: "object",
    properties: {
      page: { type: "string", minLength: 1, maxLength: 100 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        npsScore: { type: "number" },
        totalResponses: { type: "number" },
        promoters: { type: "number" },
        passives: { type: "number" },
        detractors: { type: "number" },
        zone: { type: "string" },
        distribution: {
          type: "object",
          additionalProperties: { type: "number" },
        },
        page: { type: "string" },
        truncated: { type: "boolean" },
      },
    },
  },
};

export const listResponsesSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              score: { type: "integer" },
              comment: { type: ["string", "null"] },
              name: { type: ["string", "null"] },
              page: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
        },
        total: { type: "integer" },
        limit: { type: "integer" },
        offset: { type: "integer" },
      },
    },
  },
  querystring: {
    type: "object",
    properties: {
      page: { type: "string", minLength: 1, maxLength: 100 },
      limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
      offset: { type: "integer", minimum: 0, maximum: 100000, default: 0 },
    },
  },
};
