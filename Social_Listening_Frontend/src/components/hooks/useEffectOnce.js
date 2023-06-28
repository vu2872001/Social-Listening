import { useEffect } from 'react';

export default function useEffectOnce(cb, destroy = null) {
  useEffect(() => {
    let onDestroy = false;
    if (!onDestroy) {
      return cb();
    }
    return () => {
      if (destroy !== null) destroy();
      onDestroy = true;
    };
  }, []);
}
