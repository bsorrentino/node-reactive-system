import YO = require('yeoman-generator')
import * as path from 'path'
import assert from 'assert'

export const GENERATOR_NAME = 'rxbus-generator'


type TemplateCommonOptions = {
    // 'Module.Version'
    // 'Module.Name'
    // 'Module.Description'
    Version: '1.0.0'
    Name: string
    Description: string
}


type TemplateOptions = {
    Module: TemplateCommonOptions 
}

export type ModuleConfig = Partial<TemplateOptions>

const validateName = ( minLenght:number = 1 ) => {
    return ( input:string ) => {    const len = input.trim().length
        if( len >= minLenght ) return true
        
        return (len ==0 ) ? 
            'please provide a name!' : 
            `value must be at least of ${minLenght} chars`
        }
}

const validateVersion = ( input:string ) => {
    if( /^(\d+)[\.](\d+)[\.](\d+)$/.test(input) ) return true
    return 'invalid version format! must be - "(d+).(d+).(d+)"'
}

export const componentPrompts:YO.Questions = [
    {
        name: 'Module.Name',
        message: 'Module name:',
        validate: validateName()
    },
    {
        name: 'Module.Version',
        message: 'Module initial version:',
        validate: validateVersion,
        default: '1.0.0'
    },
    {
        name: 'Module.Description',
        message: 'Module description:',
        default: ( answers:ModuleConfig ) => 
            `The ${answers.Module!.Name} Module` 
    },
  
]

    

export class CommonGenerator<T extends YO.GeneratorOptions = YO.GeneratorOptions> extends YO<T> {

            
    // copyTemplateFromRoot( config:ModuleConfig ) {

    //     assert.ok( config.Module, 'Module configuration is not set' )

    //     const root = this.sourceRoot()
    //     this.sourceRoot( path.join( root, '..', '..', 'app', 'templates' ) )
    
    //     const solutionTpl = path.join('Solution', 'Other', 'Solution.xml')
    //     this.fs.copyTpl( 
    //         this.templatePath( solutionTpl ),
    //         this.destinationPath( path.join(config.Module.Name, solutionTpl) ), config )
    
    //     this.sourceRoot( root )
    
    // }
}