import SaveButton from '../../../../../../components/shared/element/Button/SaveButton';
import ExitButton from '../../../../../../components/shared/element/Button/ExitButton';

export default function BotflowNav(props) {
  const { flowDetail, updateFlow, loadingUpdate, exit } = props;

  return (
    <div className="flow-nav flex-center">
      <div className="flow-name">Name: {flowDetail?.name}</div>
      <div className="flow-utils flex-center">
        <SaveButton loading={loadingUpdate} onClick={updateFlow} />
        <ExitButton disabled={loadingUpdate} onClick={exit} />
      </div>
    </div>
  );
}
