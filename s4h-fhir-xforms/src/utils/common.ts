export const first  = <A>([ a, _ ]: [A, unknown]): A => a;

export const second = <B>([ _, b ]: [unknown, B]): B => b;

export function leftPadZero (width: number, n: number): string {
    return ("" + n).padStart(width, "0");
}
