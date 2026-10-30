import { ElementRef } from '@angular/core';
import { NetworkCanvas } from './network-canvas';
import { MotionService } from '../../services/motion.service';
describe('Canvas navigation', () => {
  function canvas() {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 1000,
      bottom: 600,
      width: 1000,
      height: 600,
      toJSON: () => ({}),
    });
    element.setPointerCapture = () => {};
    const motion = { reduced: true, stop: () => {} } as unknown as MotionService;
    const component = new NetworkCanvas(new ElementRef(element), motion);
    component.viewport = new ElementRef(element);
    return component;
  }
  it('keeps the topology point under the wheel anchor fixed', () => {
    const c = canvas();
    c.camera.set({ x: 100, y: 50, scale: 0.5 });
    const before = c.camera();
    c.zoom(2, 300, 200, false);
    const after = c.camera();
    expect((300 - before.x) / before.scale).toBe((300 - after.x) / after.scale);
    expect((200 - before.y) / before.scale).toBe((200 - after.y) / after.scale);
  });
  it('supports free dragging and stops after pointer release', () => {
    const c = canvas();
    const e = (x: number, y: number) =>
      ({
        button: 0,
        pointerId: 1,
        clientX: x,
        clientY: y,
        target: document.createElement('div'),
      }) as unknown as PointerEvent;
    c.pointerDown(e(100, 100));
    c.pointerMove(e(150, 130));
    expect(c.camera()).toEqual({ x: 50, y: 30, scale: 1 });
    c.pointerUp(e(150, 130));
    c.pointerMove(e(200, 200));
    expect(c.camera().x).toBe(50);
  });
  it('supports two-finger zoom and retains finite camera values', () => {
    const c = canvas();
    const e = (id: number, x: number) =>
      ({
        button: 0,
        pointerId: id,
        clientX: x,
        clientY: 100,
        target: document.createElement('div'),
      }) as unknown as PointerEvent;
    c.pointerDown(e(1, 100));
    c.pointerDown(e(2, 200));
    c.pointerMove(e(2, 300));
    expect(c.camera().scale).toBe(2);
    expect(Number.isFinite(c.camera().x)).toBe(true);
    c.pointerUp(e(1, 100));
    c.pointerUp(e(2, 300));
  });
  it('fits narrow screens without allowing zero or unbounded zoom', () => {
    const c = canvas();
    c.fit(false);
    expect(c.camera().scale).toBeGreaterThan(0);
    c.zoom(1e9, 0, 0, false);
    expect(c.camera().scale).toBe(2.5);
    c.zoom(1e-9, 0, 0, false);
    expect(c.camera().scale).toBe(0.08);
  });
});
