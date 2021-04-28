
import { Bus } from '@soulsoftware/rxbus'
import { Module as FastifyModule } from '@soulsoftware/rxbus-fastify'
import { Module as TimerModule } from '@soulsoftware/rxbus-timer'
import { Module as TraceModule } from '@soulsoftware/rxbus-trace'

function main() {

    console.log( 'start' )

    Bus.modules.registerModule( TraceModule )
    Bus.modules.registerModule( TimerModule )
    Bus.modules.registerModule( FastifyModule )

    for( let module of Bus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }
    
    Bus.modules.start()


}

main()