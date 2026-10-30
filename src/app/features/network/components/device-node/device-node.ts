import { Component, input, output } from '@angular/core';
import { NetworkDevice } from '../../data/topology.data';
import { MotionService } from '../../services/motion.service';
@Component({
  selector: 'app-device-node',
  standalone: true,
  template: ` <button
    type="button"
    class="device group"
    [class.device-active]="active()"
    [attr.aria-label]="device().id + ', ' + device().type + ', open read-only terminal'"
    (click)="opened.emit(device())"
    (mouseenter)="interact($event, true)"
    (mouseleave)="interact($event, false)"
    (focus)="interact($event, true)"
    (blur)="interact($event, false)"
  >
    <span class="device-visual"
      ><img
        [src]="device().imageSrc || 'assets/devices/' + device().type + '.svg'"
        alt=""
        width="70"
        height="64"
        draggable="false" /><span class="device-led"></span
    ></span>
    <span class="device-name">{{ device().id }}</span
    ><span class="device-type">{{ device().type }}</span>
  </button>`,
  styles: [
    `
      :host {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 112px;
        height: 96px;
        display: block;
      }
      .device {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
        cursor: pointer;
        color: #c9dbe8;
        border-radius: 12px;
        border: 1px solid transparent;
        perspective: 500px;
        background: transparent;
      }
      .device:hover,
      .device:focus-visible,
      .device-active {
        background: #163749aa;
        border-color: #4ed7e855;
        outline: none;
        box-shadow: 0 0 25px #16b9dd14;
      }
      .device-visual {
        position: relative;
        display: block;
        transform-style: preserve-3d;
        will-change: transform;
      }
      .device-led {
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #80e5b6;
        bottom: 10px;
        right: 10px;
        box-shadow: 0 0 6px #80e5b6;
      }
      .device-name {
        font:
          600 12px ui-monospace,
          monospace;
        white-space: nowrap;
        text-shadow: 0 2px 6px #000;
      }
      .device-type {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #8199af;
      }
    `,
  ],
})
export class DeviceNode {
  readonly device = input.required<NetworkDevice>();
  readonly active = input(false);
  readonly opened = output<NetworkDevice>();
  readonly highlighted = output<string | null>();
  constructor(private motion: MotionService) {}
  interact(event: Event, on: boolean) {
    this.motion.hover(event.currentTarget as HTMLElement, on);
    this.highlighted.emit(on ? this.device().id : null);
  }
}
