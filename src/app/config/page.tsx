"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Form } from "react-bootstrap";

import TopNavi from "../../components/TopNavi";

const Page = () => {
  let mqserv: string = "",
    mqtopic: string = "";
  if (typeof window !== "undefined") {
    mqserv = localStorage.getItem("mqtt_server") || "";
    mqtopic = localStorage.getItem("mqtt_topic") || "";
  }
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
                <Table border={4} data-bs-theme="light" size="md">
                  <thead>
                    <tr>
                      <td>Setting Key</td>
                      <td>Value</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>MQTT Broker</td>
                      <td>
                        <Form.Control
                          defaultValue={mqserv}
                          type="plaintext"
                          id="mqserv"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Topic</td>
                      <td>
                        <Form.Control
                          id="mqtopic"
                          defaultValue={mqtopic}
                        ></Form.Control>
                      </td>
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
                      document.getElementById("mqserv").value
                    );
                    localStorage.setItem(
                      "mqtt_topic",
                      document.getElementById("mqtopic").value
                    );
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
