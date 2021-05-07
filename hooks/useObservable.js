import { useEffect, useState } from 'react';
import { skip } from 'rxjs/operators';

export function useObservable(observableLike, options = {}) {
  let { initialState } = options;

  let observable;

  if (typeof observableLike.value !== 'undefined') {
    if (typeof initialState === 'undefined') {
      initialState = observableLike.value;
    }

    observable = observableLike.pipe(skip(1));
  } else {
    observable = observableLike;
  }

  const [result, setState] = useState(initialState || null);

  useEffect(() => {
    const subscription = observable.subscribe((value) => setState(value));

    return () => {
      subscription.unsubscribe();
    };
  }, [observableLike]);

  return result;
}
