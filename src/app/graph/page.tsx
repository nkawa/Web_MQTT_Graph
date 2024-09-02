"use client";
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  Ratio,
} from "react-bootstrap";

import TopNavi from "../../components/TopNavi";
import LineChart from "../../components/LineChart";

import { mqttclient, connectMQTT, subscribe } from "../../lib/MQTT.js";
import { Texturina } from "next/font/google";

const Page = () => {
  let mqserv, mqtopic;
  if (typeof window !== "undefined") {
    mqserv = localStorage.getItem("mqtt_server");
    mqtopic = localStorage.getItem("mqtt_topic");
  }
  const [startTime, setStartTime] = useState(Date.now());
  // 最後の角度データ, 差分データ
  const [rotData, setRotData] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [gmax, setGmax] = useState(500);
  const [fixAspect, setFixAspect] = useState(true);
  const [ratio, setRatio] = useState(1);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "j0",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)", // 赤
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "j1",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)", // 青
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "j2",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)", // 緑
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "j3",
        data: [],
        borderColor: "rgba(153, 102, 255, 1)", // 紫
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
      {
        label: "j4",
        data: [],
        borderColor: "rgba(255, 159, 64, 1)", // オレンジ
        backgroundColor: "rgba(255, 159, 64, 0.2)",
      },
      {
        label: "j5",
        data: [],
        borderColor: "rgba(255, 206, 86, 1)", // 黄色
        backgroundColor: "rgba(255, 206, 86, 0.2)",
      },
    ],
  });
  const [difData, setDifData] = useState({
    labels: [],
    datasets: [
      {
        label: "j0",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)", // 赤
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "j1",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)", // 青
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "j2",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)", // 緑
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "j3",
        data: [],
        borderColor: "rgba(153, 102, 255, 1)", // 紫
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
      {
        label: "j4",
        data: [],
        borderColor: "rgba(255, 159, 64, 1)", // オレンジ
        backgroundColor: "rgba(255, 159, 64, 0.2)",
      },
      {
        label: "j5",
        data: [],
        borderColor: "rgba(255, 206, 86, 1)", // 黄色
        backgroundColor: "rgba(255, 206, 86, 0.2)",
      },
    ],
  });

  const [drvData, setDrvData] = useState({
    labels: [],
    datasets: [
      {
        label: "j0",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)", // 赤
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "j1",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)", // 青
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "j2",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)", // 緑
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "j3",
        data: [],
        borderColor: "rgba(153, 102, 255, 1)", // 紫
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
      {
        label: "j4",
        data: [],
        borderColor: "rgba(255, 159, 64, 1)", // オレンジ
        backgroundColor: "rgba(255, 159, 64, 0.2)",
      },
      {
        label: "j5",
        data: [],
        borderColor: "rgba(255, 206, 86, 1)", // 黄色
        backgroundColor: "rgba(255, 206, 86, 0.2)",
      },
    ],
  });
  // MQTT message handler
  const handleMsg = (payload) => {
    // 本来は、いろいろなデータ形式を確認すべき
    if (payload.rotate) {
      const rot = payload.rotate;
      const count = rot[10];
      const delta = Date.now() - startTime;

      setRotData((pRot) => {
        // まず、微分データ、2階微分データを計算
        const drv = [0, 0, 0, 0, 0];
        const dif = [0, 0, 0, 0, 0];
        for (let i = 0; i < 5; i++) {
          dif[i] = rot[i] - pRot[i];
          drv[i] = dif[i] - pRot[i + 5];
        }
        // 微分データ
        setDifData((prevData) => {
          const newdatas = [{}, {}, {}, {}, {}];
          for (let i = 0; i < 5; i++) {
            if (prevData.datasets[i].data.length > gmax) {
              prevData.datasets[i].data.shift();
            }
            newdatas[i] = {
              ...prevData.datasets[i],
              data: [...prevData.datasets[i].data, dif[i]],
            };
          }
          if (prevData.labels.length > gmax) {
            prevData.labels.shift();
          }
          const newLabels = [...prevData.labels, delta];
          return {
            labels: newLabels,
            datasets: newdatas,
          };
        });
        // 2回微分データ
        setDrvData((prevData) => {
          const newdatas = [{}, {}, {}, {}, {}];
          for (let i = 0; i < 5; i++) {
            if (prevData.datasets[i].data.length) {
              prevData.datasets[i].data.shift();
            }
            newdatas[i] = {
              ...prevData.datasets[i],
              data: [...prevData.datasets[i].data, drv[i]],
            };
          }
          if (prevData.labels.length > gmax) {
            prevData.labels.shift();
          }
          const newLabels = [...prevData.labels, delta];
          return {
            labels: newLabels,
            datasets: newdatas,
          };
        });

        setChartData((prevData) => {
          const newdatas = [{}, {}, {}, {}, {}];
          for (let i = 0; i < 5; i++) {
            if (prevData.datasets[i].data.length) {
              prevData.datasets[i].data.shift();
            }
            newdatas[i] = {
              ...prevData.datasets[i],
              data: [...prevData.datasets[i].data, rot[i]],
            };
          }
          if (prevData.labels.length > gmax) {
            prevData.labels.shift();
          }
          const newLabels = [...prevData.labels, delta];
          return {
            labels: newLabels,
            datasets: newdatas,
          };
        });
        return [...rot.splice(0, 5), ...dif, count + 1];
      });
    }
  };

  // connect MQTT
  useEffect(() => {
    connectMQTT(mqserv, "MQGraph", () => {
      subscribe(mqtopic, handleMsg);
    });
  }, []);

  return (
    <div>
      <TopNavi />
      <div>
        <div>
          <Container>
            <Row>
              <Col>
                <Form.Label>GraphLength</Form.Label>
                {"   :" + gmax + "         fixAspect: "}
                <input
                  className="form-check-input"
                  type="checkbox"
                  onClick={() => {
                    setFixAspect((v) => !v);
                  }}
                />
                {"  　 "}Ratio:
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                />
                {":" + ratio}
                <Form.Range
                  min={100}
                  max={2000}
                  value={gmax}
                  onChange={(evt) => setGmax(evt.target.value)}
                />
              </Col>
            </Row>
            <Row>
              <Col style={{ height: "40vh" }}>
                <LineChart
                  data={chartData}
                  title="RawAngle"
                  fixAspect={fixAspect}
                  ratio={ratio}
                />
              </Col>
            </Row>
            <Row>
              <Col style={{ height: "40vh" }}>
                <LineChart
                  data={difData}
                  title="Velocity"
                  fixAspect={fixAspect}
                  ratio={ratio}
                />
              </Col>
            </Row>
            <Row>
              <Col style={{ height: "40vh" }}>
                <LineChart
                  data={drvData}
                  title="Accel"
                  fixAspect={fixAspect}
                  ratio={ratio}
                />
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Page;
