const Bill = require("../models/Bill.js");
const ArchivedBill = require("../models/ArchivedBill");
const { archiveTodayBillsAndSendReport } = require("../services/cronService");

exports.getTodayBills = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // const bills = await Bill.find({ createdAt: { $gte: start, $lte: end } }).sort({ createdAt: -1 });
    const bills = await Bill.find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: -1 })
      .select("items total payment createdAt updatedAt deleted deletedBy");
    console.log(bills,"bills");

    const summary = {
      totalSales: 0,
      unpaidCount: 0,
      unpaidAmount: 0,
      deletedCount: 0,
    };

    const detailedBills = bills.map((bill) => {
      const isDeleted = bill.deleted;
      const isPaid = bill.payment === "Paid";

      if (!isDeleted) summary.totalSales += bill.total;
      if (!isDeleted && !isPaid) {
        summary.unpaidCount += 1;
        summary.unpaidAmount += bill.total;
      }
      if (isDeleted) summary.deletedCount += 1;

      return {
        _id: bill._id,
        items: bill.items,
        total: bill.total,
        payment: bill.payment,
        deleted: bill.deleted,
        deletedBy: bill.deletedBy,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      };
    });

    res.json({ bills: detailedBills, summary });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

exports.runCronManually = async (req, res) => {
  try {
    await archiveTodayBillsAndSendReport();
    res.json({ message: "Manual cron completed successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
exports.liveItemWiseSales=async(req,res)=>{
   try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's bills (non-archived)
    const bills = await Bill.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Aggregate item-wise data
    const itemsMap = {};
    let totalRevenue = 0;
    let totalQuantity = 0;

    bills.forEach(bill => {
      if (!bill.deleted) { // Only count non-deleted bills
        bill.items.forEach(item => {
          const key = item.name;
          if (!itemsMap[key]) {
            itemsMap[key] = {
              name: item.name,
              price: item.price,
              quantity: 0,
              totalRevenue: 0,
              category: getItemCategory(item.name) // Same helper function
            };
          }
          
          itemsMap[key].quantity += item.quantity;
          itemsMap[key].totalRevenue += item.price * item.quantity;
          
          totalQuantity += item.quantity;
          totalRevenue += item.price * item.quantity;
        });
      }
    });

    res.json({
      items: itemsMap,
      summary: {
        totalRevenue,
        totalQuantity,
        uniqueItems: Object.keys(itemsMap).length,
        totalBills: bills.filter(bill => !bill.deleted).length
      }
    });

  } catch (error) {
    console.error('Error generating live items report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
exports.itemWiseSales=async(req,res)=>{
    try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Calculate date range for the selected day
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Get archived bills for the selected date
    const bills = await ArchivedBill.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    });

    // Aggregate item-wise data
    const itemsMap = {};
    let totalRevenue = 0;
    let totalQuantity = 0;

    bills.forEach(bill => {
      if (!bill.deleted) { // Only count non-deleted bills
        bill.items.forEach(item => {
          const key = item.name;
          if (!itemsMap[key]) {
            itemsMap[key] = {
              name: item.name,
              price: item.price,
              quantity: 0,
              totalRevenue: 0,
              category: getItemCategory(item.name) // Helper function to categorize
            };
          }
          
          itemsMap[key].quantity += item.quantity;
          itemsMap[key].totalRevenue += item.price * item.quantity;
          
          totalQuantity += item.quantity;
          totalRevenue += item.price * item.quantity;
        });
      }
    });

    res.json({
      items: itemsMap,
      summary: {
        totalRevenue,
        totalQuantity,
        uniqueItems: Object.keys(itemsMap).length
      }
    });

  } catch (error) {
    console.error('Error generating items report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}

function getItemCategory(itemName) {
  const lowerName = itemName.toLowerCase();
  
  if (lowerName.includes('pizza')) return 'Pizza';
  if (lowerName.includes('burger')) return 'Burger';
  if (lowerName.includes('sandwich')) return 'Sandwich';
  if (lowerName.includes('wrap')) return 'Wrap';
  if (lowerName.includes('fries')) return 'Fries';
  if (lowerName.includes('garlic bread')) return 'Garlic Bread';
  if (lowerName.includes('sub')) return 'Sub';
  
  return 'Other';
}
exports.getArchivedBillsByDate = async (req, res) => {
  try {
    const date = new Date(req.query.date);
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const bills = await ArchivedBill.find({
      createdAt: {
        $gte: date,
        $lt: nextDate,
      },
    })
      .sort({ createdAt: -1 })
      .select("items total payment createdAt updatedAt deleted deletedBy");

    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.togglePayment = async (req, res) => {
  try {


    
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    bill.payment = bill.payment === "Paid" ? "Not Paid" : "Paid";
    await bill.save();
    res.json({ message: "Payment status updated" });
  } catch (err) {
    res.status(500).json({ error: "Toggle failed" });
  }
};

exports.deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    bill.deleted = true;
    bill.deletedBy = "admin";
    await bill.save();
    res.json({ message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

exports.undeleteBill = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Bill not found" });

    bill.deleted = false;
    bill.deletedBy = null;
    await bill.save();
    res.json({ message: "Bill undeleted" });
  } catch (err) {
    res.status(500).json({ error: "Undelete failed" });
  }
};
