import { Program, Type, validateDecoratorParamType } from "@cadl-lang/compiler";
import { reportDiagnostic } from "./lib.js";

const operationIdsKey = Symbol();
export function $operationId(program: Program, entity: Type, opId: string) {
  if (entity.kind !== "Operation") {
    reportDiagnostic(program, {
      code: "decorator-wrong-type",
      format: { decorator: "operationId", entityKind: entity.kind },
      target: entity,
    });
    return;
  }
  program.stateMap(operationIdsKey).set(entity, opId);
}

export function getOperationId(program: Program, entity: Type): string | undefined {
  return program.stateMap(operationIdsKey).get(entity);
}

export type ExtensionKey = `x-${string}`;
const openApiExtensionKey = Symbol();
export function $extension(program: Program, entity: Type, extensionName: string, value: any) {
  if (!validateDecoratorParamType(program, entity, extensionName, "string")) {
    return;
  }

  if (!isOpenAPIExtensionKey(extensionName)) {
    reportDiagnostic(program, {
      code: "invalid-extension-key",
      format: { value: extensionName },
      target: entity,
    });
  }

  const openApiExtensions = program.stateMap(openApiExtensionKey);
  const typeExtensions = openApiExtensions.get(entity) ?? new Map<string, any>();
  typeExtensions.set(extensionName, value);

  openApiExtensions.set(entity, typeExtensions);
}

export function getExtensions(program: Program, entity: Type): ReadonlyMap<ExtensionKey, any> {
  return program.stateMap(openApiExtensionKey).get(entity) ?? new Map<ExtensionKey, any>();
}

function isOpenAPIExtensionKey(key: string): key is ExtensionKey {
  return key.startsWith("x-");
}