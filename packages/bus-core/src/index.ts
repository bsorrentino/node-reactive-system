export interface ModuleConfiguration extends Record<string,any> {
}

export interface ModuleRegistrationLifecycle<CFG extends ModuleConfiguration> {
    onRegister( config?:CFG ):void
    onUnregister():void
}

export interface ModulePauseResumeLifecycle {
    onPause():void
    onResume():void
}

export interface ModuleLifecycle {
    onStart():void
    onStop():void
}


export interface ModuleProperties {
    name:string
}

export type Module<CFG extends ModuleConfiguration = ModuleConfiguration> =    
                        Readonly<ModuleProperties> & 
                        Partial<ModuleLifecycle> & 
                        Partial<ModuleRegistrationLifecycle<CFG> & 
                        Partial<ModulePauseResumeLifecycle>>

/**
 * Module information
 */
 export type ModuleInfo = { object:Module } & {
    started:boolean
    paused:boolean
}

 /**
  * Module Management
  */
 export class Modules {
 
     #modules = new Map<string,ModuleInfo>()

     register<C extends ModuleConfiguration>( module:Module<C>, config?:C  ) {
        if( this.#modules.has( module.name ) ) {
            console.warn( `Module ${module.name} already registered!` )
            // throw new Error(`Module ${module.name} already registerd!`) 
            return;
        }

        const info:ModuleInfo = {
             object:module,
             started:false, 
             paused:false
         }
         this.#modules.set( module.name, info )
         if( module.onRegister ) {
             module.onRegister( config )
         }
         return info
     }
     
     get names():IterableIterator<string> {
         return this.#modules.keys()
     }

     #startModule( module: ModuleInfo ) {
        if( !module.started  ) {
            module.started = true
            if( module.object.onStart ) {
                try {
                    module.object.onStart()
                }
                catch( e ) {
                    console.warn( `error starting module '${module.object.name}`, e)
                    module.started = false
                }
            }
        }

     }
 
     start() {
         this.#modules.forEach( m => this.#startModule(m) )
     }

     registerAndStart<C extends ModuleConfiguration>( module:Module<C>, config?:C  ) {
        const m = this.register(module, config)
        if( m ) {
            this.#startModule(m)
        }
        return m
     }
 }
 
 /**
  * global modules instance
  */
 export const modules = new Modules()
 
 