import { PactCommand } from '@kadena/client';
import { ICommand, IUnsignedCommand } from '@kadena/types';

export interface ISignFunction {
  (...transactions: PactCommand[]): Promise<(ICommand | IUnsignedCommand)[]>;
}

export interface ISignSingleFunction {
  (transaction: PactCommand): Promise<ICommand | IUnsignedCommand>;
}
