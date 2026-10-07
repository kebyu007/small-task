export const generateSchedule = (financed_amount, months, startDate = new Date()) => {
  const schedule = [];
  const base_payment = Math.floor(financed_amount / months);
  const remainder = financed_amount % months;
  
  let currentDate = new Date(startDate);
  
  for (let i = 1; i <= months; i++) {
    currentDate.setMonth(currentDate.getMonth() + 1);
    const amount = i === months ? base_payment + remainder : base_payment;
    
    schedule.push({
      seq_no: i,
      due_date: currentDate.toISOString().split('T')[0],
      amount: amount
    });
  }
  return schedule;
};
