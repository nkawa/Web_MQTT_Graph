import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  elements,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = (props) => {
  const { data, title, style, fixAspect, ratio, redraw } = props;
  const options = {
    responsive: true,
    //    maitainAspectRatio: fixAspect,
    aspectRatio: ratio,
    plugins: {
      legend: {
        position: "chartArea",
      },
      title: {
        position: "left",
        display: true,
        text: title,
      },
    },
    elements: {
      point: {
        radius: 1,
      },
      line: {
        borderWidth: 1,
      },
    },
  };

  return <Line options={options} data={data} style={style} redraw={redraw} />;
};

export default LineChart;
