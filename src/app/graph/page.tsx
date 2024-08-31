"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";

import TopNavi from "../../components/TopNavi";
import LineChart from "../../components/LineChart";

import { mqttclient, connectMQTT, subscribe } from "../../lib/MQTT.js";

const Page = () => {
  const mqserv = localStorage.getItem("mqtt_server");
  const mqtopic = localStorage.getItem("mqtt_topic");

  const [startTime, setStartTime] = useState(Date.now());

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

  // MQTT message handler
  const handleMsg = (payload) => {
    // 本来は、いろいろなデータ形式を確認すべき
    if (payload.rotate) {
      const rot = payload.rotate;
      setChartData((prevData) => {
        const newdatas = [{}, {}, {}, {}, {}];
        const delta = Date.now() - startTime;
        for (let i = 0; i < 5; i++) {
          newdatas[i] = {
            ...prevData.datasets[i],
            data: [...prevData.datasets[i].data, rot[i]],
          };
        }
        const newLabels = [...prevData.labels, delta];

        return {
          labels: newLabels,
          datasets: newdatas,
        };
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
              {" "}
              <Col>Graph</Col>
            </Row>
            <Row>
              <Col>
                <LineChart
                  data={chartData}
                  title="Graph1"
                  style={{ height: "50vh" }}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <LineChart
                  data={chartData}
                  title="Graph2"
                  style={{ height: "50vh" }}
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
