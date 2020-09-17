![Completion 1.0.0](https://img.shields.io/badge/completion%20v1.0.0-8%25-red) ![Help Wanted](https://img.shields.io/badge/%20-help--wanted-%23159818) ![Version 0.9.3](https://img.shields.io/badge/version-v0.9.3-green) ![Version 0.9.3](https://img.shields.io/badge/version-v0.9.4-blue) ![Sponsors](https://img.shields.io/badge/sponsors-0-red)

## qDesk Social

## Description

qDesk Social is a module for qDesk. It's accessible across qDesk, you can use it with qDesk Messages and other qDesk modules. It is used to show store information and latest store campaigns on qDesk Market. 

It's not all qDesk though, qDesk Social is a protocol as well and if you are using [Quest OS](https://github.com/QuestNetwork/quest-os-js) in your applications, you can even use the underlying channels and data in your own application by booting with [Quest Social JS](https://github.com/QuestNetwork/quest-social-js).

qDesk Social offers the ability to share posts and information about yourself and make connections with other people. You can have a public profile, granular privacy settings or invite only. qDesk Social is a module for [qDesk](https://github.com/QuestNetwork/qDesk) and it's built on [Quest OS](https://github.com/QuestNetwork/quest-os-js) which makes use of the [Interplanetary Filesystem](https://ipfs.io), [IPFS GossipSub](https://blog.ipfs.io/2020-05-20-gossipsub-v1.1/) and [qDesk](https://github.com/QuestNetwork/qDesk), our window platform based on [Angular10](https://angular.io/).

We're not planning to make this a decentralized version of "Facebook" or "Twitter". We're crating the real deal and we feel like those premium platforms are more like the "for kids" version of what they should actually be.

[qDesk](https://github.com/QuestNetwork/qDesk) works in the browser, as an Electron on Windows, Mac and Linux and Android using Cordova.

Check out other [Awesome Quest Network dApps](https://github.com/QuestNetwork/awesome/blob/master/README.md)!

## Security

![Completion 1.0.0](https://img.shields.io/badge/OAEP-4096%20Bit-green) ![EC](https://img.shields.io/badge/EC-P&#8208;521-green) ![AES](https://img.shields.io/badge/AES-256%20Bit-yellow)

[Quest OS](https://github.com/QuestNetwork/quest-os-js) uses [4096 Bit RSA-OAEP](https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Operation) encryption, [256 Bit AES-CBC](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) encryption and [NIST P-521 EC](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography#Fast_reduction_(NIST_curves)) signatures.

## Lead Maintainer

[StationedInTheField](https://github.com/StationedInTheField)

## Support Us
This project is a lot of work and unfortunately we need to eat food (ツ)

| Ethereum| Bitcoin |
|---|---|
| `0xBC2A050E7B87610Bc29657e7e7901DdBA6f2D34E` | `bc1qujrqa3s34r5h0exgmmcuf8ejhyydm8wwja4fmq`   |
|  <img src="doc/images/eth-qr.png" >   | <img src="doc/images/btc-qr.png" > |

## Development

qDesk Social is a module of [qDesk](https://github.com/QuestNetwork/qDesk), so please see https://github.com/QuestNetwork/qDesk#development for instructions.

### Commands

**Prepare Package**

``npm run inst`` Removes `package-lock.json` and runs ``npm install``

We added an example ```swarm.json``` to the ```src/app``` folder with an example node to make reproduction easier, but we strongly recommend to use our [Quest CLI](https://github.com/QuestNetwork/quest-cli) to test and build the app.

Pro Tip: Put a file in your `/bin` that runs the quest-cli like so `node /path/to/quest-cli/index.js` from any folder on your system. It's much nicer!

## Features

**0.9.3**
- Public Profile
- Invite Only Profile
- Alias, Full Name, About

**0.9.4**
- Change Profile Picture
- Change Poster
- Native Posts
- Native Followers
- Connect To Twitter

**0.9.5**
- Comments On Posts
- Connect To Facebook/Instagram

**0.9.6**
- Connect To TikTok

## License

GNU Affero GPLv3
