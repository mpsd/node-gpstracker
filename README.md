# node-gpstracker

Under development - not for use at this stage!!!!

Protocol implementation / portal server for GPS trackers TK104 (incutex) and Konga KT90

I use this for my own iojs portal server. Inspired by different related projects
- https://github.com/fvdm/nodejs-tk102 (for TK10x / general Xexun message parsing)
- https://github.com/jfromaniello/node-gpstracker (for TK104 message parsing, see also my fork node-tk104)
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


The MIT License (MIT)

Copyright (c) 2015 mpsd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
