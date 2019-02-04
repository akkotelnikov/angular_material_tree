import * as memoize from 'fast-memoize/src/index.js';
import { MemoizeCache } from './memoize-cache';

const memoizedFn = (...args) => {
    const callbackFn = args[0];
    const callbackArgs = args.slice(1);
    return callbackFn(...callbackArgs);
};

const memoizeSerializer = args => {
    const serialized = Array.from(args).map(x => {
        if (typeof x === 'function') {
            return x + '';
        }
        return x;
    });
    return JSON.stringify(serialized);
};

const memoizeCache: MemoizeCache = new MemoizeCache();

export const memoized = memoize(memoizedFn, {
    cache: {
        create() {
            return memoizeCache;
        }
    },
    serializer: memoizeSerializer
});

export const memoizedRemoveFromCache = (args: Array<any>) => {
    const key = memoizeSerializer(args);
    memoizeCache.delete(key);
};