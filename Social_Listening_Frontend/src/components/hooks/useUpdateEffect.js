import { useEffect, useRef } from 'react';

export default function useUpdateEffect(
  callback,
  dependencies,
  destroy = null
) {
  const firstRenderRef = useRef(true);

  useEffect(() => {
    let onDestroy = false;
    if (!onDestroy) {
      if (firstRenderRef.current) {
        firstRenderRef.current = false;
        return;
      }
      return callback();
    }
    return () => {
      if (destroy !== null) destroy();
      onDestroy = true;
    };
  }, dependencies);
}
