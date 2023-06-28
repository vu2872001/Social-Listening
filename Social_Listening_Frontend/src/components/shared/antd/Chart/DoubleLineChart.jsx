import { DualAxes } from '@ant-design/plots';

export default function DoubleLineChart(props) {
  const { lineChartData = [], xConfig, yConfig, ...other } = props;

  let largestValue = 0;
  lineChartData?.forEach((item) => {
    Object.values(item)?.map((obj) => {
      if (typeof obj === 'number') {
        if (obj > largestValue) {
          largestValue = obj;
        }
      }
    });
  });

  const config = {
    data: [lineChartData, lineChartData],
    xField: xConfig,
    yField: yConfig,
    geometryOptions: [
      {
        geometry: 'line',
        smooth: true,
        color: '#4096ff',
      },
      {
        geometry: 'line',
        color: '#28a745',
        smooth: true,
      },
    ],
    legend: {
      position: 'top-right',
    },
    yAxis: [
      { nice: true, max: largestValue },
      { nice: true, max: largestValue, visible: false },
    ],
  };
  return <DualAxes {...config} {...other} />;
}
