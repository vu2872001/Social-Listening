import LoadingWrapper from '../antd/LoadingWrapper';
import './element.scss';

export default function LoadingFallback() {
  return (
    <div className="full-height-screen flex-center">
      <LoadingWrapper id="loading-fallback" />
    </div>
  );
}
