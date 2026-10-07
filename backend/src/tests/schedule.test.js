import { generateSchedule } from "../utils/schedule.util.js";

describe("generateSchedule", () => {
  const dummyDate = new Date("2026-01-01");

  test("Oddiy bo'linish (Qoldiqsiz)", () => {
    const schedule = generateSchedule(15000, 3, dummyDate);

    expect(schedule.length).toBe(3);
    expect(schedule[0].amount).toBe(5000);
    expect(schedule[1].amount).toBe(5000);
    expect(schedule[2].amount).toBe(5000);
  });

  test("Qoldiqli bo'linish (Oxirgi oyga o'tishi kafolati)", () => {
    const schedule = generateSchedule(10000, 3, dummyDate);

    expect(schedule.length).toBe(3);
    expect(schedule[0].amount).toBe(3333);
    expect(schedule[1].amount).toBe(3333);
    expect(schedule[2].amount).toBe(3334);

    const total = schedule.reduce((sum, item) => sum + item.amount, 0);
    expect(total).toBe(10000);
  });

  test("Uzoq muddatli (12 oy) to'g'ri ishlashi", () => {
    const schedule = generateSchedule(100000, 12, dummyDate);

    expect(schedule.length).toBe(12);
    expect(schedule[0].seq_no).toBe(1);
    expect(schedule[11].seq_no).toBe(12);
    expect(schedule[0].amount).toBe(8333);
    expect(schedule[11].amount).toBe(8337);

    const total = schedule.reduce((sum, item) => sum + item.amount, 0);
    expect(total).toBe(100000);
  });

  test("Yillar almashganda sanalar (due_date) to'g'ri hisoblanishi", () => {
    const octDate = new Date("2026-10-15");
    const schedule = generateSchedule(60000, 6, octDate);

    expect(schedule[0].due_date).toBe("2026-11-15");
    expect(schedule[1].due_date).toBe("2026-12-15");
    expect(schedule[2].due_date).toBe("2027-01-15");
    expect(schedule[5].due_date).toBe("2027-04-15");
  });

  test("Juda kichik summalar (Qarz oylardan ham kam bo'lsa)", () => {
    const schedule = generateSchedule(2, 3, dummyDate);

    expect(schedule.length).toBe(3);
    expect(schedule[0].amount).toBe(0);
    expect(schedule[1].amount).toBe(0);
    expect(schedule[2].amount).toBe(2);

    const total = schedule.reduce((sum, item) => sum + item.amount, 0);
    expect(total).toBe(2);
  });
});
