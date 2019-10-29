export interface Class<T> extends Function { new (...args: any[]): T; }
export default Class;