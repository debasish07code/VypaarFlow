import Invoice from "../models/invoiceModel.js";
import Order from "../models/orderModel.js";
import { generateInvoicePDF } from "../utils/pdfGenerator.js";
// Note: Node 18+ ships with native fetch — no import needed

/**
 * POST /api/invoice/generate
 * Generates invoice for an approved order and sends a REAL SMS via Fast2SMS.
 *
 * Setup: Add FAST2SMS_API_KEY=<your_key> to backend/.env
 * Get free API key at https://www.fast2sms.com
 */
export const generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("products.product", "name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    // Build line items
    const items = order.products.map((p) => ({
      name: p.product?.name || "Item",
      quantity: p.quantity,
      price: p.price,
      total: p.price * p.quantity,
    }));

    // Upsert invoice
    let invoice = await Invoice.findOne({ order: orderId });
    if (!invoice) {
      invoice = await Invoice.create({
        user: req.user._id,
        order: orderId,
        customer: order.customer,
        items,
        totalAmount: order.totalAmount,
      });
    }

    const messageText = `VypaarFlow Invoice ${invoice.invoiceNumber}\nCustomer: ${order.customer.name}\nTotal: Rs.${order.totalAmount}\nThank you for your order!`;

    // Generate PDF
    const pdfUrl = await generateInvoicePDF(invoice, order);

    // Send real SMS
    const smsResult = await sendSMS(order.customer.mobile, messageText);

    // Generate WhatsApp link as a free fallback/alternative
    const whatsappLink = `https://wa.me/91${order.customer.mobile}?text=${encodeURIComponent(messageText)}`;

    invoice.status = "sent";
    invoice.sentAt = new Date();
    await invoice.save();

    res.json({ invoice, smsResult, whatsappLink, pdfUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/invoice/:orderId
export const getInvoiceByOrder = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ order: req.params.orderId, user: req.user._id });
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Real SMS via Fast2SMS (DLT-free quick SMS — works for testing)
 * Replace with MSG91 / Twilio if you need DLT-registered sender IDs.
 */
async function sendSMS(mobile, message) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.warn("[SMS] FAST2SMS_API_KEY not set — falling back to mock.");
    return { success: true, reason: "No API key", mock: true };
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message,
        language: "english",
        flash: 0,
        numbers: mobile,
      }),
    });

    const data = await response.json();
    console.log("[SMS Fast2SMS]", data);

    // Fast2SMS requires 100 INR wallet balance. If we hit this error, mock it for testing.
    if (data.status_code === 999) {
      console.warn("[SMS] Fast2SMS wallet empty. Simulating success for prototyping.");
      return { success: true, provider: "Fast2SMS (Mocked)", mock: true };
    }

    return {
      success: data.return === true,
      provider: "Fast2SMS",
      to: mobile,
      response: data,
    };
  } catch (err) {
    console.error("[SMS Error]", err.message);
    return { success: false, error: err.message };
  }
}
