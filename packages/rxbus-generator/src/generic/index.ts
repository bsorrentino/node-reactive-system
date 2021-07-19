import YO = require('yeoman-generator')
import { CommonGenerator, ModuleConfig, componentPrompts } from '../generator-utils' 

type Options = YO.GeneratorOptions

export default class GenericModuleGenerator extends CommonGenerator<Options> {

  private params:ModuleConfig = {}

  constructor(args: string|string[], options: Options) {
		super(args, options)
	}

  public async prompting() {
    this.params = await this.prompt(componentPrompts)
  }

  /**
   * 
   */
  public writing() {
  
    const { Name } = this.params.Module!

    this.fs.copyTpl( 
      this.sourceRoot(),
      this.destinationPath(Name),
      this.params
    );

      
  }

  public install() {
    const { Name } = this.params.Module!

    this.destinationRoot( Name )
    // this.addDependencies( { rxjs:'7.0.0'} )
    // this.installDependencies({ npm: true, bower: false });
  
    this.spawnCommandSync( 'npm', ['install'])
  }

  public end() {
    
  }
};
