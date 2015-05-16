# node-gpstracker
Protocol implementation / portal server for GPS trackers TK104 (incutex) and Konga KT90

I use this for my own iojs portal server. Inspired by different related projects
https://github.com/fvdm/nodejs-tk102 (for TK10x / general Xexun message parsing)
https://github.com/jfromaniello/node-gpstracker (for TK104 message parsing)
https://github.com/alvassin/nodejs-meiligao (for KT90 / Meitrack message parsing)

Filestruture lib
- Position.js (required)
- Queue.js (required)
- Tracker.js (required)
- TK104.js (protocol handler for TK104)
- KT90.js (basic protocol handler for KT90, limited SET commands, focused on parsing incoming positions)
- Server.js (required)

Created this for private use on my own server. Feel free to use. Please let me know if you find bugs.


Regarding License
I don't even know if this is legal, if not just let me know. This code is MIT licensed.
