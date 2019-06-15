import S, { DataSignal } from 's-js';
import { App, assignApp, createApp, jsonable, Plain } from '../main';

export interface DemoApp extends App {
  readonly zoom: DataSignal<number>;
}

export function createDemoApp(): DemoApp {
  return {
    ...createApp(),
    zoom: jsonable(S.value(0)),
  };
}

export function assignDemoApp(demoApp: DemoApp, plain: Plain<DemoApp>) {
  S.freeze(() => {
    assignApp(demoApp, plain);
    demoApp.zoom(plain.zoom);
  });
}
