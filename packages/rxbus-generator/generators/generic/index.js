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
class GenericModuleGenerator extends generator_utils_1.CommonGenerator {
    constructor(args, options) {
        super(args, options);
        this.params = {};
    }
    prompting() {
        return __awaiter(this, void 0, void 0, function* () {
            this.params = yield this.prompt(generator_utils_1.componentPrompts);
        });
    }
    /**
     *
     */
    writing() {
        const { Name } = this.params.Module;
        this.fs.copyTpl(this.sourceRoot(), this.destinationPath(Name), this.params);
    }
    install() {
        const { Name } = this.params.Module;
        this.destinationRoot(Name);
        // this.addDependencies( { rxjs:'7.0.0'} )
        // this.installDependencies({ npm: true, bower: false });
        this.spawnCommandSync('npm', ['install']);
    }
    end() {
    }
}
exports.default = GenericModuleGenerator;
;
