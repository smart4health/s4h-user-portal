/**
 * A signal can be used to synchronize a batch of promises.
 * Create a signal and `await` or `.then` to the `signal` property.
 * Use the `trigger` function to resolve the signal and thus continue all (a)waiting promises.
 */
export type Signal = {
    /** A pending promise which can be resolved by calling trigger. */
    readonly signal:  Promise<void>;
    /** Calling this function resolves the pending signal promise. */
    readonly trigger: () => void;
};

/**
 * Creates a new [[Signal]] with the underlying promise pending.
 *
 * @returns new signal
 */
export function createSignal (): Signal {
    let trigger: () => void;

    const signal = new Promise<void>((resolve, _reject) => { trigger = resolve; });

    return { signal, trigger };
}
