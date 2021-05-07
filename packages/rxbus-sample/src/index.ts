
import { Bus } from '@soulsoftware/rxbus'
import { 
    Module as FastifyModule, 
    Subjects as FastifySubjects,
    Config as FastifyConfig
} from '@soulsoftware/rxbus-fastify'

import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@soulsoftware/rxbus-timer'

import { Module as TraceModule } from '@soulsoftware/rxbus-trace'

/**
 * Route message from Timer to WebSocket
 * 
 * MUST: Call it before bus start
 */
function routeTimerToWS() {
    
    const ws_route_name = 'ws.main'

    // function to listen on a WS channel  
    const ws_observe = () => 
        Bus.channel<number>( TimerModule.name )
            .observe( TimerSubjects.Tick )
            .subscribe( tick => 
                Bus.channel( ws_route_name  )
                    .subject( FastifySubjects.WSMessage )
                        .next( tick ))

    // Request register a new WS route                 
    Bus.replyChannel( FastifyModule.name )
        .request( { topic: FastifySubjects.WSAdd, data:ws_route_name } )
        .subscribe( { 
            next: v => console.log( `next: ${FastifySubjects.WSAdd}`),
            error: e => console.error( `error: ${FastifySubjects.WSAdd}`, e),
            complete: ws_observe 
        })


}


function main() {

    console.log( 'start' )

    Bus.modules.register( TraceModule )
    Bus.modules.register( TimerModule )
    Bus.modules.register<FastifyConfig>( FastifyModule, 
        { 
            port:8888,
            requestTimeout: 10000
        })

    for( let module of Bus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }

    routeTimerToWS()
    
    Bus.modules.start()
}

main()