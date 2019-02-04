interface Cache {
    [key: string]: any;
}

export class MemoizeCache {
    private cache: Cache = {};

    public has(key: string) {
        return key in this.cache;
    }

    public get(key: string) {
        return this.cache[key];
    }

    public set(key: string, value: any) {
        console.log('set', key, value);
        this.cache[key] = value;
    }

    public delete(key: string) {
        if (this.has(key)) {
            delete this.cache[key];
        }
    }
}