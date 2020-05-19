export class User {
    userId: number;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    role: number;
    roleName?: string;
    constructor(userId: number, username: string, password: string, firstName: string, lastName: string, email: string, role: number, roleName?: string) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.userId = userId;
        this.roleName = roleName;
    }


}