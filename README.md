## Example application: 

NPM: https://www.npmjs.com/package/express-with-decorators

```javascript
import { Server, Get, Interceptor, Controller, RouteInterceptor, Middlewares, Singleton, Injectable } from 'express-with-decorators';
import express, { Request, Response, NextFunction } from 'express';
// services/UserService.ts
@Singleton([])
export class UserService{
    getAllUsers() {
        console.log('Doing sql operation...');
        return 'List of users';
    }
}
// interceptors/GetUsersInterceptor.ts
@Injectable([ UserService ])
export class GetUsersInterceptor implements RouteInterceptor {
    public constructor(
        private readonly userService: UserService
    ) { }

    before(req: Request, res: Response) {
        const users = this.userService.getAllUsers();
        console.log('Interceptor can access userService in this case ', users);
        console.log('This will run before middlewares and route closure');
    }
    
    after() {
        console.log('This will run after all middlewares and after route closure');
    }
}
// controllers/UsersController.ts
@Controller('/users', [ UserService ])
class UserController {
    public constructor(
        private readonly userService: UserService
    ) { }
    
    @Interceptor(GetUsersInterceptor)
    @Middlewares([
        (req: Request, res: Response, next: NextFunction) => { next() }
    ])
    @Get('/')
    index(request: Request, response: Response, next:NextFunction) {
        console.log('Getting all users with UserService');
        const users = this.userService.getAllUsers();
        response.write('Index page for UsersController');
        response.write(users);
        response.end();
    }

}
// core/App.ts
class ServerApplication extends Server {
    public constructor(application: Application) {
        super(application);
    }
};
const app = new ServerApplication(express());
//Mount controllers
app.mountController(UserController);

app.listen(8000)
.then(() => console.log('Server started...'))
.catch(err => console.error(err));

```
