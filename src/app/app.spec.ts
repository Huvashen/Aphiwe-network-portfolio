import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
describe('App', () => {
  it('renders the router outlet', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    const f = TestBed.createComponent(App);
    f.detectChanges();
    expect(f.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
