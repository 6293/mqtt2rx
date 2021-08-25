import { connect, MqttClient, IClientOptions } from 'mqtt';
import { filter, mergeWith, takeWhile, fromEvent, Observable, Subject } from 'rxjs'

export default class MqttSubject extends Subject<any> {
    private c: MqttClient
    onMessage: Observable<unknown>
    onUnsubscribe: Subject<string>
    constructor(brokerUrl: string, opts?: IClientOptions) {
        super()
        this.c = connect(brokerUrl, opts)
        this.onMessage = fromEvent(this.c, 'message')
        this.onMessage.subscribe(this)
        this.onUnsubscribe = new Subject()
    }

    sub(topic: string) {
        this.c.subscribe(topic)
        const unsubNotifier = this.onUnsubscribe.pipe(filter(t => t === topic))
        return this.pipe(mergeWith(unsubNotifier), takeWhile(x => x !== topic), filter(([t, m]) => t === topic))
    }

    unsub(topic: string) {
        this.onUnsubscribe.next(topic)
        this.c.unsubscribe(topic)
    }

    pub(topic: string, message: string | Buffer) {
        this.c.publish(topic, message)
    }

    end() {
        this.c.end()
    }
}
