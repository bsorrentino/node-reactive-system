import assert = require('assert')

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
 export type ModuleInfo = { module:Module } & {
    started:boolean
    paused:boolean
}

 /**
  * Module Management
  */
 export class Modules {
 
     #modules = new Map<string,ModuleInfo>()

     register<C extends ModuleConfiguration>( module:Module<C>, config?:C  ) {
         assert.ok( !this.#modules.has( module.name ), `Module ${module.name} already exists!` )
 
         let result:ModuleInfo = {
             module:module,
             started:false, 
             paused:false
         }
         this.#modules.set( module.name, result )
         if( module.onRegister ) {
             module.onRegister( config )
         }
     }
     
     get names():IterableIterator<string> {
         return this.#modules.keys()
     }
 
     start() {
         this.#modules.forEach( m => {
 
             if( !m.started ) {
                 if( m.module.onStart ) {
                     m.module.onStart()
                 }
                 m.started = true
             }
         })
     }
 }
 
 /**
  * global modules instance
  */
 export const modules = new Modules()
 
 