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

const PHRASES = [
    "pachyderm goes private. 🦣",
    "encrypt your shit. 🙊",
    "toot quietly. 🥷🏻",
];

(async () => {
    await init();

    pickAndSetPhrase();

    const isLoggedIn = getIsLoggedIn();

    initSignin(isLoggedIn);
    initLogout(isLoggedIn);

    if (isLoggedIn) {
        initMessageBox();
    } else {
        getAccessToken();
        // todo: check the URL for the code if this is a redirect
    }

})();

function pickAndSetPhrase() {
    document.getElementById('catchphrase').textContent = PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

function getIsLoggedIn() {
    const accessToken = localStorage.getItem("ACCESS_TOKEN");
    return !!accessToken;
}

function getPasscode(msg) {
    const passcode = sessionStorage.getItem("PASSCODE");
    if (passcode) {
        return passcode;
    } else {
        const requestedPasscode = prompt(msg);
        sessionStorage.setItem("PASSCODE", requestedPasscode);

        return requestedPasscode;
    }
}

function initSignin(isLoggedIn) {
    const signinEl = document.getElementById('signin');

    if (!isLoggedIn) {
        signinEl.addEventListener("click", async () => {
            const homeServer = prompt("please enter your home server: https://");
        
            localStorage.setItem("HOME_SERVER", homeServer);
        
            const res = await fetch(`https://${homeServer}/api/v1/apps`, {
                method: 'POST',
                body: JSON.stringify({
                    client_name: 'encryptodon',
                    redirect_uris: 'https://encryptodon.chat',
                    scopes: 'read write push',
                    website: 'https://encryptodon.chat',
                }),
            });
        
            const json = await res.json();

            const passcode = getPasscode("please create a passcode");
        
            // todo: make both secret by encrypting with passcode
            localStorage.setItem("CLIENT_ID", json.client_id);
            localStorage.setItem("CLIENT_SECRET", json.client_secret);
        
            window.location.replace(
                `https://${homeServer}/oauth/authorize?client_id=${json.client_id}
                &scope=read+write+push
                &redirect_uri=https://encryptodon.chat
                &response_type=code`
            );
        })
    } else {
        signinEl.style.display = 'none';
    }
}

function initLogout(isLoggedIn) {
    const logoutEl = document.getElementById("logout");

    if (isLoggedIn) {
        logoutEl.style.display = 'block';

        logoutEl.addEventListener("click", () => {
            // todo: wipe out all localStorage variables
            window.location.reload();
        });
    }
}

async function getAccessToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        const passcode = getPasscode("please enter your passcode");

        // todo: decrypt with passcode
        const clientId = localStorage.getItem("CLIENT_ID");
        const clientSecret = localStorage.getItem("CLIENT_SECRET");
    
        const res = await fetch(`https://${homeServer}/oauth/token`, {
            method: 'POST',
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: 'https://encryptodon.chat',
                grant_type: 'authorization_code',
                code,
                scope: 'read write push',
            }),
        });
    
        const json = await res.json();
    
        // todo: make secret by encrypting with passcode
        localStorage.setItem("ACCESS_TOKEN", json.access_token);

        window.location.reload();
    }
}

function showPubKey() {

}

function addUser() {

}

function searchChats() {
    // ?? indexes are encrypted with the private key when they are not
    // ?? being used. they are momentarily decrypted, traversed, and then
    // ?? re-encrypted.
}

function popChatSettings() {

}

function popUserSettings() {

}

function getChatPreviews() {

}

function selectChat() {

}

function getChatMessages() {

}

function initMessageBox() {
    let message = "";

    let messageBox = document.getElementById("message-box");

    messageBox.addEventListener("keydown", async (e) => {
        if (e.key == "Enter" && !e.shiftKey) {
            e.preventDefault();

            const yourPrivateKey = localStorage.getItem("YOUR_PRIVATE_KEY");
            const theirPublicKey = localStorage.getItem("THEIR_PUBLIC_KEY");

            const encrypted = encrypt(message, theirPublicKey, yourPrivateKey);

            // POST /api/v1/statuses
            const res = await fetch(`https://${homeServer}/api/v1/statuses`, {
                method: 'POST',
                body: JSON.stringify({
                    // https://docs.joinmastodon.org/methods/statuses/#create
                    status: encrypted,
                }),
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                }
            });


            // ?? they need a passcode configuration, so they can decide
            // ?? when and for how long their private key gets encrypted.

            // !! just use alert windows bc who fucking cares.

            // todo: passcode input, login, logout, check user, add user, show pub key
            // todo: search names/handles locally, disclaimers, issues, pull requests,
            // todo: settings forms.
        }
    });

    messageBox.addEventListener("input", (e) => {
        let newMessage = e.target.value;
        message = newMessage;
    });
}