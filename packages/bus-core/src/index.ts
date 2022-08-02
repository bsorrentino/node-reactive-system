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

export interface ModuleStatus {
    started:boolean
    paused:boolean
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
 export type ModuleInfo = { module:Module, status:ModuleStatus }

 /**
  * Module Management
  */
 export class Modules {
 
     private _modules = new Map<string,ModuleInfo>()
 
     register<C extends ModuleConfiguration>( module:Module<C>, config?:C  ) {
         assert.ok( !this._modules.has( module.name ), `Module ${module.name} already exists!` )
 
         let result:ModuleInfo = {
             module:module,
             status:{ started:false, paused:false} 
         }
         this._modules.set( module.name, result )
         if( module.onRegister ) {
             module.onRegister( config )
         }
     }
     
     get names():IterableIterator<string> {
         return this._modules.keys()
     }
 
     start() {
         this._modules.forEach( m => {
 
             if( !m.status.started ) {
                 if( m.module.onStart ) {
                     m.module.onStart()
                 }
                 m.status.started = true
             }
         })
     }
 }
 
 /**
  * global modules instance
  */
 export const modules = new Modules()
 
 