import { Injectable, OnDestroy } from '@angular/core';
import { animate, stagger } from 'animejs';
@Injectable()
export class MotionService implements OnDestroy {
  private readonly preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly running = new Set<ReturnType<typeof animate>>();
  private readonly changed = () => {
    if (this.reduced) {
      for (const a of this.running) a.revert();
      this.running.clear();
    }
  };
  get reduced() {
    return this.preference.matches;
  }
  constructor() {
    this.preference.addEventListener('change', this.changed);
  }
  run(target: Parameters<typeof animate>[0], options: Parameters<typeof animate>[1]) {
    if (this.reduced) return;
    const a = animate(target, options);
    this.running.add(a);
    a.then(() => this.running.delete(a));
    return a;
  }
  entrance(root: HTMLElement) {
    this.run(root.querySelectorAll('.intro'), {
      opacity: { from: 0, to: 1 },
      y: { from: 20, to: 0 },
      delay: stagger(85),
      duration: 650,
      ease: 'outCubic',
    });
    this.run(root.querySelectorAll('.device-visual'), {
      opacity: { from: 0, to: 1 },
      scale: { from: 0.7, to: 1 },
      delay: stagger(16),
      duration: 700,
      ease: 'outExpo',
    });
    this.run(root.querySelectorAll('.cable'), {
      opacity: { from: 0, to: 1 },
      delay: stagger(12),
      duration: 900,
    });
  }
  hover(target: HTMLElement, active: boolean) {
    this.run(target.querySelector('.device-visual')!, {
      y: active ? -7 : 0,
      rotateX: active ? 12 : 0,
      rotateY: active ? -10 : 0,
      scale: active ? 1.08 : 1,
      duration: 260,
      ease: 'outCubic',
    });
  }
  stop(a?: ReturnType<typeof animate>) {
    if (a) {
      a.cancel();
      this.running.delete(a);
    }
  }
  ngOnDestroy() {
    for (const a of this.running) a.cancel();
    this.running.clear();
    this.preference.removeEventListener('change', this.changed);
  }
}
