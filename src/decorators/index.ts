import { CONTROLLER_PREFIX, CONTROLLER_ROUTES } from "../keys";
import { Response, Request } from "express";
import Class from './class';

export type HttpVerb = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options';

export interface Route {
    httpVerb: HttpVerb;
    path: string;
    closureName: string | symbol;
    interceptor: Class<RouteInterceptor> | null;
    middlewares: any[];
}
export interface RouteInterceptor {
    before ?: (request: Request, response: Response) => void;
    after ?: (request: Request, response: Response) => void;
} 
export const Method = (path: string, httpVerb: HttpVerb): MethodDecorator => {
    return (target, propertyKey, descriptor) => {
        if (!path || !httpVerb) throw new Error('Path and HttpVerb are required.');
        if(!Reflect.hasOwnMetadata(CONTROLLER_ROUTES, target.constructor)) {
            Reflect.defineMetadata(CONTROLLER_ROUTES, [], target.constructor);
        } 
        let routes = Reflect.getOwnMetadata(CONTROLLER_ROUTES, target.constructor);
        const route: Route = {
            httpVerb,
            path,
            closureName: propertyKey,
            interceptor: null,
            middlewares: []
        }
        routes.push(route);
        if (descriptor)
            return descriptor;
    }
}
export const Middlewares = (middlewares: Function[]) : MethodDecorator => {
    return (target, propertyKey, descriptor) => {
        const routes: Route[] = Reflect.getOwnMetadata(CONTROLLER_ROUTES, target.constructor)
        const route = <Route>routes.find(route => route.closureName === propertyKey);
        route.middlewares = middlewares;
        if(descriptor) 
            return descriptor;
    }
}
export const Get = (path: string): MethodDecorator => Method(path, 'get');
export const Post = (path: string): MethodDecorator => Method(path, 'post');
export const Put = (path: string): MethodDecorator => Method(path, 'put');
export const Delete = (path: string): MethodDecorator => Method(path, 'delete');
export const Patch = (path: string): MethodDecorator => Method(path, 'patch');

