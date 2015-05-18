# node-gpstracker

Under development - not for use at this stage!!!!

Protocol implementation / portal server for GPS trackers TK104 (incutex) and Konga KT90

I use this for my own iojs portal server. Inspired by different related projects
- https://github.com/fvdm/nodejs-tk102 (for TK10x / general Xexun message parsing)
- https://github.com/jfromaniello/node-gpstracker (for TK104 message parsing)
- https://github.com/alvassin/nodejs-meiligao (for KT90 / Meitrack message parsing)

Filestruture lib
- Message.js (required, defines Message and Position)
- Tracker.js (required)
- Protocol_TK104.js (protocol handler for TK104, focused on parsing incoming positions)
- Protocol_KT90.js (basic protocol handler for KT90, limited SET commands, focused on parsing incoming positions)
- Server.js (required)
- MessageQueue (currently not used, simply FIFO buffer for messages to be sent to tracker) 

Created this for private use on my own server. Feel free to use. Please let me know if you find bugs.

Regarding License: I don't even know if this is legal, if not just let me know. The code in this repository is MIT licensed.
