import { IUseCase } from '../Interfaces/IUSeCase';
import { TRPCErrorAdapter } from './TRPCErrorAdapter';

export const executeUseCase = async <TOutput = void, TInput = unknown>(
  useCase: IUseCase<TOutput, TInput>,
  input?: TInput,
) => {
  const errorAdapter = new TRPCErrorAdapter();
  try {
    return await useCase.execute(input);
  } catch (error) {
    console.log(error);
    throw errorAdapter.adapt(error);
  }
};
