interface Constraint {
	more: boolean;
	less: boolean;
}
declare enum N {
	branch = 'branch',
	root = 'root'
}
interface TargetFiled {
	path: string;
	node: N;
}
declare class Validator {
  constructor(rule: any);
  static loadCheckOperators(operatorObj: any): void;
  static loadLogicOperators(operatorObj: any): void;
  static loadHelpOperators(operatorObj: any): void;
  check(value: any, constraint?: Constraint, targetFiled?: TargetFiled): void;
}
export = Validator;