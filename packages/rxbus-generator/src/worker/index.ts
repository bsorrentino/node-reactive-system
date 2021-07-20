import chalk from 'chalk'
import yosay from 'yosay'
import YO = require('yeoman-generator')
import { capitalize, CommonGenerator, componentQuestions, ModuleConfig } from '../generator-utils' 
import * as path from 'path'

type Options = YO.GeneratorOptions

type GeneratorConfig = ModuleConfig & { installDeps?:boolean }

export default class TextFieldTemplateGenerator extends CommonGenerator<Options> {

  private answers?:GeneratorConfig

  constructor(args: string|string[], options: Options) {
		super(args, options)
	}

  public async prompting() {

    const questions = [ ...componentQuestions,
      {
        name: 'installDeps',
        message: 'install Dependencies',
        type:'confirm'
      }
    ]

    this.answers = await this.prompt(questions) as GeneratorConfig

    this.answers.Module.Name = capitalize(this.answers.Module.Name) 
  }

  /**
   * 
   */
  public writing() {

      
  }

  public install() {
    if( !this.answers ) return 

    const { Module: { Name }, installDeps  } = this.answers

    this.destinationRoot( Name )
  
    if( installDeps )
      this.spawnCommandSync( 'npm', ['install'])
  }
  

  public end() {
    
  }
};
