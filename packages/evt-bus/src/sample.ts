import { create } from "domain";
import { Evt, TimeoutEvtError, to } from "evt";
//Or import { Evt } from "https://evt.land/x/evt/mod.ts" on deno

const interval = (ms:number, cb:()=>boolean ) => { 
    let handle:any
    return new Promise(resolve => {
        handle = setInterval( () => {
            if( cb() ) {
                resolve(null)
                clearInterval( handle )
            }  
        }, ms)
    })
}

function snippet1() {
    const evtText = Evt.create<string>();
    const evtTime = Evt.create<number>();
    
    evtText.attach(text => console.log(text));
    evtTime.attachOnce(time => console.log(time));
    
    evtText.post("hi!");
    evtTime.post(123);
    evtTime.post(1234);
}

function snippet2() {

    type Data = [ "TEXT",  string ] | [ "TIME",  number ];

    const evt = Evt.create<Data>();

    evt.$attach(to("TEXT"), text => console.log(text));
    evt.$attach(to("TIME"), time => console.log(time));

    evt.post(["TEXT", "hi!"]);
    evt.post(["TIME", 123]);
    evt.post(["TIME", 1234]);   
}

async function snippet3() {
    type Data = {
        type: "TEXT";
        text: string;
    } | {
        type: "AGE";
        age: number;
    };
    const evt = new Evt<Data>();
    
    const interval = setInterval( () => {
        evt.post( { type: 'TEXT', text: 'HI THERE!'})
    }, 2000);


    for( let ii = 0 ; ii < 5; ++ii ) {

        const prText = await evt.waitFor(
            data => data.type !== "TEXT" ? 
                null : [data.text] 
        );
    
        console.log( prText )
    
    }

    clearInterval( interval )
}

interface EventIterator<T> extends AsyncIterable<T>  {
    done(): void
}

function waitForEvents<T>(  evt: Evt<T> , timeout?: number ): EventIterator<T> {

    let isStopped = false
    async function* events() {
        
        while(!isStopped) {

            try{
                const res =  await evt.waitFor( timeout )
                yield res

            } catch(error) {
                console.warn("TIMEOUT!");
                isStopped = true
            }
        }
    }

    return {
        [Symbol.asyncIterator]: () => events(),

        done: () => isStopped = true
    }
}

async function snippet4() {

    type Data = {
        type: "TEXT";
        text: string;
    } | {
        type: "AGE";
        age: number;
    }

    const evt = new Evt<Data>()
    
    let numEvents = 0;
    const interval = setInterval( () => {
        evt.post( { type: 'TEXT', text: 'HI THERE!'})
        if( ++numEvents==10 )  clearInterval(interval)
    }, 2000);

    const eventIterator = waitForEvents( evt, 5000 ) 

    for await ( const ev of eventIterator ) {
    
        console.log( numEvents, ev )
    
        
    }
}

function waitForEvents2<T>(  evt: Evt<T> , timeout?: number ): EventIterator<T> {
    let isStopped = false

    const ctx = Evt.newCtx();

    ctx.evtDoneOrAborted.attachOnce(doneOrAborted=> {

        switch( doneOrAborted.type ) {
            case 'ABORTED':
                isStopped = true
                break
            case 'DONE':
                isStopped = true
                break
        }
    
      });

    async function* events() {
        
        while(!isStopped) {

            try{
                const res =  await evt.waitFor( ctx, timeout )
                yield res

            } catch(error:any) {
                console.warn("TIMEOUT!");
                ctx.abort( error )
            }
        }
    }

    return {
        [Symbol.asyncIterator]: () => events(),

        done: () => ctx.done()
    }
}


async function snippet5() {

    type Data = {
        type: "TEXT";
        text: string;
    } | {
        type: "AGE";
        age: number;
    }

    const evt = new Evt<Data>()
    
    let numEvents = 0;
    const interval = setInterval( () => {
        evt.post( { type: 'TEXT', text: 'HI THERE!'})
        if( ++numEvents==10 )  clearInterval(interval)
    }, 2000);

    const eventIterator = waitForEvents2( evt, 5000 ) 

    for await ( const ev of eventIterator ) {
    
        console.log( numEvents, ev )
    
        
    }
}

type Data = {
    type: "TEXT";
    text: string;
} | {
    type: "AGE";
    age: number;
}

class Sample1 {

    static create() { return new Sample1() }

    "test new asyncIterator feature from evt with timeout" =  async () => {
    
        const evt = Evt.create<Data>()
        
        const waitForEvent =  async () => {

            const ctx = Evt.newCtx();
          
            for await(const data of evt.iter(ctx, 1500 )) {   
              console.log(data);
            }
          
            if( ctx.completionStatus?.error instanceof TimeoutEvtError ){
              console.log("We exited the loop because of a timeout");
            }
          
            console.log(`Out of the loop, handler count: ${evt.getHandlers().length}`)
          
        }
          
        const postData = async () => {
            let numEvents = 0;
            await interval( 1000, () => {
                evt.post( { type: 'TEXT', text: 'HI THERE!'})
                return ( ++numEvents==5 ) 
            })   
        }
    
        return Promise.all( [waitForEvent(), postData()] )
    }

    "test new asyncIterator feature from evt with done" =  async () => {

        const evt = Evt.create<Data>()

        const ctx = Evt.newCtx();
                
        const waitForEvent =  async () => {
  
            for await(const data of evt.iter(ctx)) {   
              console.log(data);
            }
                    
            console.log(`Out of the loop, handler count: ${evt.getHandlers().length}`)
          
        }
          
        const postData = async () => {
            let numEvents = 0;
            await interval( 1000, () => {
                evt.post( { type: 'TEXT', text: 'HI THERE!'})
                if( ++numEvents==5 ) {
                    ctx.done()
                    return true
                }
                return false
            })   
        }
    
        return Promise.all( [waitForEvent(), postData()] )
    }
}



const main = async () => {
    // snippet1()
    // snippet2()
    // snippet3()
    // snippet4()
    // snippet5()
    const sample = Sample1.create()

    await sample["test new asyncIterator feature from evt with timeout"]()
    await sample["test new asyncIterator feature from evt with done"]()
}

main()