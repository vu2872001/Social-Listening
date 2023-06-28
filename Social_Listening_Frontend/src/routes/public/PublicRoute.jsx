import { Outlet } from 'react-router-dom';

export default function PublicRoute() {
  return (
    <div className="public-layout">
      <div className="layer-wrapper">
        <div className="layer-primary"></div>
        <div className="layer-dark"></div>
      </div>
      <div className="outlet-wrapper absolute-center">
        <Outlet />
      </div>
    </div>
  );
}
