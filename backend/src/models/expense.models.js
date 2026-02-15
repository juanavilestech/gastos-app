const expenses = [
    {id: 1, amount: 100, category: "food"},
    {id: 2, amount: 50, category: "transport"}
];

exports.getAll = async () => {
    return expenses;
}