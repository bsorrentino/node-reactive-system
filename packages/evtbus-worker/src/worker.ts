import * as bus from '@bsorrentino/bus-core'
import * as evtbus from '@bsorrentino/evtbus'
import {Worker, isMainThread, parentPort} from 'worker_threads'
import { PerformanceObserver, performance } from 'node:perf_hooks'
import * as logger from '@bsorrentino/bus-logger'
import { style } from '@bsorrentino/bus-logger'

/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {

}

const log = logger.getLogger( 'WORKER' )

class WorkerModule implements bus.Module<Config> {

    readonly name = 'WORKER'

    #worker:Worker|null = null

    get worker() { return  this.#worker }


    onRegister(config?: Config) {
    }


    onStart() {
        if( isMainThread ) {
            // Load Worker
            log.info( 'Thread Worker file:', __filename)

            this.#worker = new Worker( __filename, {})            

        }
        else {
            log.trace( 'START WORKER')

            const noop = () => {} 

            const entryName = 'long for time'

            parentPort?.on( 'message', input => {
                
                log.trace( `message: ${input}`)
                
                const obs = new PerformanceObserver( entries => {

                    log.trace( `post message: `, entries)

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
                log.error( 'worker', error)
            })
            parentPort?.on( 'close', () => {
                // send close message
                log.info( 'worker close')
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
        log.error( 'error invoking worker thread', e)
    }
}