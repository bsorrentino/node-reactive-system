import chalk from 'chalk'
import yosay from 'yosay'
import YO = require('yeoman-generator')
import * as util from '../generators-util' 
import * as path from 'path'

type Options = YO.GeneratorOptions


type Config = util.ModuleConfig

export default class TextFieldTemplateGenerator extends util.CommonGenerator<Options> {

  private _config:util.ModuleConfig = {}

  constructor(args: string|string[], options: Options) {
		super(args, options)
	}

  public async prompting() {
    // Have Yeoman greet the user.

    const prompts = util.componentPrompts

    return this.prompt(prompts).then( (props:Config) => {
      // To access props later use this.props.someAnswer;
      
      this._config = props
    });
  }

  /**
   * 
   */
  public writing() {

    const pcfconfig = this._config.PCF!

    pcfconfig.Constructor = "TextFieldTemplate"
    this.fs.copyTpl( 
      this.templatePath(),
      this.destinationPath(pcfconfig.Name),
      this._config
    );

    super.copyTemplateFromRoot( this._config )
      
  }

  public install() {
    const pcfconfig = this._config.PCF!

    this.destinationRoot( pcfconfig.Name )
    this.installDependencies({ npm: true, bower: false });
  
  }

  public end() {
    
  }
};
