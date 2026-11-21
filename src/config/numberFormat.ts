import formatter from "format-number";

export const formatNumber = (number: number | string, prefix = "$") => {
  const numericVal = typeof number === "string" ? Number(number) || 0 : (number ?? 0);
  return formatter({ prefix, round: 2, padRight: 2 })(numericVal);
};

