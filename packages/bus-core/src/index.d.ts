

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
