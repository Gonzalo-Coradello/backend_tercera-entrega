import express from "express";
import http from "http";
import productsRouter from "./routes/products.router.js";
import viewsRouter from "./routes/views.router.js";
import cartsRouter from "./routes/carts.router.js";
import chatRouter from "./routes/chat.router.js";
import handlebars from "express-handlebars";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import sessionsRouter from "./routes/sessions.router.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import { passportCall, authorization } from "./middleware/auth.js";
import session from "express-session";
import config from "./config/config.js";
import { createMessage } from "./controllers/chat.controller.js";

const { PORT, SESSION_SECRET, COOKIE_SECRET, MONGO_URI, DB_NAME } = config;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(COOKIE_SECRET));
initializePassport();
app.use(passport.initialize());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.session());

// Configurando el motor de plantillas
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));

// Configuración de rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", passportCall("current"), authorization("user"), cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/chat", passportCall("current"), authorization("user"), chatRouter);
app.use("/", viewsRouter);

// Conectando mongoose con Atlas e iniciando el servidor
mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URI, { dbName: DB_NAME }, (error) => {
  if (error) {
    console.log("Can't connect to the DB");
    return;
  }

  console.log("DB connected");
  server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  server.on("error", (e) => console.log(e));
});

// Websockets chat
io.on("connection", createMessage(io));
