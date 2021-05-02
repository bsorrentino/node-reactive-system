
import { Bus } from '@soulsoftware/rxbus'
import { Module as FastifyModule, Subjects as FastifySubjects } from '@soulsoftware/rxbus-fastify'
import { Module as TimerModule, Subjects as TimeSubjects } from '@soulsoftware/rxbus-timer'
import { Module as TraceModule } from '@soulsoftware/rxbus-trace'

/**
 * Route message from Timer to WebSocket
 */
function routeTimerToWS() {
    
    const subjectName = 'main'

    Bus.channels.requestChannel( FastifyModule.name )
        .request( { topic: FastifySubjects.WSAdd, data:subjectName } )
        .subscribe( { 
            next: v => console.log( `next: ${FastifySubjects.WSAdd}`),
            error: e => console.error( `error: ${FastifySubjects.WSAdd}`, e),
            complete: () => console.error( `complete: ${FastifySubjects.WSAdd}`)
        })

    Bus.channels.channel<number>( TimerModule.name )
        .observe( TimeSubjects.Tick )
        .subscribe( tick => {
            Bus.channels.channel( subjectName  )
                .subject( FastifySubjects.WSMessage )
                    .next( tick )
        })

}


function main() {

    console.log( 'start' )

    Bus.modules.registerModule( TraceModule )
    Bus.modules.registerModule( TimerModule )
    Bus.modules.registerModule( FastifyModule )

    for( let module of Bus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }

    routeTimerToWS()
    
    Bus.modules.start()
}

main()