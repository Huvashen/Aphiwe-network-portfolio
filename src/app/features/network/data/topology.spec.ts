import { NETWORK_DEVICES, TOPOLOGY_WIDTH, TOPOLOGY_HEIGHT } from './topology.data';
import { NETWORK_CONNECTIONS, connectionPath } from './connections.data';
import { DEVICE_COMMANDS } from './device-commands';
describe('Reference topology', () => {
  it('has exactly 42 independently identified devices within the drawing', () => {
    expect(NETWORK_DEVICES.length).toBe(42);
    expect(new Set(NETWORK_DEVICES.map((d) => d.id)).size).toBe(42);
    for (const d of NETWORK_DEVICES) {
      expect(d.x).toBeGreaterThan(0);
      expect(d.x).toBeLessThan(TOPOLOGY_WIDTH);
      expect(d.y).toBeGreaterThan(0);
      expect(d.y).toBeLessThan(TOPOLOGY_HEIGHT);
    }
  });
  it('preserves all 44 cables, with two distinct uplinks per distribution switch', () => {
    expect(NETWORK_CONNECTIONS.length).toBe(44);
    for (const id of ['DS1', 'DS2']) {
      const links = NETWORK_CONNECTIONS.filter((c) => c.from === 'CS1' && c.to === id);
      expect(links.length).toBe(2);
      expect(connectionPath(links[0])).not.toBe(connectionPath(links[1]));
    }
  });
  it('connects every cabled device to the core and leaves Home VoIP0 unconnected', () => {
    const seen = new Set(['CS1']);
    for (let i = 0; i < 42; i++)
      for (const c of NETWORK_CONNECTIONS) {
        if (seen.has(c.from)) seen.add(c.to);
        if (seen.has(c.to)) seen.add(c.from);
      }
    expect(seen.size).toBe(41);
    expect(seen.has('Home VoIP0')).toBe(false);
  });
  it('only accepts command keys matching actual devices', () => {
    for (const key of Object.keys(DEVICE_COMMANDS))
      expect(NETWORK_DEVICES.some((d) => d.id === key)).toBe(true);
  });
});
