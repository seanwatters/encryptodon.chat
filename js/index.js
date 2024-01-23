/*
encryptodon.chat is a silly tool for adding e2ee to Mastodon private mentions.

Copyright (C) 2024 sean watters

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>. 
*/

import init, { encrypt, decrypt, generate_keys } from "https://unpkg.com/encryptodon@0.1.6/encryptodon.js";

(async () => {
    await init();

    initMessageBox();
})();

function initMessageBox() {
    let message = "";

    let messageBox = document.getElementById("message-box");

    messageBox.addEventListener("keydown", (e) => {
        if (e.key == "Enter" && !e.shiftKey) {
            e.preventDefault();

            let yourPrivateKey = localStorage.getItem("PRIVATE_KEY");

            let encrypted = encrypt(message, "shzqy84N2CHuaHFogctNUyhKVOQqBa6kIqsMRxdaIDk=", yourPrivateKey);
            console.log(encrypted);
        }
    });

    messageBox.addEventListener("input", (e) => {
        let newMessage = e.target.value;
        message = newMessage;
    });
}