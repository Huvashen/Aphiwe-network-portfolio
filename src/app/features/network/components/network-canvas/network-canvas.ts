import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import {
  NETWORK_DEVICES,
  NetworkDevice,
  TOPOLOGY_WIDTH,
  TOPOLOGY_HEIGHT,
} from '../../data/topology.data';
import { NETWORK_CONNECTIONS, connectionPath } from '../../data/connections.data';
import { DEVICE_COMMANDS } from '../../data/device-commands';
import { DeviceNode } from '../device-node/device-node';
import { MotionService } from '../../services/motion.service';
@Component({
  selector: 'app-network-canvas',
  standalone: true,
  imports: [DeviceNode],
  providers: [MotionService],
  templateUrl: './network-canvas.html',
  styleUrl: './network-canvas.css',
})
export class NetworkCanvas implements AfterViewInit, OnDestroy {
  @ViewChild('viewport') viewport!: ElementRef<HTMLElement>;
  @ViewChild('stage') stage!: ElementRef<HTMLElement>;
  @ViewChild('terminal') terminal!: ElementRef<HTMLDialogElement>;
  readonly devices = NETWORK_DEVICES;
  readonly links = NETWORK_CONNECTIONS.map((c) => ({ ...c, path: connectionPath(c) }));
  readonly width = TOPOLOGY_WIDTH;
  readonly height = TOPOLOGY_HEIGHT;
  readonly camera = signal({ x: 0, y: 0, scale: 1 });
  readonly zoomPercent = computed(() => Math.round(this.camera().scale * 100));
  readonly transform = computed(() => {
    const c = this.camera();
    return 'translate(' + c.x + 'px,' + c.y + 'px) scale(' + c.scale + ')';
  });
  readonly selectedDevice = signal<NetworkDevice | null>(null);
  readonly highlighted = signal<string | null>(null);
  readonly tracing = signal(false);
  readonly search = signal('');
  readonly announcement = signal('');
  readonly filtered = computed(() =>
    this.devices.filter((d) =>
      (d.id + ' ' + d.type).toLowerCase().includes(this.search().toLowerCase()),
    ),
  );
  readonly commands = computed(() => {
    const d = this.selectedDevice();
    return d ? DEVICE_COMMANDS[d.id]?.trim() || null : null;
  });
  readonly lines = computed(() =>
    (
      this.commands() ||
      '! Configuration pending\n! No verified learner commands have been supplied for this device.\n! This read-only placeholder will be replaced with the original configuration.'
    ).split('\n'),
  );
  readonly neighbours = computed(() => {
    const id = this.selectedDevice()?.id;
    return [
      ...new Set(
        this.links
          .filter((c) => c.from === id || c.to === id)
          .map((c) => (c.from === id ? c.to : c.from)),
      ),
    ];
  });
  private observer?: ResizeObserver;
  private pointers = new Map<number, { x: number; y: number }>();
  private moved = false;
  private down = { x: 0, y: 0 };
  private previousFocus?: HTMLElement;
  private oldOverflow = '';
  private cameraAnimation?: ReturnType<MotionService['run']>;
  private traceAnimation?: ReturnType<MotionService['run']>;
  constructor(
    private host: ElementRef<HTMLElement>,
    readonly motion: MotionService,
  ) {}
  ngAfterViewInit() {
    this.fit(false);
    this.motion.entrance(this.host.nativeElement);
    this.observer = new ResizeObserver(() => this.fit(false));
    this.observer.observe(this.viewport.nativeElement);
  }
  private setCamera(c: { x: number; y: number; scale: number }, smooth = false) {
    this.motion.stop(this.cameraAnimation);
    if (smooth && !this.motion.reduced) {
      const proxy = { ...this.camera() };
      this.cameraAnimation = this.motion.run(proxy, {
        ...c,
        duration: 420,
        ease: 'outCubic',
        onUpdate: () => this.camera.set({ ...proxy }),
      });
    } else this.camera.set(c);
  }
  fit(smooth = true) {
    const r = this.viewport.nativeElement.getBoundingClientRect();
    const scale = Math.max(
      0.08,
      Math.min((r.width - 48) / this.width, (r.height - 48) / this.height, 1),
    );
    this.setCamera(
      { scale, x: (r.width - this.width * scale) / 2, y: (r.height - this.height * scale) / 2 },
      smooth,
    );
  }
  zoom(factor: number, x?: number, y?: number, smooth = true) {
    const r = this.viewport.nativeElement.getBoundingClientRect(),
      c = this.camera();
    const px = x ?? r.width / 2,
      py = y ?? r.height / 2;
    const scale = Math.max(0.08, Math.min(2.5, c.scale * factor));
    this.setCamera(
      { scale, x: px - ((px - c.x) * scale) / c.scale, y: py - ((py - c.y) * scale) / c.scale },
      smooth,
    );
  }
  wheel(e: WheelEvent) {
    e.preventDefault();
    const r = this.viewport.nativeElement.getBoundingClientRect();
    this.zoom(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top, false);
  }
  pointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    this.motion.stop(this.cameraAnimation);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 1) {
      this.moved = false;
      this.down = { x: e.clientX, y: e.clientY };
    }
    if (!(e.target as HTMLElement).closest('button'))
      this.viewport.nativeElement.setPointerCapture(e.pointerId);
  }
  pointerMove(e: PointerEvent) {
    const old = this.pointers.get(e.pointerId);
    if (!old) return;
    const next = { x: e.clientX, y: e.clientY };
    if (Math.hypot(next.x - this.down.x, next.y - this.down.y) > 5) this.moved = true;
    if (!this.moved) return;
    this.viewport.nativeElement.setPointerCapture(e.pointerId);
    const points = [...this.pointers.entries()];
    if (points.length === 2) {
      const other = points.find(([id]) => id !== e.pointerId)![1];
      const before = Math.hypot(old.x - other.x, old.y - other.y),
        after = Math.hypot(next.x - other.x, next.y - other.y);
      const r = this.viewport.nativeElement.getBoundingClientRect();
      this.zoom(
        before > 0 ? after / before : 1,
        (old.x + other.x) / 2 - r.left,
        (old.y + other.y) / 2 - r.top,
        false,
      );
      const c = this.camera();
      this.camera.set({ ...c, x: c.x + (next.x - old.x) / 2, y: c.y + (next.y - old.y) / 2 });
    } else {
      const c = this.camera();
      this.camera.set({ ...c, x: c.x + next.x - old.x, y: c.y + next.y - old.y });
    }
    this.pointers.set(e.pointerId, next);
  }
  pointerUp(e: PointerEvent) {
    this.pointers.delete(e.pointerId);
  }
  canvasKey(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') this.moved = false;
    if (e.target !== e.currentTarget) return;
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [60, 0],
      ArrowRight: [-60, 0],
      ArrowUp: [0, 60],
      ArrowDown: [0, -60],
    };
    if (arrows[e.key]) {
      e.preventDefault();
      const [x, y] = arrows[e.key],
        c = this.camera();
      this.setCamera({ ...c, x: c.x + x, y: c.y + y });
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      this.zoom(1.2);
    } else if (e.key === '-') {
      e.preventDefault();
      this.zoom(1 / 1.2);
    } else if (e.key === '0') {
      e.preventDefault();
      this.fit();
    }
  }
  openDevice(d: NetworkDevice, fromCanvas = false) {
    if (fromCanvas && this.moved) {
      this.moved = false;
      return;
    }
    this.selectedDevice.set(d);
    this.previousFocus = document.activeElement as HTMLElement;
    this.oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.terminal.nativeElement.showModal();
    this.terminal.nativeElement.querySelector<HTMLButtonElement>('[data-close]')?.focus();
    this.motion.run(this.terminal.nativeElement, {
      opacity: { from: 0, to: 1 },
      y: { from: 20, to: 0 },
      scale: { from: 0.97, to: 1 },
      duration: 350,
      ease: 'outExpo',
    });
  }
  closeDevice() {
    this.terminal.nativeElement.close();
  }
  closed() {
    document.body.style.overflow = this.oldOverflow;
    this.selectedDevice.set(null);
    this.previousFocus?.focus();
  }
  backdrop(e: MouseEvent) {
    if (e.target !== this.terminal.nativeElement) return;
    const r = this.terminal.nativeElement.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      this.closeDevice();
  }
  trace() {
    this.tracing.update((v) => !v);
    this.motion.stop(this.traceAnimation);
    if (this.tracing())
      this.traceAnimation = this.motion.run(this.stage.nativeElement.querySelectorAll('.flow'), {
        strokeDashoffset: { from: 0, to: -120 },
        duration: 1800,
        loop: true,
        ease: 'linear',
      });
  }
  locate(d: NetworkDevice) {
    this.viewport.nativeElement.scrollIntoView({
      block: 'center',
      behavior: this.motion.reduced ? 'instant' : 'smooth',
    });
    const r = this.viewport.nativeElement.getBoundingClientRect();
    this.highlighted.set(d.id);
    this.setCamera({ scale: 1, x: r.width / 2 - d.x, y: r.height / 2 - d.y }, true);
    this.announcement.set('Located ' + d.id);
  }
  lineClass(line: string) {
    return line.trim().startsWith('!')
      ? 'text-slate-400'
      : line.trim().startsWith('#')
        ? 'text-amber-200'
        : 'text-emerald-200';
  }
  @HostListener('document:visibilitychange') visibility() {
    if (document.hidden && this.tracing()) {
      this.tracing.set(false);
      this.motion.stop(this.traceAnimation);
    }
  }
  ngOnDestroy() {
    this.observer?.disconnect();
    if (this.selectedDevice()) document.body.style.overflow = this.oldOverflow;
  }
}
