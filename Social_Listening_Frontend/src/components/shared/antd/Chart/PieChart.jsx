import { Pie } from '@ant-design/plots';

export default function PieChart(props) {
  const { pieData = [], pieConfig, ...other } = props;

  const config = {
    data: pieData,
    appendPadding: 10,
    legend: true,
    angleField: 'value',
    colorField: 'type',
    radius: 0.75,
    color: ['#28a745', '#da4c3b'],
    label: {
      type: 'spider',
      labelHeight: 40,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    ...pieConfig,
  };

  return <Pie {...config} {...other} />;
}
