import express,{Request, Response} from "express";
const app = express();
const port = 5000;
app.get("/", (req: Request, res: Response) => {
    res.send("Assignment 2 server is running after error");
})

app.listen(port, () => {
    console.log(`Assignment 2 server is running on port number ${port}`);
})
