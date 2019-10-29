import { container } from '../injector/index';
import { CONTROLLER_ROUTES, CONTROLLER_PREFIX } from '../keys';
import Class from './class';
import { RouteInterceptor, Route } from '.';

export const Injectable = (dependencies: Array<any>): ClassDecorator => {
    return (definition: any) => {
        container.register(definition.name, definition, dependencies.map(dep => dep.name));
    }
}
export const Singleton = (dependencies: Array<any>): ClassDecorator => {
    return (definition: any) => {
        container.singleton(definition.name, definition, dependencies.map(dep => dep.name));
    }
};
export const Controller = (prefix: string, dependencies: Array<any>): ClassDecorator => {
    return constructor => {
        container.singleton(constructor.name, constructor, dependencies.map(dep => dep.name));
        if (prefix)
            Reflect.defineMetadata(CONTROLLER_PREFIX, prefix.startsWith('/') ? prefix : '/' + prefix, constructor);
        else
            throw new Error('Prefix is required on Controller decorator.');
        if (!Reflect.getOwnMetadata(CONTROLLER_ROUTES, constructor))
            Reflect.defineMetadata(CONTROLLER_ROUTES, [], constructor);
        if (constructor)
            return constructor;
    }
}
export const Interceptor = (interceptorClass: Class<RouteInterceptor>): MethodDecorator => {
    return (target, propertyKey, descriptor) => {
        if(!interceptorClass) throw new Error('Interceptor class is required in Interceptor decorator.');
        const routes: Route[] = Reflect.getOwnMetadata(CONTROLLER_ROUTES, target.constructor)
        const route = <Route>routes.find(route => route.closureName === propertyKey);
        route.interceptor = interceptorClass;
        if(descriptor)
            return descriptor;
    }
}

















/*
export const Inject = (injectName: Function): ParameterDecorator => {
    return (definition: any, name: string | symbol, index: number) => {
        console.log('ran1', definition);
        const injectParams = Reflect.getMetadata('PARAMS', definition) || [];
        injectParams.push({
            paramName: name,
            name: injectName.toString(),
            index
        });
        console.log(injectName.toString());
        Reflect.defineMetadata('PARAMS', injectParams, definition);
    }

    export const InjectResolve = (): ClassDecorator => {
    return (definition: any): any => {
        console.log('ran2', definition)
        const paramsToInject = Reflect.getOwnMetadata('PARAMS', definition) || [];
        return class extends definition{
            constructor() {
                super();
                paramsToInject.forEach((param: any) => {
                    this[param.paramName] = container.get(param.name);
                });
            }
        }
    }
}
}*/