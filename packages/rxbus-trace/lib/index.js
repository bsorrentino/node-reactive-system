var s=require("@soulsoftware/rxbus").Bus;const o=new class{name="TraceModule";_subscriptions=[];onStart(){console.log(this.name,"start");for(let o of s.channelNames){console.log(`trace: subscribe on ${o}`);const e=s=>console.log(`trace: got message from  ${o}`,s);this._subscriptions.push(s.channel(o).observe("*").subscribe({next:e}))}}onStop(){for(let s of this._subscriptions)s.unsubscribe();this._subscriptions=[]}};exports.Module=o;