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
