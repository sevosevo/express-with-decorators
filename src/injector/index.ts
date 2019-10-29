type Class = { new(...args: any[]): any; };

class Container {

    private readonly services = new Map();
    private readonly singletons = new Map();

    public register(name: string, definition: Function, dependencies: Array<any>) {
        this.services.set(name, {definition, dependencies, singleton: false});
    }
    public singleton(name: string, definition: Function, dependencies: Array<any>) {
        this.services.set(name, {definition, dependencies, singleton: true})
    }
    public get(name: string) {
        const c = this.services.get(name);
        if(!c) throw new Error('Service not found');
        if(this.isClassDefinition(c.definition)) {
            
            if(c.singleton) {
                const singletonInstance = this.singletons.get(name);
                if(singletonInstance) {
                    return singletonInstance;
                }else {
                    const newSingletonInstance = this.createInstance(c);
                    this.singletons.set(name, newSingletonInstance);
                    return newSingletonInstance;
                }
            }

            return  this.createInstance(c);

        }
    }
    private resolveDependencies(service: any) {
        let dependencies = [];
        if(service.dependencies) {
            dependencies = service.dependencies.map((dep: any) => {
                return this.get(dep);
            });
        }
        return dependencies;
    }
    private createInstance(service: any) {
        return new service.definition(...this.resolveDependencies(service));
    }

    private isClassDefinition(definition: Function | Class) {
        return typeof definition === 'function';
    }

}

export default new Container();
export const container = new Container();