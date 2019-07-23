import { SDataArray } from 's-array';
import S, { DataSignal } from 's-js';
import Sortable from 'sortablejs';

/**
 * One-way binds the given data-signal array to react to UI changes in the given HTML element (note the currying).
 */
export function sortableBindSarray<T>(sArray: SDataArray<T>, sortableOptions?: {[name: string]: any}):
    (element: HTMLElement) => void {
  return (element) => {
    // noinspection JSUnusedGlobalSymbols
    Sortable.create(element, {
      ...sortableOptions,
      onEnd: (event: Sortable.SortableEvent) => {
        // It's unclear whether oldIndex or newIndex are ever undefined. However, this is the current type declaration
        // in @types/sortablejs.
        if (event.oldIndex === undefined || event.newIndex === undefined || event.newIndex === event.oldIndex) {
          return;
        }
        const from: number = event.oldIndex;
        const to: number = event.newIndex;
        S.freeze(() => {
          const item: T = sArray()[from];
          sArray.splice(from, 1);
          sArray.splice(to, 0, item);
        });
      },
    });
  };
}

/**
 * Two-way binds the given `number` data signal with the given `<input>` element (note the currying).
 */
export function bindNumber(signal: DataSignal<number>): (element: HTMLInputElement) => void {
  return (element) => {
    let currentlyUpdatingSignal = false;
    S(() => {
      const newValue: number = signal();
      if (!currentlyUpdatingSignal) {
        element.valueAsNumber = newValue;
      }
    });

    const event = 'input';
    element.addEventListener(event, valueListener, false);
    S.cleanup(() => element.removeEventListener(event, valueListener));

    function valueListener(): void {
      const current: number = S.sample(signal);
      const updated: number = element.valueAsNumber;
      if (current !== updated) {
        currentlyUpdatingSignal = true;
        try {
          signal(updated);
        } finally {
          currentlyUpdatingSignal = false;
        }
      }
    }
  };
}

/**
 * Two-way binds the given `string` data signal with the given `<input>` element (note the currying).
 */
export function bindString(signal: DataSignal<string>): (element: HTMLInputElement | HTMLSelectElement) => void {
  return (element) => {
    let currentlyUpdatingSignal = false;
    S(() => {
      // Call signal() outside of if-block, so the dependency on the signal is never lost.
      const newValue: string = signal();

      // Don't set value as a response of an 'input' event. It doesn't just feel wrong, in Safari 12 (for example) it
      // also moves the cursor to the end of the input field.
      if (!currentlyUpdatingSignal) {
        element.value = newValue;
      }
    });

    const event = 'input';
    element.addEventListener(event, valueListener, false);
    S.cleanup(() => element.removeEventListener(event, valueListener));

    function valueListener(): void {
      const current: string = S.sample(signal);
      const updated: string = element.value;
      if (current !== updated) {
        currentlyUpdatingSignal = true;
        // Try-block for defensive programming.
        try {
          signal(updated);
        } finally {
          currentlyUpdatingSignal = false;
        }
      }
    }
  };
}

/**
 * Two-way binds the given data signal with the given `input` element (note the currying): The element is checked if
 * and only if the data signal has the given “on”-value.
 */
export function bindToOnValue<T>(signal: DataSignal<T>, onValue: T): (element: HTMLInputElement) => void {
  return (element) => {
    let currentlyUpdatingSignal = false;
    S(() => {
      const newValue: T = signal();
      if (!currentlyUpdatingSignal) {
        element.checked = newValue === onValue;
      }
    });

    const event = 'change';
    element.addEventListener(event, radioListener, false);
    S.cleanup(() => element.removeEventListener(event, radioListener));

    function radioListener(): void {
      if (element.checked) {
        currentlyUpdatingSignal = true;
        try {
          signal(onValue);
        } finally {
          currentlyUpdatingSignal = false;
        }
      }
    }
  };
}

/**
 * Two-way binds the given data signal with the given 'multiple' `<select>` element (note the currying).
 */
export function bindStringSet(signal: DataSignal<Set<string>>): (element: HTMLSelectElement) => void {
  return (element) => {
    let currentlyUpdatingSignal = false;
    S(() => {
      const activeOptions: Set<string> = signal();
      if (!currentlyUpdatingSignal) {
        for (const option of element.options) {
          option.selected = activeOptions.has(option.value);
        }
      }
    });
    const event = 'input';
    element.addEventListener(event, valueListener, false);
    S.cleanup(() => element.removeEventListener(event, valueListener));

    function valueListener(): void {
      const current: Set<string> = S.sample(signal);
      const updated: Set<string> = toSet();
      if (!setEquals(current, updated)) {
        currentlyUpdatingSignal = true;
        try {
          signal(updated);
        } finally {
          currentlyUpdatingSignal = false;
        }
      }
    }

    function toSet(): Set<string> {
      return Array.from(element.options)
          .filter((option) => option.selected)
          .reduce((set, option) => set.add(option.value), new Set<string>());
    }
  };
}

function setEquals<T>(left: Set<T>, right: Set<T>): boolean {
  if (left.size !== right.size) {
    return false;
  }
  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }
  return true;
}

/**
 * One-way binds the presence of CSS classes on the given HTML element to react to the given signal (note the currying).
 */
export function withClassIff(signal: () => boolean, ...classes: string[]): (element: HTMLElement) => void {
  return (element) => {
    // The typical use of this function is to add an attribute of form 'fn={withClassIf(booleanSignal)}' to the HTML
    // (or SVG) element in JSX. Surplus already wraps each computation in an S.js computation. Hence, it is not
    // necessary (for the intended effect) to wrap the following in another S.js lambda. However, by doing so we can
    // restrict the scope of what is re-executed if the signal changes. Without the S.js lambda here, the entire
    // computation in the fn attribute would be re-executed (which would include running this function).
    S(() => {
      if (signal()) {
        element.classList.add(...classes);
      } else {
        element.classList.remove(...classes);
      }
    });
  };
}

/**
 * If the given signal is changed to the given value, focus on the given HTML element.
 */
export function focusOnChangeToValue<T>(signal: () => T, value: T): (element: HTMLElement) => void {
  return (element) => {
    let previousValue: T = S.sample(signal);
    S(() => {
      const newValue: T = signal();
      if (newValue !== previousValue && newValue === value) {
        // We cannot focus immediately, because the input may still be hidden (the order in which S.js invokes the
        // computations is undefined). We therefore need to await the end of the S.js transaction!
        setTimeout(() => element.focus());
      }
      previousValue = newValue;
    });
  };
}

/**
 * One-way binds the href attribute to react to the given signal.
 *
 * This function is necessary because we want to remove the href attribute if the given signal is the empty URL (as
 * opposed to setting the href attribute to the empty string, which would still be shown as a link in the browser).
 */
export function hrefFrom(signal: () => string): (element: HTMLAnchorElement) => void {
  return (element) => {
    S(() => {
      const url: string = signal();
      if (url.length === 0) {
        element.removeAttribute('href');
      } else {
        element.setAttribute('href', url);
      }
    });
  };
}
