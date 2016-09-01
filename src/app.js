/* @flow */
import __polyfill from "babel-polyfill";
import { setConnectionString } from "./db";
import host from "./host";

setConnectionString("mongodb://localhost:27017/newflash-db")
const port = process.argv[2] || 9001;
host(parseInt(port));
