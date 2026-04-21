/* TypeScript inherited a % operation that does NOT return a true (Euclidean) modulo. This 
   function does a true modulo operation and returns the modulo/residue. 

   In true modulo arithmetic, recall that given two integers, a and b, b != 0, there exists 
   unique integers q and r, 0 <= r < |b|, such that
     
       a = b * q + r

   where a is the dividend, b is the divisor, q is the quotient, and r is the residue. 
   For example, 7 % 2 would be

       7 = 2 * q + r
       7 = 2 * 3 + 1

   This is the Euclidean division theorem. You find the largest multiple of b that is less than
   or equal to a. You do a / b, round the result down to the nearest integer to get q (that is,
   use a floor function), and solve for r. For negatives:

       a = -7, b = -2
       -7 = -2 * 4 + 1

       a = -7, b = 2
       -7 = 2 * -4 + 1

       a = 7, b = -2
       7 = -2 * -3 + 1

    In TypeScript, % is better known as the Remainder operator, not the modulo operator. The sign
    of the result always matches the sign of the dividend. For the same formula
    
        a = b * q + r,
    
    q is rounded toward 0 and r must have the same sign as a. So we have:

       a = 7, b = 2
       7 = 2 * 3 + 1

       a = -7, b = -2
       -7 = -2 * 3  - 1

       a = -7, b = 2
       -7 = 2 * -3 - 1

       a = 7, b = -2
       7 = -2 * -3 + 1

    You do a / b, drop everything after the decimal point for that result to get q, and solve for r.

    TLDR: When finding q and r for a = b * q + r, after doing (a / b) = q, you
    FLOOR q in real modulo arithmetic and TRUNCATE q in TypeScript. Then plug the value of q you get
    into a = b * q + r in either case to get r.
*/

export function modEuclidean(a: number, b: number) {
    return ((a % b) + b) % b;
}

export function getLastMonthAndYear(locale: string = "en-US"): string {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);

    const monthName = lastMonth.toLocaleString(locale, { month: "long" });
    const year = lastMonth.getFullYear();

    return `${monthName} ${year}`;
}