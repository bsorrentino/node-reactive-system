
export const style = {

    Bright : "\x1b[1m",
    Dim : "\x1b[2m",
    Underscore : "\x1b[4m",
    Blink : "\x1b[5m",
    Hidden : "\x1b[8m",
    Reverse : "\x1b[7m",
    Reset : "\x1b[0m",

    FgBlack : "\x1b[30m",
    FgCyan : "\x1b[36m",
    FgRed : "\x1b[31m",
    FgGreen : "\x1b[32m",
    FgYellow : "\x1b[33m",
    FgBlue : "\x1b[34m",
    FgMagenta : "\x1b[35m",
    FgWhite : "\x1b[37m",

    BgBlack : "\x1b[40m",
    BgRed : "\x1b[41m",
    BgGreen : "\x1b[42m",
    BgYellow : "\x1b[43m",
    BgBlue : "\x1b[44m",
    BgMagenta : "\x1b[45m",
    BgCyan : "\x1b[46m",
    BgWhite : "\x1b[47m",

}

export enum LogLevel { 
    trace_native = 0, trace, debug_native, debug, info_native, info,  warning,  error 
}

export type LogFunc = ( ...data: any[] ) => any

export interface ILogger {
    trace(...data: any[]): void;
    trace( func:LogFunc, ...data: any[] ): void;

    debug(...data: any[]): void;
    debug( func:LogFunc, ...data: any[] ): void;

    info(...data: any[]): void;
    info(arg: LogFunc, ...data: any[]): void;

    warn(...data: any[]): void;
    warn( func: LogFunc, ...data: any[]): void;

    error(...data: any[]): void;
    error( func: LogFunc, ...data: any[]): void;
}

class Logger implements ILogger {

    constructor( public logLevel:LogLevel, private name:string  ) {}

    trace( ...data: any[] ):void {
        // console.log( `[${this.name}]`, 'trace', this.logLevel,  LogLevel.trace  )
        if( this.logLevel <= LogLevel.trace ) {
            const _l = ( this.logLevel === LogLevel.trace_native ) ? 
                        console.trace :
                        console.log
            if( typeof data[0] === 'function' ) {
                const f = data.shift() as Function
                return _l( `${this.name}: `, f(), ...data )
            }
            _l( `${this.name}: `, ...data ) 
        }
    }
    
    debug( ...data: any[] ):void {       
        if( this.logLevel <= LogLevel.debug ) {
            const _l = ( this.logLevel === LogLevel.debug_native ) ? 
                        console.debug :
                        console.log            
            if( typeof data[0] === 'function' ) {
                const f = data.shift() as Function
                return _l( `${this.name}: `,f(), ...data )
            }
            
            _l( `${this.name}: `, ...data ) 
        }
    }
    
    info( ...data: any[] ):void {
        if( this.logLevel <= LogLevel.info ) {
            const _l = ( this.logLevel === LogLevel.info_native ) ? 
                        console.info :
                        console.log            
            if( typeof data[0] === 'function' ) {
                const f = data.shift() as Function
                return _l( `${this.name}: `, f(), ...data ) 
            }
            _l( `${this.name}: `, ...data )
        }
    }
    
    warn( ...data: any[] ):void {
        if( this.logLevel <= LogLevel.warning ) {

            if( typeof data[0] === 'function' ) {
                const f = data.shift() as Function
                return  console.warn( style.BgYellow, this.name, style.Reset, f(), ...data )
            }
            console.warn( style.BgYellow, `${this.name}: `, style.Reset, ...data ) 
        }
    }
    
    error( ...data: any[] ):void {
        if( typeof data[0] === 'function' ) {
            const f = data.shift() as Function
            return console.error( style.BgRed, this.name, style.Reset, f(), ...data )
        }
        console.error( style.BgRed, `${this.name}: `, style.Reset, ...data ) 
    }
    
}

declare global {
    interface Window {
        loggers:Loggers
    }
}

//
// @ref https://github.com/leegeunhyeok/node-self
//
(() => {
    typeof self === 'undefined' && typeof global === 'object'
      ? global.self = <any>global : null
})()

const _default = Symbol('default.logger')

type Loggers = Record<symbol|string,ILogger>


self.loggers = {}

self.loggers[_default] = new Logger(LogLevel.debug, '_default')

/**
 * 
 * @param initLoggers 
 */
export function initLoggers( defaultLevel:LogLevel, loggersInitializer: Array<{ name: string, level?:LogLevel }> ) {
    console.log( ">> initLoggers" )

    const defaultLogger = self.loggers[_default] as Logger
    defaultLogger.logLevel = defaultLevel

    loggersInitializer.forEach( l => {
        self.loggers[l.name.toLocaleLowerCase()] = new Logger( l.level ?? defaultLevel, l.name )
    })

    console.dir( self.loggers )
}

/**
 * 
 * @param name 
 * @returns 
 */
export const getLogger = ( name?: string ):ILogger => {
    // console.dir( self.loggers )

    const result =  ( name && self.loggers[name.toLocaleLowerCase()] ) ? 
                            self.loggers[name.toLocaleLowerCase()] :
                            self.loggers[_default]
                            
    // console.log( ">> GETLOGGER ", name )
    return result
}

