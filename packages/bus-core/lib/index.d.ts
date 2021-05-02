export interface ModuleRegistrationLifecycle {
    onRegister():void
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
    readonly name:string
}

export type Module =    ModuleProperties & 
                        Partial<ModuleLifecycle> & 
                        Partial<ModuleRegistrationLifecycle> & 
                        Partial<ModulePauseResumeLifecycle> 
    
