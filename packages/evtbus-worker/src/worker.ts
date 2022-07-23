import * as bus from '@bsorrentino/bus-core'
import * as evtbus from '@bsorrentino/evtbus'
import {Worker, isMainThread, parentPort} from 'worker_threads'
import { PerformanceObserver, performance } from 'node:perf_hooks'

/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {

}


class WorkerModule implements bus.Module<Config> {

    readonly name = 'WORKER'

    #worker:Worker|null = null

    get worker() { return  this.#worker }


    onRegister(config?: Config) {
    }


    onStart() {
        if( isMainThread ) {
            // Load Worker
            console.log( 'Thread Worker file:', __filename)

            this.#worker = new Worker( __filename, {})            

        }
        else {
            // console.log( '====> START WORKER <===')

            const noop = () => {} 

            const entryName = 'long for time'

            parentPort?.on( 'message', input => {
                
                // console.log( 'worker', `message: ${input}`)
                
                const obs = new PerformanceObserver( entries => {

                    // console.log( 'worker', `post message: `, entries)

                    const entry = entries.getEntriesByName(entryName)

                    if( entry && entry.length > 0 ) {

                        const elapsed = entry[0].duration

                        parentPort?.postMessage( { data: {input:input.data, waitTime:elapsed} } )
       
                    }

                    performance.clearMarks(entryName);

                    obs.disconnect()
                })

                obs.observe( { entryTypes: ['measure'] })

                performance.mark('A')
                
                for( let i = 0 ; i < 1000 * 1000 * 1000 ; ++i) 
                    noop();

                performance.mark('B')
                performance.measure( entryName, 'A', 'B')

                
                
            })

            parentPort?.on( 'error', ( error ) => {
                // send close message
                console.error( 'worker', error)
            })
            parentPort?.on( 'close', () => {
                // send close message
                console.log( 'worker close')
            })

        }
    }

    onStop() {

        this.#worker?.terminate()
        this.#worker = null
    }
}

const _module = new WorkerModule()

export const Module = _module

if( !isMainThread ) {

    try {
        _module.onStart()
    }
    catch( e ) {
        console.error( 'error invoking worker thread', e)
    }
}