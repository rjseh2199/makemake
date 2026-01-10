export type Agent<Input, Output> = {
  name: string;
  run: (input: Input) => Promise<Output>;
};
