import YO = require('yeoman-generator')
import { CommonGenerator, ModuleConfig, componentQuestions, capitalize } from '../generator-utils' 

type Options = YO.GeneratorOptions

type GeneratorConfig = ModuleConfig & { installDeps?:boolean }


export default class GenericModuleGenerator extends CommonGenerator<Options> {

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
  
    if( !this.answers ) return

    const { Name } = this.answers.Module

    this.fs.copyTpl( 
      this.sourceRoot(),
      this.destinationPath(Name.toLowerCase()),
      this.answers
    );
  
      
  }

  public install() {

    if( !this.answers ) return 

    const { Module: { Name }, installDeps  } = this.answers

    this.destinationRoot( Name )
    // this.addDependencies( { rxjs:'7.0.0'} )
    // this.installDependencies({ npm: true, bower: false });
  
    if( installDeps )
      this.spawnCommandSync( 'npm', ['install'])
  }

  public end() {
    
  }
};
