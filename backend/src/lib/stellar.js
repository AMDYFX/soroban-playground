// Copyright (c) 2026 StellarDevTools
// SPDX-License-Identifier: MIT

import { StrKey } from '@stellar/stellar-sdk';

/**
 * Validates whether a given string is a valid Stellar address (account or contract).
 *
 * @param {string} address
 * @returns {boolean}
 */
export function validateStellarAddress(address) {
  if (typeof address !== 'string') return false;
  try {
    return (
      StrKey.isValidEd25519PublicKey(address) ||
      (typeof StrKey.isValidMed25519PublicKey === 'function' &&
        StrKey.isValidMed25519PublicKey(address)) ||
      (typeof StrKey.isValidContract === 'function' &&
        StrKey.isValidContract(address))
    );
  } catch {
    return false;
  }
}

export default {
  validateStellarAddress,
};
