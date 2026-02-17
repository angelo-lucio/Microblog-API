import { type Express, type Request, type Response } from "express";
import { postsTable, usersTable } from "../db/schema";
import { db } from "../database";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const initializeAuthAPI = (app: Express) => {

    const jwtSecret = process.env.JWT_SECRET
     if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables")}

    app.post('/api/auth/register', async (req: Request, res: Response) => {
        const { username, password } = req.body
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(password, salt);

        // insert new user into the database
        const newUser = await db.insert(usersTable).values({ username: username, password: passwordHash });
        res.send({ feedback: `User ${ username } registered successfully!`})
    });

    app.post('/api/auth/login', async (req: Request, Res: Response) => {
      const { username, password } = req.body
      const user = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
      const checkPassword = user[0]?.id ? bcrypt.compareSync(password, user[0].password) : false;   
    
    if (!checkPassword) {
        Res.status(401).send({ feedback: "wrong password or wrong username"})
        return
    }  else  {
        Res.status(200).send({ feedback: "Login succesful",
            jwt: jwt.sign({ id: user[0]?.id }, jwtSecret, { expiresIn: "1h" }),
         })
        return
    }
    })
}