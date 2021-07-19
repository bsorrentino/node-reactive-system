"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonGenerator = exports.componentPrompts = exports.GENERATOR_NAME = void 0;
const YO = require("yeoman-generator");
exports.GENERATOR_NAME = 'rxbus-generator';
const validateName = (minLenght = 1) => {
    return (input) => {
        const len = input.trim().length;
        if (len >= minLenght)
            return true;
        return (len == 0) ?
            'please provide a name!' :
            `value must be at least of ${minLenght} chars`;
    };
};
const validateVersion = (input) => {
    if (/^(\d+)[\.](\d+)[\.](\d+)$/.test(input))
        return true;
    return 'invalid version format! must be - "(d+).(d+).(d+)"';
};
exports.componentPrompts = [
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
        default: (answers) => `The ${answers.Module.Name} Module`
    },
];
class CommonGenerator extends YO {
    copyTemplateFromRoot(config) {
        //     assert.ok( config.Module, 'Module configuration is not set' )
        //     const root = this.sourceRoot()
        //     this.sourceRoot( path.join( root, '..', '..', 'app', 'templates' ) )
        //     const solutionTpl = path.join('Solution', 'Other', 'Solution.xml')
        //     this.fs.copyTpl( 
        //         this.templatePath( solutionTpl ),
        //         this.destinationPath( path.join(config.Module.Name, solutionTpl) ), config )
        //     this.sourceRoot( root )
    }
}
exports.CommonGenerator = CommonGenerator;
