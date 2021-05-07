
import { isMainThread, parentPort } from 'worker_threads'

console.log( 'isMainThread: ', isMainThread  )

function getRandomInt(max:number) {
    return Math.floor(Math.random() * max);
  }
  
async function stall(stallTime = 5000) {
    await new Promise(resolve => setTimeout(resolve, stallTime));
}

parentPort?.on( 'message', async input => {

    await stall( getRandomInt(30) * 1000 )
    // console.log( 'worker result:', input  )

    parentPort?.postMessage( input )
})