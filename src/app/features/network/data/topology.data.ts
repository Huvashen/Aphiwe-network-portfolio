export type DeviceType =
  | 'cloud'
  | 'router'
  | 'firewall'
  | 'switch'
  | 'server'
  | 'pc'
  | 'laptop'
  | 'printer'
  | 'phone'
  | 'voip';

export interface NetworkDevice {
  readonly id: string;
  readonly type: DeviceType;
  readonly x: number;
  readonly y: number;
  /** Optional final artwork for this specific device; otherwise uses its type SVG. */
  readonly imageSrc?: string;
}

export const TOPOLOGY_WIDTH = 2048;
export const TOPOLOGY_HEIGHT = 1070;

type DeviceRow = readonly [id: string, type: DeviceType, x: number, y: number];

// Centres measured in the normalized 2048 x 1070 reference coordinate space.
// Source PNG is 3175 x 1660; the drawing is scaled without changing topology.
const deviceRows: readonly DeviceRow[] = [
  // Internet providers
  ['ISP1', 'cloud', 519, 97],
  ['ISP2', 'cloud', 519, 173],

  // Edge routers and switch
  ['ER1', 'router', 731, 98],
  ['ER2', 'router', 730, 173],
  ['ES1', 'switch', 1003, 121],

  // Firewall layer
  ['ASA1', 'firewall', 931, 241],
  ['ASA2', 'firewall', 1119, 235],

  // Core infrastructure
  ['CS1', 'switch', 1011, 389],
  ['Multilayer Switch1', 'switch', 1319, 380],

  // Servers
  ['SRV-INFRA', 'server', 1324, 193],
  ['SRV-MGMT', 'server', 1538, 376],
  ['SRV-WEB', 'server', 1319, 511],

  // Distribution switches
  ['DS1', 'switch', 584, 658],
  ['DS2', 'switch', 1306, 675],

  // Access switches
  ['AS1', 'switch', 384, 659],
  ['AS2', 'switch', 580, 825],
  ['AS3', 'switch', 810, 843],
  ['AS4', 'switch', 1116, 677],
  ['AS5', 'switch', 1304, 836],
  ['AS6', 'switch', 1551, 675],

  // Workstations
  ['PC0', 'pc', 387, 482],
  ['PC1', 'pc', 152, 663],
  ['PC2', 'pc', 369, 831],
  ['PC3', 'pc', 493, 968],
  ['PC4', 'pc', 770, 955],
  ['PC5', 'pc', 1109, 578],
  ['PC6', 'pc', 1088, 906],
  ['PC7', 'pc', 1403, 960],
  ['PC8', 'pc', 1550, 842],
  ['PC9', 'pc', 1833, 675],
  ['PC10', 'pc', 943, 788],

  // Laptops
  ['Laptop0', 'laptop', 899, 937],
  ['Laptop1', 'laptop', 864, 678],

  // Printers
  ['Printer0', 'printer', 590, 955],
  ['Printer1', 'printer', 1215, 998],
  ['Printer2', 'printer', 1734, 519],

  // IP phones
  ['IP Phone0', 'phone', 252, 660],
  ['IP Phone1', 'phone', 484, 830],
  ['IP Phone2', 'phone', 1181, 841],
  ['IP Phone3', 'phone', 1707, 677],
  ['IP Phone4', 'phone', 1110, 786],

  // Home VoIP
  ['Home VoIP0', 'voip', 1574, 964],
];

export const NETWORK_DEVICES: readonly NetworkDevice[] = deviceRows.map(([id, type, x, y]) => ({
  id,
  type,
  x,
  y,
}));

// Prevent accidental duplicate device identifiers.
const uniqueIds = new Set(NETWORK_DEVICES.map((device) => device.id));

if (uniqueIds.size !== NETWORK_DEVICES.length) {
  throw new Error('Duplicate device IDs detected in network topology.');
}
