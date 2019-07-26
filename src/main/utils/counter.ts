import S, { DataSignal } from 's-js';

/**
 * Counter of data signals that carry `true`.
 *
 * This class implements a counter that is updated in runtime O(1) whenever a signal changes.
 */
export class Counter {
  private readonly signalToDisposeFnMap_: Map<() => boolean, () => void> = new Map();
  private readonly countChangedSignal_: DataSignal<null> = S.data(null);
  private numTrueSignals_: number = 0;

  /**
   * Constructor.
   *
   * @param count Signal that will be carry the number of `true` signals observed by this counter.
   */
  public constructor(
      count: DataSignal<number>
  ) {
    // 'seed' is undefined (the calculation does not keep a state), and 'onchanges' is false (do the initial run).
    S.on(this.countChangedSignal_, () => count(this.numTrueSignals_), undefined, false);
  }

  /**
   * Adds a signal to the counter.
   *
   * @throws Error if the given signal has been added before
   */
  public add(signal: () => boolean): void {
    if (this.signalToDisposeFnMap_.has(signal)) {
      throw new Error('Counter.add() called more than once for same signal.');
    }
    this.signalToDisposeFnMap_.set(signal, S.root((disposeFn) => {
      let didAddToCounter: boolean = false;
      // 'seed' is undefined (the calculation does not keep a state), and 'onchanges' is false (do the initial run).
      S.on(signal, () => {
        const isCurrentlyTrue: boolean = S.sample(signal);
        if (isCurrentlyTrue && !didAddToCounter) {
          ++this.numTrueSignals_;
          this.countChangedSignal_(null);
        } else if (!isCurrentlyTrue && didAddToCounter) {
          --this.numTrueSignals_;
          this.countChangedSignal_(null);
        }
        didAddToCounter = isCurrentlyTrue;
      }, undefined, false);
      return disposeFn;
    }));
  }

  /**
   * Removes a signal from the counter.
   *
   * @throws Error if the given signal has not previously beend added with {@link add}()
   */
  public delete(signal: () => boolean): void {
    const disposeFn = this.signalToDisposeFnMap_.get(signal);
    if (disposeFn === undefined) {
      throw new Error('Counter.delete() called without a corresponding prior add() call.');
    }
    if (S.sample(signal)) {
      --this.numTrueSignals_;
      this.countChangedSignal_(null);
    }
    disposeFn();
    this.signalToDisposeFnMap_.delete(signal);
  }
}
