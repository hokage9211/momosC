const Bill = require('../models/Bill');
const DeletedBill = require('../billerModels/deletedBill');

// exports.createBill = async (req, res) => {
//     try {
        
//         const newBill = new Bill(req.body);
//         const saved = await newBill.save();
//         res.json(saved);
//     } catch (err) {
//         res.status(500).json({ error: 'Error creating bill' });
//     }
// };
exports.createBill = async (req, res) => {
    try {
        // Reject if bill was created more than 5 seconds ago
        // const billTime = new Date(req.body.createdAt).getTime();
        //  const billTime = parseInt(req.headers["x-request-timestamp"], 10);
        const clientTime = parseInt(req.headers['x-request-timestamp'], 10);
const requestAge = Date.now() - clientTime;
        // console.log("Request age is :",requestAge)

   if (requestAge > 4000) {
    console.log("inside create bill ,request expired")
            return res.status(408).json({ error: 'Request too old. Ignored.' });
        }

                // const requestAge = Date.now() - new Date(req.headers['x-request-timestamp']).getTime();
        // if (requestAge > 5000) {
        //     console.log("time was "+ requestAge)
        //     console.log("error ran in if statement")

            // return res.status(408).json({ error: 'Request too old. Ignored.' });
        

//         const billTime= new Date(req.headers['x-request-timestamp']).getTime()

//             //  const requestAge = Date.now() - new Date(req.headers['x-request-timestamp']).getTime();
//         // if (requestAge > 2000) {
        
//         console.log(billTime)

//         const now = Date.now();
//         const maxDelay = 5000; // 5 seconds

// // (  const requestAge = Date.now() - new Date(req.headers['x-request-timestamp']).getTime();
// //         if (requestAge > 2000) {
// //             return res.status(408).json({ error: 'Request too old. Ignored.' });
// //         }
// // )



//         if (isNaN(billTime)) {
//             return res.status(400).json({ error: "Invalid createdAt timestamp" });
//         }
// console.log(now - billTime,"jojo")

//         if (now - billTime > maxDelay) {
//             console.log("error ran in if statement")
//             return res.status(408).json({ error: "Bill request expired" });
//         }

        const newBill = new Bill(req.body);
        const saved = await newBill.save();
        res.json(saved);

    } catch (err) {
        res.status(500).json({ error: 'Error creating bill' });
    }
};


// const dodo=async()=>{
//     const boro=await Bill.find({deleted:false}).sort({createdAt:-1});
//     console.log(boro)

// }
// dodo()

exports.getBills = async (req, res) => {
    try {
        // const bills = await Bill.find({ $or: [{ deleted: false }, { deletedBy: { $ne: 'biller' } }] })
        //     .sort({ createdAt: -1 });
        const bills = await Bill.find({ deleted: false })
            .sort({ createdAt: -1 });
        res.json(bills);
    } catch (err) {
        console.log("error fetching bills")
        res.status(500).json({ error: 'Error fetching bills' });
    }
};
// exports.getBills = async (req, res) => {
//     try {
//         const bills = await Bill.find().sort({ createdAt: -1 });
//         res.json(bills);
//     } catch (err) {
//         res.status(500).json({ error: 'Error fetching bills' });
//     }
// };



exports.togglePayment = async (req, res) => {
    try {
        // Reject if request is too old (over 2 seconds)
        // const requestAge = Date.now() - new Date(req.headers['x-request-timestamp']).getTime();
        // console.log("Request age is :",requestAge)
     

        const clientTime = parseInt(req.headers['x-request-timestamp'], 10);
const requestAge = Date.now() - clientTime;
        // console.log("Request age is :",requestAge)
console.log(requestAge)
   if (requestAge > 4000) {
    
    console.log("inside toggle function request expired")
    console.log("40 ran inside timing")
            return res.status(408).json({ error: 'Request too old. Ignored.' });
        }
        const bill = await Bill.findById(req.params.id);
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
console.log(bill.payment)
        bill.payment = bill.payment === 'Paid' ? 'Not Paid' : 'Paid';
        await bill.save();
        res.json(bill);
    } catch (err) {
        console.log("bills toggle function ran")
        res.status(500).json({ error: 'Error toggling payment' });
    }
};

// Delete Bill with delayed request protection
exports.deleteBill = async (req, res) => {
    try {
                const clientTime = parseInt(req.headers['x-request-timestamp'], 10);
const requestAge = Date.now() - clientTime;
        // console.log("Request age is :",requestAge)

   if (requestAge > 4000) {
    console.log("delete function reqeust expired")

            return res.status(408).json({ error: 'Request too old. Ignored.' });
        }
        // Reject if request is too old (over 2 seconds)
        // const requestAge = Date.now() - new Date(req.headers['x-request-timestamp']).getTime();
        // if (requestAge > 2000) {
        //     console.log("inside delete function , request expired")

        //     return res.status(408).json({ error: 'Request too old. Ignored.' });
        // }

        // const bill = await Bill.findByIdAndDelete(req.params.id);
        const bill = await Bill.findById(req.params.id);
        if (!bill) return res.status(404).json({ error: 'Bill not found' });

                bill.deleted = true;
        bill.deletedBy = "biller";
           await bill.save();
           console.log(bill,"this is the bill")
             res.json({ success: true });
        // const deletedBill = new DeletedBill({
        //     originalBillId: bill._id,
        //     items: bill.items,
        //     total: bill.total
        // });
        // await deletedBill.save();

        // res.json({ success: true });
    } catch (err) {
        console.log("bill delete function catch ran")
        res.status(500).json({ error: 'Error deleting bill' });
    }
};

// exports.togglePayment = async (req, res) => {
//     try {
//         const bill = await Bill.findById(req.params.id);
//         if (!bill) return res.status(404).json({ error: 'Bill not found' });

//         bill.payment = bill.payment === 'Paid' ? 'Not Paid' : 'Paid';
//         await bill.save();
//         res.json(bill);
//     } catch (err) {
//         res.status(500).json({ error: 'Error toggling payment' });
//     }
// };

// exports.deleteBill = async (req, res) => {
//     try {
//         const bill = await Bill.findByIdAndDelete(req.params.id);
//         if (!bill) return res.status(404).json({ error: 'Bill not found' });

//         const deletedBill = new DeletedBill({
//             originalBillId: bill._id,
//             items: bill.items,
//             total: bill.total
//         });
//         await deletedBill.save();

//         res.json({ success: true });
//     } catch (err) {
//         res.status(500).json({ error: 'Error deleting bill' });
//     }
// };
