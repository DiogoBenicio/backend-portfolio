export const submitNpsSchema = {
  body: {
    type: 'object',
    required: ['score'],
    properties: {
      score: {
        type: 'integer',
        minimum: 0,
        maximum: 10,
        description: 'Nota NPS de 0 a 10',
      },
      comment: {
        type: 'string',
        maxLength: 1000,
        description: 'Comentário opcional',
      },
      page: {
        type: 'string',
        maxLength: 100,
        description: 'Identificador da página avaliada',
        default: 'portfolio',
      },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        score: { type: 'integer' },
        comment: { type: ['string', 'null'] },
        page: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  },
};

export const getSummarySchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'string' },
    },
  },
};

export const listResponsesSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'string' },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      offset: { type: 'integer', minimum: 0, default: 0 },
    },
  },
};
