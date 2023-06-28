import { Modal } from 'antd';
import PieChart from './PieChart';
import './pie.scss';

export default function PieChartResult(props) {
  const { open, toggleOpen, title, result } = props;

  const data = [
    {
      type: 'Success',
      value: result?.success,
    },
    {
      type: 'Fail',
      value: result?.fail,
    },
  ];

  return (
    <Modal
      destroyOnClose
      open={open}
      title={title}
      footer={null}
      maskClosable={false}
      onCancel={() => {
        toggleOpen(false);
      }}
    >
      <PieChart pieData={data} />
      <div className="pie-footer">
        <span>
          Total result:{' '}
          {result?.total ?? result?.success + result?.fail}
        </span>
        <span>Total success: {result?.success}</span>
        <span>Total fail: {result?.fail}</span>
      </div>
    </Modal>
  );
}
