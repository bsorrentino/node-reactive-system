## Experiment on developing a message bus in nodejs

Idea is to develop a **Message Bus** as core of simple a flexible **Module Based System** to develop complex and scalable backend services.

Currently we are evaluating as **message bus back-bone** to use:
* [EventEmitter](https://nodejs.org/docs/latest-v12.x/api/events.html)
* [RxJS](https://rxjs-dev.firebaseapp.com/guide/overview) 


### Getting Started

1. Ensure to have **nodejs** version `>=12.x`
1. install base dependencies
    ```
    npm install
    ```
1. prepare lerna project
    ```
    npx lerna clean
    npx lerna bootstap
    ```
1. build packages
    ```
    npx lerna run build
    ```
1. start sample
    ```
    npx lerna run start --scope=rxbus-sample --stream
    ```

### Samples

In package `rxbus-sample` there is an example how to work, below a code snippet extract from there

```typescript

import { Bus } from '@soulsoftware/rxbus'
import { Module as FastifyModule } from '@soulsoftware/rxbus-fastify'
import { Module as TimerModule } from '@soulsoftware/rxbus-timer'
import { Module as TraceModule } from '@soulsoftware/rxbus-trace'

function main() {

    console.log( 'start' )

    Bus.modules.registerModule( TraceModule )
    Bus.modules.registerModule( TimerModule )
    Bus.modules.registerModule( FastifyModule )

    for( let module of Bus.channels.channelNames ) {
        console.log( module, 'registerd' )
    }
    Bus.modules.start()


}

main()

```