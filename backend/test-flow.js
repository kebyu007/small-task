import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

async function run() {
  try {
    console.log("1. Creating product...");
    const pRes = await api.post('/products', {
      name: "Test Phone " + Date.now(),
      price: 5000000,
      stock_qty: 10
    });
    const product = pRes.data.data;
    console.log("Product created:", product.id);

    console.log("2. Creating customer...");
    const cRes = await api.post('/customers', {
      full_name: "Test User",
      phone: "+99890" + Math.floor(1000000 + Math.random() * 9000000),
      credit_limit: 15000000
    });
    const customer = cRes.data.data;
    console.log("Customer created:", customer.id);

    console.log("3. Calculating contract...");
    const calcRes = await api.post('/contracts/calculate', {
      customer_id: customer.id,
      items: [{ product_id: product.id, qty: 1 }],
      months: 6,
      down_payment: 1000000
    });
    console.log("Calculate success");

    console.log("4. Creating contract...");
    const conRes = await api.post('/contracts', {
      customer_id: customer.id,
      items: [{ product_id: product.id, qty: 1 }],
      months: 6,
      down_payment: 1000000
    });
    const contract = conRes.data.data;
    console.log("Contract created:", contract.id);

    console.log("5. Making a payment...");
    const payRes = await api.post(`/contracts/${contract.id}/payments`, {
      amount: 500000,
      idempotency_key: crypto.randomUUID()
    });
    console.log("Payment success, payment id:", payRes.data.data.id);

    console.log("6. Checking overdue report (Dashboard)...");
    const repRes = await api.get('/reports/overdue');
    console.log("Overdue report success, count:", repRes.data.count);

    // Give RabbitMQ a second to process notifications
    await new Promise(r => setTimeout(r, 1500));

    console.log("7. Checking notifications...");
    const notifRes = await api.get(`/customers/${customer.id}/notifications`);
    console.log("Notifications for customer:", notifRes.data.data.length);
    notifRes.data.data.forEach(n => console.log(" -", n.type, n.message));

    console.log("ALL TESTS PASSED SUCCESSFULLY! 🎉");
  } catch (error) {
    console.error("TEST FAILED!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error);
    }
  }
}

run();
