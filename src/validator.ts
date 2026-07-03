import {
  ARG_TYPE,
  COMMAND_VALIDATIONS,
  REDIS_COMMANDS,
  REDIS_MODIFIERS,
  type CommandModifiers,
  type CommandValidationParamArg,
  type CommandValidationParams,
} from "./constants/commands.js";
import { ValidatorErrorMessages } from "./constants/errorMessages.js";
import { ProtocolDelimiterParser } from "./parser.js";
import type { CommandShape } from "./types/commands/index.js";

export class CommandValidator {
  private static validateArgsCount(
    validationParam: CommandValidationParams,
    actualCommandShape: CommandShape,
  ): boolean {
    const actualArgsCount = (actualCommandShape.args ?? []).length;
    const expectedArgsCount = validationParam.totalArgs;
    const modifierArgsCount =
      validationParam.modifiers
        ?.map((modifier) => (modifier.args.length ?? 0) + 1)
        .reduce((prev, curr) => prev + curr, 0) ?? 0;

    // Expected no args - just return buh
    // If in future for no args - and actual args are present - then throw error here?
    if (expectedArgsCount === 0) {
      return true;
    }

    let maxPossibleCountOfArgs = 0 + modifierArgsCount;
    let minPossibleCountOfArgs = 0;
    validationParam.args.forEach((arg) => {
      if ([ARG_TYPE.STRING, ARG_TYPE.INTEGER].includes(arg.type)) {
        maxPossibleCountOfArgs += 1;
        minPossibleCountOfArgs += 1;
      } else if (arg.type === ARG_TYPE.LIST) {
        maxPossibleCountOfArgs += arg.maxLength ?? 1;
        minPossibleCountOfArgs += arg.minLength ?? 1;
      }
    });
    console.log(
      actualArgsCount >= minPossibleCountOfArgs,
      actualArgsCount <= maxPossibleCountOfArgs,
      minPossibleCountOfArgs,
      maxPossibleCountOfArgs,
    );
    return (
      actualArgsCount >= minPossibleCountOfArgs &&
      actualArgsCount <= maxPossibleCountOfArgs
    );
  }

  private static validateArg(
    validationArg: CommandValidationParamArg,
    actualArg: string | undefined,
  ): boolean {
    if (!actualArg) {
      throw Error(ValidatorErrorMessages.MISSING_ARGUMENT(validationArg!.name));
    }

    const expectedArgMaxLength = validationArg!.maxLength;
    const expectedArgMinLength = validationArg!.minLength;
    const actualArgLength = actualArg?.length ?? 0;

    if (expectedArgMaxLength != undefined) {
      if (actualArg && actualArgLength > expectedArgMaxLength) {
        throw Error(
          ValidatorErrorMessages.LENGTH_OF_ARGUMENT_TOO_LONG(
            validationArg!.name,
            expectedArgMaxLength!,
            actualArgLength,
          ),
        );
      }
    }

    if (expectedArgMinLength != undefined) {
      if (actualArg && actualArgLength < expectedArgMinLength) {
        throw Error(
          ValidatorErrorMessages.LENGTH_OF_ARGUMENT_TOO_SHORT(
            validationArg!.name,
            expectedArgMinLength!,
            actualArgLength,
          ),
        );
      }
    }

    const expectedMax = validationArg?.max;
    const expectedMin = validationArg?.min;
    const actualArgNum = parseInt(actualArg);
    const isActualArgNumber = !isNaN(actualArgNum);

    if (
      (expectedMax != undefined || expectedMin != undefined) &&
      !isActualArgNumber
    ) {
      throw Error(
        ValidatorErrorMessages.INVALID_NUMERIC_VALUE(
          validationArg!.name,
          actualArg,
        ),
      );
    }

    if (expectedMax != undefined) {
      if (isActualArgNumber && actualArgNum > expectedMax) {
        throw Error(
          ValidatorErrorMessages.OUT_OF_RANGE_NUMERIC_VALUE(
            validationArg!.name,
            actualArgNum,
            expectedMax,
            expectedMin,
          ),
        );
      }
    }

    if (expectedMin != undefined) {
      if (isActualArgNumber && actualArgNum < expectedMin) {
        throw Error(
          ValidatorErrorMessages.OUT_OF_RANGE_NUMERIC_VALUE(
            validationArg!.name,
            actualArgNum,
            expectedMax,
            expectedMin,
          ),
        );
      }
    }

    return true;
  }

  private static validateAllArgs(
    validationParam: CommandValidationParams,
    actualCommandShape: CommandShape,
  ): boolean {
    let areAllArgsValid: boolean = true;
    const expectedArgs: CommandValidationParamArg[] = validationParam.args;
    const acutalArgs = actualCommandShape.args ?? [];

    for (let iterator = 0; iterator < expectedArgs.length; iterator++) {
      const expectedArg = expectedArgs[iterator]!;
      const actualArg = acutalArgs[iterator];
      const isArgValid = CommandValidator.validateArg(expectedArg, actualArg);
      if (!isArgValid) {
        areAllArgsValid = false;
        break;
      } else {
        if (expectedArg.type === ARG_TYPE.INTEGER) {
          acutalArgs[iterator] = parseInt(actualArg);
        }
      }
    }

    return areAllArgsValid;
  }

