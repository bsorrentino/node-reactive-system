function e(e){return e&&e.__esModule?e.default:e}var s=e(require("@soulsoftware/rxmq")),t=e(require("assert"));class r{channel(e){return s.channel(e)}replyChannel(e){return s.channel(e)}workerChannel(e,s){const t=this.channel(e),r=this.channel(e).subject("worker.message.out"),n=t.observe("worker.message.in");return s.on("message",(e=>r.next(e.data))),s.on("error",(e=>r.error(e))),s.on("exit",(e=>r.complete())),n.subscribe((e=>s.postMessage(e))),{in:n,out:r}}get names(){return s.channelNames()}}class n{_modules=new Map;register(e,s){t.ok(!this._modules.has(e.name),`Module ${e.name} already exists!`);let r={module:e,status:{started:!1,paused:!1}};this._modules.set(e.name,r),e.onRegister&&e.onRegister(s)}get names(){return this._modules.keys()}start(){this._modules.forEach((e=>{e.status.started||(e.module.onStart&&e.module.onStart(),e.status.started=!0)}))}}const a=new class{channels=new r;modules=new n};exports.Bus=a;