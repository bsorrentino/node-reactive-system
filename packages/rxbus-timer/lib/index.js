var s=require("rxjs").interval,e=require("@soulsoftware/rxbus").Bus;const n=new class{name="TimerModule";onRegister(){this._myChannel=e.channels.newChannel(`${this.name}/channel`)}onStart(){this._subscription=s(1e3).subscribe(this._myChannel)}onStop(){this._subscription&&(this._subscription.unsubscribe(),this._subscription=void 0)}};exports.Module=n;
//# sourceMappingURL=index.js.map
