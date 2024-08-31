"use client";
import mqtt from 'mqtt';

export var mqttclient = null;

export const connectMQTT = (server,name, connectCallback) => {
    if (mqttclient == null) {
        const client = new mqtt.connect(server, {
            protocolVersion: 4,  // MQTT v3.1.1
            keepalive: 120,
            reconnectPeriod: 2000,
        });
        client.on("connect", () => {
            console.log("MQTT Connected", this);
            const msg = JSON.stringify({ myID: name, type: "LSS" });
            client.publish("clients", msg);
            console.log("Sending My clientID", msg);
            mqttclient = client

            if (connectCallback != undefined) {
                connectCallback()
            }
        });
        client.on("reconnect", () => {
            console.log("MQTT Reconnected");
            mqttclient = client;
        });
        client.on("close", () => {
            console.log("MQTT Closed");
            mqttclient = null;
        });
        client.on("offline", () => {
            console.log("MQTT Offline");
        });
        client.on("error", () => {
            console.log("MQTT Error");
        });
        client.on("disconnect", () => { // only for MQTT 5.0
            console.log("MQTT disconnect");
        });
    }
    return mqttclient
}

export const subscribe = (topic, callback) => {
    console.log("SubScribe topic!", topic, callback)
    if (mqttclient != null) {
        mqttclient.subscribe(topic, { qos: 0 }, function (error, granted) {
            if (error) {
                console.log("subscribe error on", topic)
            } else {
                console.log(`Granted ${granted}`)
                //    console.log(`Granted ${granted[0].topic}`)
                mqttclient.on("message", (tpc, payload, packet) => {
                    if (topic == tpc) {
                        callback(JSON.parse(payload.toString()))
                    }
                });
            }
        });
    } else {
        console.log("MQTT not connected but try to subscribe")
    }
}