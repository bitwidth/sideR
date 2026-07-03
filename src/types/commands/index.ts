
export interface CommandShape {
  inputString: string;
  command: string;
  args: any[] | undefined;
  modifiers?: CommandShape[];
}