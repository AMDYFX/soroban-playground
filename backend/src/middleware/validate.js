// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

/**
 * Express middleware factory for validating requests in routes.
 *
 * @param {string} schemaName
 * @param {'body'|'params'|'query'} [source='body']
 * @returns {import('express').RequestHandler}
 */
export function validate(schemaName, source = 'body') {
  return (req, res, next) => {
    if (source === 'params' && schemaName === 'contractIdParam') {
      if (!req.params?.id) {
        return res.status(400).json({ error: 'Missing contract ID parameter' });
      }
    }
    next();
  };
}

export default validate;
