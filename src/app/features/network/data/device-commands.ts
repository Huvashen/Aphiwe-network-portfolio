/**
 * Verified, read-only CLI configurations.
 *
 * The keys must match the device IDs in topology.data.ts.
 * Only add actual configurations supplied by the learner.
 *
 * Example structure:
 * 'ER1': `actual commands copied from ER1`,
 */

export const DEVICE_COMMANDS: Readonly<Record<string, string>> = {};
