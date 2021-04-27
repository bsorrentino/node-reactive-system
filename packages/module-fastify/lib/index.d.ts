import { MessageBus } from "@soulsoftware/bus-module";
import { Subject } from "rxjs";
export class FastifyModule implements MessageBus.Module {
    readonly name = "FastifyModule";
    get myChannel(): Subject<any> | undefined;
    onRegister(): void;
    onStart(): void;
    onStop(): void;
}

//# sourceMappingURL=index.d.ts.map
