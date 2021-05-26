
import { isMainThread, parentPort } from 'worker_threads'

console.log( 'isMainThread: ', isMainThread  )

function getRandomInt(max:number) {
    return Math.floor(Math.random() * max);
  }
  
async function stall(stallTime = 5000) {
    await new Promise(resolve => setTimeout(resolve, stallTime));
}

parentPort?.on( 'message', async input => {


    const waitTime = (getRandomInt(Math.ceil(input.data%30))+1) * 1000 
    await stall( waitTime )
    // console.log( 'worker result:', input  )

    parentPort?.postMessage( { data: {input:input.data, waitTime:waitTime} } )
})