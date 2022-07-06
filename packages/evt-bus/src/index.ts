import { Evt, to } from "evt";
//Or import { Evt } from "https://evt.land/x/evt/mod.ts" on deno

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

snippet1()
snippet2()
snippet3()