function typeName(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  return value.constructor?.name ?? typeof value;
}

export const logArgs = (...args: any[]) => {
  for (const [index, arg] of args.entries()) {
    // Not including "symbol", "undefined", "object", "function"
    if (["string", "number", "bigint", "boolean", "Array"].includes(typeof arg)) {
      console.log(`[${index+1}] arg: ${typeof arg} ${arg}`)
    } else {
      if (typeName(arg) === "Array") {
        console.info(`[${index+1}] arg: ${typeName(arg)}`);
        console.log("[")
        for(const item of arg) {
          if (["string", "number", "bigint", "boolean", "Array"].includes(typeof arg)) {
            console.log(`   ${arg}`)
          } else {
            console.log(`   ${typeName(item)}`)
          }
        }
        console.log("]")
      } else {
        console.info(`[${index+1}] arg: ${typeName(arg)}`);
      }
    }
  }
}