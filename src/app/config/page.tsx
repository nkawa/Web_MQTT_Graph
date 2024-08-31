"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button } from "react-bootstrap";

import TopNavi from "../../components/TopNavi";

const Page = () => {
  const mqserv = localStorage.getItem("mqtt_server");
  const mqtopic = localStorage.getItem("mqtt_topic");
  useEffect(() => {}, []); // 空の配列を渡すことで、初回レンダリング時のみ実行されます

  return (
    <div>
      <TopNavi />

      <div>
        <div>
          <Container>
            <Row>
              {" "}
              <Col>Config</Col>
            </Row>
            <Row>
              {" "}
              <Col>
                <Table border={4} data-bs-theme="light" stripped size="md">
                  <thead>
                    <tr>
                      <td>Setting Key</td>
                      <td>Value</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>MQTT Broker</td>
                      <td>{mqserv}</td>
                    </tr>
                    <tr>
                      <td>Topic</td>
                      <td>{mqtopic}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            <Row>
              <Col>
                <Button
                  variant="primary"
                  onClick={() => {
                    localStorage.setItem(
                      "mqtt_server",
                      "wss://sora2.uclab.jp/mqws"
                    );
                    localStorage.setItem("mqtt_topic", "lss4dof/state");
                  }}
                >
                  Set Config
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Page;
