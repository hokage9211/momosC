// require('dotenv').config();
// const mongoose = require('mongoose');
// const Bill = require('./models/bill');

// const run = async () => {
//     await mongoose.connect(process.env.MONGO_URI);

//     const start = new Date();
//     start.setHours(0, 0, 0, 0);

//     // await Bill.deleteMany({ createdAt: { $gte: start } });
//     await Bill.deleteMany({ createdAt: { $gte: todayStart, $lte: todayEnd } });


const mongoose = require('mongoose');
const Bill = require('./models/bill');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Delete today's existing bills
    await Bill.deleteMany({ createdAt: { $gte: todayStart, $lte: todayEnd } });


    const dummyBills = [
        {
            items: [
                { serial: 1, name: 'Burger', price: 100, quantity: 2, image: 1 },
                { serial: 2, name: 'Coke', price: 50, quantity: 1, image: 2 }
            ],
            total: 250,
            payment: 'Paid'
        },
        {
            items: [
                { serial: 3, name: 'Pizza', price: 300, quantity: 1, image: 3 }
            ],
            total: 300,
            payment: 'Not Paid'
        },
        {
            items: [
                { serial: 4, name: 'Pasta', price: 200, quantity: 2, image: 4 }
            ],
            total: 400,
            payment: 'Paid',
            deleted: true,
            deletedBy: 'admin'
        }
    ];

    await Bill.insertMany(dummyBills);
    console.log('Dummy bills inserted');
    process.exit();
};

run();
