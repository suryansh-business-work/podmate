import type { GraphQLContext } from '../auth/auth.models';
import type { CreateBankAccountInput, UpdateBankAccountInput } from './bankAccount.models';
import { requireAuth } from '../auth/auth.services';
import * as bankAccountService from './bankAccount.services';
import { validateCreateBankAccount, validateUpdateBankAccount } from './bankAccount.validators';

const bankAccountResolvers = {
  Query: {
    myBankAccount: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return bankAccountService.getBankAccountByUserId(auth.userId);
    },
  },
  Mutation: {
    addBankAccount: async (
      _: unknown,
      { input }: { input: CreateBankAccountInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      const validated = validateCreateBankAccount(input);
      return bankAccountService.addBankAccount(auth.userId, validated);
    },
    updateBankAccount: async (
      _: unknown,
      { input }: { input: UpdateBankAccountInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      const validated = validateUpdateBankAccount(input);
      return bankAccountService.updateBankAccount(auth.userId, validated);
    },
    deleteBankAccount: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return bankAccountService.deleteBankAccount(auth.userId);
    },
  },
};

export default bankAccountResolvers;
