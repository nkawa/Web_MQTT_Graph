"use client";
import React, { useEffect, useState, useRef } from "react";
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
import { getMaxListeners } from "events";

const Page = () => {
  let mqserv, mqtopic;
  const mqCon = useRef(false);
  if (typeof window !== "undefined") {
    mqserv = localStorage.getItem("mqtt_server");
    mqtopic = localStorage.getItem("mqtt_topic");
  }
  const [startTime, setStartTime] = useState(Date.now());
  // 最後の角度データ, 差分データ
  const [rotData, setRotData] = useState([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);
  const [gmax, setGmax] = useState(500);
  const [fixAspect, setFixAspect] = useState(true);
  const [ratio, setRatio] = useState(4);
  const [redraw, setRedraw] = useState(false);
  const serot = useRef([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const nrot = useRef();

  const [chartData, setChartData] = useState([
    {
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
    },
    {
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
    },
    {
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
    },
  ]);
  const handleRot = (rot: any) => {
    const delta = Date.now() - startTime;
    nrot.current = rot;
    //    console.log("nRot:", nrot);
    const pRot = serot.current || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    if (nrot.current.length < 6) {
      console.log("None rot!", nrot.current, pRot, nrot);
      return pRot;
    }
    const count = pRot[12];
    //    console.log("pRot:", pRot, "rot", nrot.current, "count", count);
    // まず、微分データ、2階微分データを計算
    const ndrv = [[...rot], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
    for (let i = 0; i < 6; i++) {
      ndrv[1][i] = rot[i] - pRot[i];
      ndrv[2][i] = ndrv[1][i] - pRot[i + 6];
    }

    setChartData((prevData) => {
      const ndata = [{}, {}, {}];
      const labels = prevData[0].labels;
      if (prevData[0].datasets[0].data.length > gmax) {
        for (let j = 0; j < 3; j++) {
          for (let i = 0; i < 6; i++) {
            prevData[j].datasets[i].data.shift();
          }
        }
        labels.shift();
      }
      const newLabels = [...labels, delta];
      for (let j = 0; j < 3; j++) {
        const newdatas = [{}, {}, {}, {}, {}];
        for (let i = 0; i < 6; i++) {
          newdatas[i] = {
            ...prevData[j].datasets[i],
            data: [...prevData[j].datasets[i].data, ndrv[j][i]],
          };
        }
        ndata[j] = {
          labels: newLabels,
          datasets: newdatas,
        };
      }
      return ndata;
    });
    const setrot = [...rot.splice(0, 6), ...ndrv[1], count + 1];
    console.log("SetRot", setrot);
    serot.current = setrot;
  };

  // MQTT message handler
  const handleMsg = (payload) => {
    // 本来は、いろいろなデータ形式を確認すべき
    if (payload.rotate !== "undefined") {
      //      console.log("Rotate:", payload.rotate);
      //const rot = payload.rotate;
      const rot = [...payload.rotate, 0];
      //      console.log("DoRot", rot);
      handleRot(rot);
    } else if (payload.j1 !== "undefined") {
      const rot = [
        payload.j1,
        payload.j2,
        payload.j3,
        payload.j4,
        payload.j5,
        payload.j6,
      ];
      console.log(rot);
      handleRot(rot);
    }
  };

  // connect MQTT
  useEffect(() => {
    if (mqCon.current) return;
    mqCon.current = true;
    connectMQTT(mqserv, "MQGraph", () => {
      subscribe(mqtopic, handleMsg);
    });
  }, []);

  const destroyCharts = () => {
    console.log("Destroy!", redraw);
    setRedraw(true);
  };

  useEffect(() => {
    setRedraw(false);
  }, [redraw]);

  return (
    <div>
      <TopNavi />
      <div>
        <div>
          <Container>
            <Row>
              <Col>
                <Form.Label>GraphLength</Form.Label>
                {"   :" + gmax}
                {/*} + "         fixAspect: "}
                <input
                  className="form-check-input"
                  type="checkbox"
                  onClick={() => {
                    setFixAspect((v) => {
                      console.log("Fix:", v);
                      destroyCharts();
                      return !v;
                    });
                  }}
                />*/}
                {"  　 "}Ratio:
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={ratio}
                  onChange={(e) => {
                    setRatio(e.target.value);
                    destroyCharts();
                  }}
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
                  redraw={redraw}
                  data={chartData[0]}
                  title="RawAngle"
                  ratio={ratio}
                />
              </Col>
            </Row>
            <Row>
              <Col style={{ height: "40vh" }}>
                <LineChart
                  redraw={redraw}
                  data={chartData[1]}
                  title="Velocity"
                  ratio={ratio}
                />
              </Col>
            </Row>
            <Row>
              <Col style={{ height: "40vh" }}>
                <LineChart
                  redraw={redraw}
                  data={chartData[2]}
                  title="Accel"
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
