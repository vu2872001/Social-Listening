import { Router } from 'react-router-dom';
import { useRef, useState, useLayoutEffect } from 'react';
import { createBrowserHistory } from 'history';

// Can be used to manage navigation state outside of React components
// ex : Redux, Axios interceptors, ...
export const customHistory = createBrowserHistory();

export function CustomBrowserRouter({ basename, children }) {
  const historyRef = useRef();
  if (historyRef.current == null) {
    historyRef.current = customHistory;
  }
  const history = historyRef.current;
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  });

  useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
}