  //TODO: Hacky way to get a command shape out of the modifier
  // Mocking it to be a separate command itself - might bite me in the ass in future
  static parseModifier(
    validationParam: CommandValidationParams,
    modifier: CommandModifiers,
    actualCommandShape: CommandShape,
  ): CommandShape {
    const modifierLex: string = modifier.modifierLex;
    if (modifier) {
      const searchFromIndex: number = validationParam.args.length;
      const actualArgs = actualCommandShape.args ?? [];
      const modifierPos = actualArgs?.indexOf(modifierLex, searchFromIndex);
      const modifiedArgCount = modifier.totalArgs;

      if (modifierPos) {
        const modifierCommand = actualArgs![modifierPos];
        if (modifierCommand) {
          const modifierArgs = actualArgs.slice(
            modifierPos + 1,
            modifierPos + modifiedArgCount + 1,
          );
          const modifierCommandShape = {
            inputString: "",
            command: modifierCommand,
            args: modifierArgs,
          };

          CommandValidator.validateAllArgs(modifier, modifierCommandShape);

          if (actualCommandShape.modifiers) {
            actualCommandShape.modifiers.push(modifierCommandShape);
          } else {
            actualCommandShape.modifiers = [modifierCommandShape];
          }
        }
      }
    }
    return actualCommandShape;
  }

  private static setActualCommandShapeWithModifiers(
    validationParam: CommandValidationParams,
    actualCommandShape: CommandShape,
  ): CommandShape {
    validationParam.modifiers?.forEach((modifier) => {
      actualCommandShape = CommandValidator.parseModifier(
        validationParam,
        modifier,
        actualCommandShape,
      );
    });
    return actualCommandShape;
  }

  private static getMatchingValidationParam(
    validationParams: CommandValidationParams[],
    actualCommandShape: CommandShape,
  ): CommandValidationParams | undefined {
    for (const validationParam of validationParams) {
      console.log(validationParam);
      const isArgsCountMatching = CommandValidator.validateArgsCount(
        validationParam,
        actualCommandShape,
      );

      if (isArgsCountMatching) {
        const hasModifiers = validationParam.modifiers?.length;

        if (hasModifiers) {
          const expectedModifierPos = validationParam.args.length;
          const expectedModifiers =
            validationParam.modifiers?.map((value) =>
              value.modifierLex.toString(),
            ) ?? [];
          const actualArgs = actualCommandShape.args ?? [];
          const actualModifier: string | undefined =
            actualArgs[expectedModifierPos];
          if (actualModifier) {
            const isModifierValid = expectedModifiers.includes(actualModifier);
            if (!isModifierValid) {
              throw Error(
                ValidatorErrorMessages.INVALID_MODIFIER(actualModifier),
              );
            } else {
              return validationParam;
            }
          } else {
            // console.log(actualCommandShape, actualModifier, expectedModifiers);
            //TODO: I dont think this case will ever arise in the real world?
            // It did you retard - the code says expected modifier but I don't have to pass one.
            // Why did I throw error here?
            // throw Error(ValidatorErrorMessages.UNEXPECTED_ERROR());
            // All tests passed after commenting this piece of shit code out - WHAT IS GOING ON?
          }
        } else {
          return validationParam;
        }
      }
    }

    return undefined;
  }

  static validateCommandShape(actualCommandShape: CommandShape) {
    let validationParams: CommandValidationParams[] = [];

    if (actualCommandShape.command in COMMAND_VALIDATIONS) {
      validationParams =
        COMMAND_VALIDATIONS[actualCommandShape.command as REDIS_COMMANDS] ?? [];
    } else {
      // LMAO - wtf do we here huh - stalemate
      // Not throwing here, but temporarily throwing the error in the parser file
      // Reason - we don't have balls here to say unknown command as the Parser logic itself parses via available commands - we don't get to say it here
      // Ideal - Parser should be a good soldier - just parse - logic of unknown command shouldn't exist there but here, I don't have time as of now - will let parser get mixed with responsibility
      // throw Error(ValidatorErrorMessages.UNKNOWN_COMMAND(commandShape.command));
    }

    let expectedValidation: CommandValidationParams | undefined =
      CommandValidator.getMatchingValidationParam(
        validationParams,
        actualCommandShape,
      );

    if (!expectedValidation) {
      const expectedArgCounts = validationParams
        .map((value) => value.totalArgs)
        .join(" | ");
      throw Error(
        ValidatorErrorMessages.TOTAL_NUMBER_OF_ARGUMENTS_MISMATCH(
          expectedArgCounts ?? 0,
          actualCommandShape.args?.length ?? 0,
        ),
      );
    }

    CommandValidator.validateAllArgs(expectedValidation, actualCommandShape);
    CommandValidator.setActualCommandShapeWithModifiers(
      expectedValidation,
      actualCommandShape,
    );
    // Type validation. Idk how to go about it as of now - If number is added will have to update it
    // Size validation. Idk how to go about it as of now

    return actualCommandShape;
  }
}
