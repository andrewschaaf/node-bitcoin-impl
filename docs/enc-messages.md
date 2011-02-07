
*(May contain [CC-BY](http://creativecommons.org/licenses/by/3.0/)-licensed fragments from [the Bitcoin wiki](https://en.bitcoin.it/wiki/Protocol_specification).)*


See enc-stuff.

## Connection messages:

### version
This is the first message each party sends.

"If the emitter of the packet has version >= 209, a "verack" packet shall be sent if the version packet was accepted."
<pre>
    u32         version
    u64         services (bitmask)
                    NODE_NETWORK=1  "This node can be asked for full blocks instead of just headers.
    u64         timestamp   seconds since 1970
    net_addr    addr_me
    // ......version >= 106
    net_addr    addr_you
    u64         nonce           "Node random unique id. This id is used to detect connections to self"
    var_str     sub_version_num
    // ......version >= 209
    u32         start_height    "The last block received by the emitting node"
</pre>

### verack
0-byte payload.

### ping
The ping message is sent primarily to confirm that the TCP/IP connection is still valid. An error in transmission is presumed to be a closed connection and the address is removed as a current peer. No reply is expected as a result of this message being sent nor any sort of action expected on the part of a client when it is used.


## P2P messages:

### getaddr
Asks for information about known active peers to help with identifying potential nodes. Response: transmit an addr message with one or more peers from a database of known active peers

0-byte body.

### addr
"Starting version 31402, addresses are prefixed with a timestamp. If no timestamp is present, the addresses should not be relayed to other peers, unless it is indeed confirmed they are up."
<pre>
---- max bytes: 1000 ----
var_int                     count
(uint32_t + net_addr)*      addr_list
</pre>

### alert
An alert is sent between nodes to send a general notification message throughout the network. If the alert can be confirmed with the signature as having come from the the core development group of the Bitcoin software, the message is suggested to be displayed for end-users. Attempts to perform transactions, particularly automated transactions through the client, are suggested to be halted. The text in the Message string should be relayed to log files and any user interfaces.
<pre>
var_str     message
var_str     signature
</pre>

## Data messages:

### inv
"received unsolicited, or in reply to getblocks"
<pre>
---- max bytes: 50,000 ----
var_int         count
(inv_vect)*     inventory
</pre>


### getdata
"getdata is used in response to inv, to retrieve the content of a specific object, and is usually sent after receiving an inv packet, after filtering known elements"
<pre>
---- max bytes: 50,000 ----
var_int         count
(inv_vect)*     inventory
</pre>


### getblocks
"Return an inv packet containing the list of blocks starting at hash_start, up to hash_stop or 500 blocks, whichever comes first. To receive the next blocks hashes, one needs to issue getblocks again with the last known hash."
<pre>
u32         version         only present if nType has SER_GETHASH set (purpose unknown)
var_int     start count     number of hash_start entries
char[32]    hash_start      hash of the last known block of the emitting node
char[32]    hash_stop       hash of the last desired block.
                            Set to zero to get as many blocks as possible (500)
</pre>


### tx

lock_time: "The block number or timestamp at which this transaction is locked, or 0 if the transaction is always locked. A non-locked transaction must not be included in blocks, and it can be modified by broadcasting a new version before the time has expired (replacement is currently disabled in Bitcoin, however, so this is useless)."

<pre>
u32         version         Transaction data format version

var_int     (count)
(tx_in)*    tx_in

var_int     (count)
(tx_out)*   tx_out

u32         lock_time
</pre>

### block
The block message is sent in response to a getdata message which requests transaction information from a block hash.
<pre>
u32         version         Block version information, based upon the software version creating this block
char[32]    prev_block      The hash value of the previous block this particular block references
char[32]    merkle_root     
u32         timestamp       seconds since epoch
u32         bits            The calculated difficulty target being used for this block
u32         nonce           The nonce used to generate this block to allow variations of the header and compute different hashes
var_int     (count)
"tx"        transactions    Block transactions, in format of "tx" command
</pre>


### IP Transaction messages:

### checkorder
This message is used for IP Transactions, to ask the peer if it accepts such transactions and allow it to look at the content of the order. It contains a CWalletTx object
<pre>
// Fields from CMerkleTx

hashBlock
vMerkleBranch
nIndex

// Fields from CWalletTx

vtxPrev
mapValue
vOrderForm
fTimeReceivedIsTxTime
nTimeReceived
fFromMe
fSpent
</pre>

### submitorder
<pre>
char[32]    hash                Hash of the transaction
CWalletTx   wallet_entry        Same payload as checkorder
</pre>

### reply
<pre>
u32 reply
    0   SUCCESS        The IP Transaction can proceed (checkorder), or has been accepted (submitorder)
    1   WALLET_ERROR   AcceptWalletTransaction() failed
    2   DENIED         IP Transactions are not accepted by this node
</pre>
