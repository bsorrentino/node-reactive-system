"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importStar(require("inquirer"));
function list() {
    inquirer_1.default
        .prompt([
        {
            type: 'list',
            name: 'theme',
            message: 'What do you want to do?',
            choices: [
                'Order a pizza',
                'Make a reservation',
                new inquirer_1.Separator(),
                'Ask for opening hours',
                {
                    name: 'Contact support',
                    disabled: 'Unavailable at this time',
                },
                'Talk to the receptionist',
            ],
        },
        {
            type: 'list',
            name: 'size',
            message: 'What size do you need?',
            choices: ['Jumbo', 'Large', 'Standard', 'Medium', 'Small', 'Micro'],
            filter: val => val.toLowerCase(),
        },
    ])
        .then((answers) => {
        console.log(answers);
    });
}
function list2() {
    inquirer_1.default
        .prompt([
        {
            type: 'list',
            name: 'subgen',
            message: 'Which kind of template dow you want?',
            choices: [
                {
                    name: 'Generic',
                    disabled: 'Unavailable at this time',
                },
                {
                    name: 'Detail List (Grid View)',
                    value: 'pcf-fluentui:client'
                }
            ]
        },
        {
            type: 'input',
            name: 'componentName',
            message: 'Give me component name:',
            validate: (input) => {
                if (input.trim().length > 0) {
                    return true;
                }
                return 'please provide a valid name!';
            }
        }
    ])
        .then((answers) => {
        console.log(answers);
    });
}
list2();
