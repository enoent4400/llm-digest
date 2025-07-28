// Database implementation switcher
// Allows switching between mock and PocketBase implementations

import * as mockDigests from './mock-digests';
import * as pocketbaseDigests from './pocketbase-digests';

const DATABASE_TYPE = process.env.DATABASE_TYPE || 'mock';

// Choose implementation based on environment
const implementation = DATABASE_TYPE === 'pocketbase' ? pocketbaseDigests : mockDigests;

// Re-export all functions from the chosen implementation
export const saveDigest = implementation.saveDigest;
export const getDigestById = implementation.getDigestById;
export const getUserDigests = implementation.getUserDigests;
export const updateDigest = implementation.updateDigest;
export const getDigestByFingerprint = implementation.getDigestByFingerprint;
export const deleteDigest = implementation.deleteDigest;

// Re-export types
export type { DigestData, DigestRecord } from './mock-digests';