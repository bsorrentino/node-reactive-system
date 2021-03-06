"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const generator_utils_1 = require("../generator-utils");
class TextFieldTemplateGenerator extends generator_utils_1.CommonGenerator {
    constructor(args, options) {
        super(args, options);
    }
    prompting() {
        return __awaiter(this, void 0, void 0, function* () {
            const questions = [...generator_utils_1.componentQuestions,
                {
                    name: 'installDeps',
                    message: 'install Dependencies',
                    type: 'confirm'
                }
            ];
            this.answers = (yield this.prompt(questions));
            this.answers.Module.Name = (0, generator_utils_1.capitalize)(this.answers.Module.Name);
        });
    }
    /**
     *
     */
    writing() {
    }
    install() {
        if (!this.answers)
            return;
        const { Module: { Name }, installDeps } = this.answers;
        this.destinationRoot(Name);
        if (installDeps)
            this.spawnCommandSync('npm', ['install']);
    }
    end() {
    }
}
exports.default = TextFieldTemplateGenerator;
;
