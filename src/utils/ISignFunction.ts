import { PactCommand } from '@kadena/client';

export interface ISignFunction {
  <T extends PactCommand[]>(...transactions: T): Promise<T>;
}

export interface ISignSingleFunction {
  <T extends PactCommand>(transaction: T): Promise<T>;
}