class DateFormatter {
  private destructureDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return { year, month, day };
  }

  public static ymd(date: Date, delimiter: string) {
    const { year, month, day } = new DateFormatter().destructureDate(date);
    return `${year}${delimiter}${month}${delimiter}${day}`;
  }
  public static dmy(date: Date, delimiter: string) {
    const { year, month, day } = new DateFormatter().destructureDate(date);
    return `${day}${delimiter}${month}${delimiter}${year}`;
  }
  public static mdy(date: Date, delimiter: string) {
    const { year, month, day } = new DateFormatter().destructureDate(date);
    return `${month}${delimiter}${day}${delimiter}${year}`;
  }
}

export default DateFormatter;
