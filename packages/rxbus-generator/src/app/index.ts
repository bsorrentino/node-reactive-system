import chalk from 'chalk'
import { Separator, Answers } from 'inquirer'
import yosay from 'yosay'
import yo = require('yeoman-generator')
import * as util from '../generator-utils' 

type Config = Partial<{ 
  subgen:string
}>

type Options = yo.GeneratorOptions


export default class MainGenerator extends yo<Options> {

  constructor(args: string|string[], options: Options) {
		super(args, options)
    this.log(yosay(`Welcome to the ${chalk.red(util.GENERATOR_NAME)}!`))
	}

  public async prompting() {
    const prompts:yo.Questions = [
      {
        type: 'list',
        name: 'subgen',
        message: 'Which kind of template do you want?',
        choices: [
          {
            name: 'Generic',
            value: '@soulsoftware/rxbus:generic',
            // disabled: 'Unavailable at this time',
          },
          { 
            name: 'Worker',
            value: '@soulsoftware/rxbus:worker',
            disabled: 'Unavailable at this time'
          }
        ]
      }
    ];

    return this.prompt(prompts).then( (props:Config) => {
      this.composeWith(props.subgen!, {} )
    });
  }

  /**
   * 
   */
  public writing() {
  }

  public install() {
  }

  public end() {
    
  }
};
