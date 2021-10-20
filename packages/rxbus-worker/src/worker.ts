import * as bus from '@bsorrentino/bus-core'
import * as rxbus from '@bsorrentino/rxbus'
import {Worker, isMainThread, parentPort} from 'worker_threads'
import { PerformanceObserver, performance } from 'perf_hooks'

/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {

}

/**
 *  Run    = 'worker_run'
 */
export const Subjects = {
   Run: 'worker_run'
}

class WorkerModule implements bus.Module<Config> {

    readonly name = 'WORKER'

    private _worker?:Worker

    onRegister(config?: Config) {
    }

    onStart() {
        if( isMainThread ) {
            
            console.log( 'Thread Worker file:', __filename)

            // this._worker = new Worker( './node_modules/@bsorrentino/rxbus-worker/lib/worker.js', {})
            this._worker = new Worker( __filename, {})
            
            const { observable, subject } = 
                rxbus.workerChannel<number,{input:any,waitTime:number}>( this._worker ) 

            observable.subscribe( {
                next:( v => console.log('worker event', v) )
            })

            rxbus.observe(this.name, Subjects.Run).subscribe( {
                next:( v => subject.next( v.data as number ) )
            })    

        }
        else {
            
            const noop = () => {} 

            const entryName = 'long for time'

            parentPort?.on( 'message', input => {
                
                const obs = new PerformanceObserver( list => {

                    const elapsed = list.getEntriesByName(entryName)[0].duration

                    parentPort?.postMessage( { data: {input:input.data, waitTime:elapsed} } )

                    performance.clearMarks();
                })
                obs.observe( { entryTypes: ['measure'] })

                performance.mark('A')
                
                for( let i = 0 ; i < 1000 * 1000 * 1000 ; ++i) 
                    noop();

                performance.mark('B')
                performance.measure( entryName, 'A', 'B')

                obs.disconnect()
            })

            parentPort?.on( 'close', () => {
                // send close message
            })

        }
    }

    onStop() {

        this._worker?.terminate()
    }
}

const _module = new WorkerModule()

export const Module = _module

if( !isMainThread ) {

    // console.trace( '====> START WORKER <===')
    try {
        _module.onStart()
    }
    catch( e ) {
        console.error( 'error invoking worker thread', e)
    }
}