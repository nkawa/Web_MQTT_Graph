"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

import TopNavi from "../components/TopNavi";

import storageAvailable from "../lib/StorageCheck";

var hasRun: boolean = false;

const Page = () => {
  // ページが開いたら１回だけ実行される処理
  const doit = () => {
    if (storageAvailable("localStorage")) {
      const mqserv = localStorage.getItem("mqtt_server");
      const mqtopic = localStorage.getItem("mqtt_topic");
      if (!mqserv) {
        localStorage.setItem("mqtt_server", "wss://sora2.uclab.jp/mqws");
      }
      if (!mqtopic) {
        localStorage.setItem("mqtt_topic", "lss4dof/state");
      }
    }
    //    connectSora();
  };

  useEffect(() => {
    // ページが開かれた時に実行される関数
    if (!hasRun) {
      hasRun = true;
      //      console.log("doit!");
      doit();
    }
  }, []); // 空の配列を渡すことで、初回レンダリング時のみ実行されます

  return (
    <div>
      <TopNavi />

      <div>
        <div>
          <Container>
            <h3>Web_MQTT_Graph for Viewing Robotic arm info</h3>
            <Row>
              <Col>
                <h4>Web_MQTT_Graph for debug.</h4>
                Please check "RobotsSite menu"
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Page;
