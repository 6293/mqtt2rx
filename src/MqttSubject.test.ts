import MqttSubject from './MqttSubject';
import { createServer } from 'net';

const aedes = require('aedes')()

const MQTT_PORT = 1883;

test('Basic', async () => {
    const server = createServer(aedes.handle)
    server.listen(MQTT_PORT, function () {
        console.log('server started and listening on port ', MQTT_PORT)
      })
    const s = new MqttSubject('mqtt://localhost', {port: MQTT_PORT})
    const topic = s.sub('t1')
    const msg = 'hi'
    const ctrEvent = jest.fn().mockResolvedValue(true)
    const ctrCompletion = jest.fn().mockResolvedValue(true)
    const observer = {
        next: (x: any) => {ctrEvent(), expect(x[1].toString()).toBe(msg)},
        error: (e: any) => {},
        complete: () => {ctrCompletion()}
    }
    topic.subscribe(observer),
    s.pub('t1', msg)
    await sleep(500)
    s.unsub('t1')
    await sleep(500)
    s.end()
    aedes.close()
    server.close()
    expect(ctrEvent).toHaveBeenCalledTimes(1)
    expect(ctrCompletion).toHaveBeenCalledTimes(1)
});

function sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms))
  }