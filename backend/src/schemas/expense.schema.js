const { z } = require("zod");

const expenseSchema = z.object({
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  category: z.string().optional(),
  description: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format",
  }),
});

module.exports = {
  expenseSchema,
};
