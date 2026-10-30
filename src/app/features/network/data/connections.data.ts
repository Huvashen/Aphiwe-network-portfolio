import { NETWORK_DEVICES } from './topology.data';
export interface NetworkConnection {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly lane: number;
  readonly kind: 'uplink' | 'backbone' | 'access';
}
// Cables transcribed from network-reference.png. Parallel physical links remain distinct.
const cables: readonly (readonly [string, string, number?])[] = [
  ['ISP1', 'ER1'],
  ['ISP2', 'ER2'],
  ['ER1', 'ES1'],
  ['ER2', 'ES1'],
  ['ES1', 'ASA1'],
  ['ES1', 'ASA2'],
  ['ASA1', 'ASA2'],
  ['ASA1', 'CS1'],
  ['ASA2', 'CS1'],
  ['CS1', 'Multilayer Switch1'],
  ['Multilayer Switch1', 'SRV-INFRA'],
  ['Multilayer Switch1', 'SRV-MGMT'],
  ['Multilayer Switch1', 'SRV-WEB'],
  ['CS1', 'DS1', -1],
  ['CS1', 'DS1', 1],
  ['CS1', 'DS2', -1],
  ['CS1', 'DS2', 1],
  ['DS1', 'AS1'],
  ['DS1', 'AS2'],
  ['DS1', 'AS3'],
  ['DS2', 'AS4'],
  ['DS2', 'AS5'],
  ['DS2', 'AS6'],
  ['AS1', 'PC0'],
  ['AS1', 'IP Phone0'],
  ['IP Phone0', 'PC1'],
  ['AS2', 'IP Phone1'],
  ['IP Phone1', 'PC2'],
  ['AS2', 'PC3'],
  ['AS2', 'Printer0'],
  ['AS3', 'PC4'],
  ['AS3', 'Laptop0'],
  ['AS4', 'Laptop1'],
  ['AS4', 'PC5'],
  ['AS4', 'IP Phone4'],
  ['IP Phone4', 'PC10'],
  ['AS5', 'IP Phone2'],
  ['IP Phone2', 'PC6'],
  ['AS5', 'Printer1'],
  ['AS5', 'PC7'],
  ['AS6', 'Printer2'],
  ['AS6', 'IP Phone3'],
  ['IP Phone3', 'PC9'],
  ['AS6', 'PC8'],
];
export const NETWORK_CONNECTIONS: readonly NetworkConnection[] = cables.map(
  ([from, to, lane = 0], i) => ({
    id: 'cable-' + i,
    from,
    to,
    lane,
    kind: lane ? 'uplink' : i < 13 ? 'backbone' : 'access',
  }),
);
const byId = new Map(NETWORK_DEVICES.map((d) => [d.id, d]));
export function connectionPath(c: NetworkConnection): string {
  const a = byId.get(c.from)!,
    b = byId.get(c.to)!;
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const dx = (-(b.y - a.y) / length) * c.lane * 6,
    dy = ((b.x - a.x) / length) * c.lane * 6;
  return 'M ' + (a.x + dx) + ' ' + (a.y + dy) + ' L ' + (b.x + dx) + ' ' + (b.y + dy);
}
if (
  new Set(NETWORK_CONNECTIONS.map((c) => c.id)).size !== NETWORK_CONNECTIONS.length ||
  NETWORK_CONNECTIONS.some((c) => !byId.has(c.from) || !byId.has(c.to) || c.from === c.to)
)
  throw new Error('Invalid topology connections');
