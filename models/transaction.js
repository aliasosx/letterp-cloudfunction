module.exports.TransactionsHistory = () => {
    id: string;
    foodId: Number;
    orderId: Number;
    quantity: Number;
    price: Number;
    total: Number;
    orderDate: Date;
    paymentMethod: Object; // Cash , Bank , QR with Acq name
    refno: string;
}