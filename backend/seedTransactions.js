import mongoose from "mongoose";
import dotenv from "dotenv";
import Transaction from "./models/Transaction.js";
import User from "./models/userModel.js";

dotenv.config();

const transactions = [
  { amount: 12500, type: "income",  category: "Sales" },
  { amount: 3200,  type: "expense", category: "Rent" },
  { amount: 8750,  type: "income",  category: "Sales" },
  { amount: 1500,  type: "expense", category: "Utilities" },
  { amount: 5400,  type: "income",  category: "Services" },
  { amount: 2200,  type: "expense", category: "Supplies" },
  { amount: 9800,  type: "income",  category: "Sales" },
  { amount: 4100,  type: "expense", category: "Marketing" },
  { amount: 6300,  type: "income",  category: "Sales" },
  { amount: 1800,  type: "expense", category: "Transport" },
  { amount: 11000, type: "income",  category: "Sales" },
  { amount: 3500,  type: "expense", category: "Salaries" },
  { amount: 7200,  type: "income",  category: "Services" },
  { amount: 950,   type: "expense", category: "Utilities" },
  { amount: 4800,  type: "income",  category: "Sales" },
  { amount: 2700,  type: "expense", category: "Supplies" },
  { amount: 13500, type: "income",  category: "Sales" },
  { amount: 1200,  type: "expense", category: "Transport" },
  { amount: 5900,  type: "income",  category: "Services" },
  { amount: 3800,  type: "expense", category: "Marketing" },
  { amount: 8200,  type: "income",  category: "Sales" },
  { amount: 2100,  type: "expense", category: "Utilities" },
  { amount: 6700,  type: "income",  category: "Sales" },
  { amount: 4500,  type: "expense", category: "Salaries" },
  { amount: 9100,  type: "income",  category: "Services" },
  { amount: 1600,  type: "expense", category: "Supplies" },
  { amount: 7800,  type: "income",  category: "Sales" },
  { amount: 3100,  type: "expense", category: "Rent" },
  { amount: 5200,  type: "income",  category: "Sales" },
  { amount: 2400,  type: "expense", category: "Transport" },
  { amount: 10500, type: "income",  category: "Sales" },
  { amount: 1900,  type: "expense", category: "Utilities" },
  { amount: 6100,  type: "income",  category: "Services" },
  { amount: 3300,  type: "expense", category: "Marketing" },
  { amount: 8900,  type: "income",  category: "Sales" },
  { amount: 2600,  type: "expense", category: "Supplies" },
  { amount: 4400,  type: "income",  category: "Sales" },
  { amount: 1400,  type: "expense", category: "Transport" },
  { amount: 7500,  type: "income",  category: "Services" },
  { amount: 5000,  type: "expense", category: "Salaries" },
  { amount: 11800, type: "income",  category: "Sales" },
  { amount: 2300,  type: "expense", category: "Utilities" },
  { amount: 6500,  type: "income",  category: "Sales" },
  { amount: 1700,  type: "expense", category: "Supplies" },
  { amount: 9400,  type: "income",  category: "Services" },
  { amount: 3600,  type: "expense", category: "Marketing" },
  { amount: 5700,  type: "income",  category: "Sales" },
  { amount: 2000,  type: "expense", category: "Transport" },
  { amount: 8400,  type: "income",  category: "Sales" },
  { amount: 1100,  type: "expense", category: "Utilities" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const user = await User.findOne();
  if (!user) {
    console.error("No user found. Please create a user first.");
    process.exit(1);
  }
  console.log(`Seeding for user: ${user.email}`);

  const start = new Date("2025-03-11");
  const end = new Date();
  const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

  const docs = transactions.map((tx, i) => {
    const dayOffset = Math.floor((i / transactions.length) * totalDays);
    const date = new Date(start);
    date.setDate(date.getDate() + dayOffset);
    return { ...tx, userId: user._id, date };
  });

  await Transaction.insertMany(docs);
  console.log(`✅ Inserted ${docs.length} transactions from ${start.toDateString()} to ${end.toDateString()}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
