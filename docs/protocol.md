
*(May contain [CC-BY](http://creativecommons.org/licenses/by/3.0/)-licensed fragments from [the Bitcoin wiki](https://en.bitcoin.it/wiki/Protocol_specification).)*

<pre>
SERVICES_BITMASK = {
    NODE_NETWORK: 1
}
INVENTORY_TYPES = {
    ERROR: 0
    MSG_TX: 1
    MSG_BLOCK: 2
}
</pre>


#### version
<pre>
{
    version:            unit
    services:           uint (see SERVICES_BITMASK)
    timestamp:          uint (seconds since epoch)
    addr_me:            {...net_addr...}
    addr_you:           {...net_addr...}
    nonce:              8-byte data
    sub_version_num:    data
    start_height:       uint        "The last block received by the emitting node"
}
</pre>

#### verack, ping, getaddr
<pre>
{}
</pre>

#### addr
<pre>
{
    addresses: [
        {
            timestamp: uint (seconds since epoch)
            services: uint (see SERVICES_BITMASK)
            ip: data (4 bytes or 16 bytes)
            port: uint
        }
    ]
}
</pre>

#### alert
<pre>
{
    message: data
    signature: data
}
</pre>

#### inv
<pre>
{
    inventory: [
        {
            type: uint (see INVENTORY_TYPES)
            hash: 32-byte data
        }
    ]
}
</pre>

#### getdata
<pre>
{
    inventory: [...]
}
</pre>

#### getblocks
<pre>
{
    version: uint
    start_hashes: [
        32-byte data
    ]
    stop_hash: 32-byte data (or null for as many as possible)
}
</pre>

#### tx
<pre>
{
    version: uint
    ins: [
        {
            previous_output: {
                index: uint
                hash: 32-byte data
            }
            signature_script: data
            sequence: uint (Transaction version as defined by the sender)
        }
    ]
    outs: [
        {
            value: uint (number of 1E-8 BTC quantums)
            pk_script: data
        }
    ]
    lock_time: uint
}
</pre>

#### block
<pre>
{
    version: uint
    prev_block: 32-byte data
    merkle_root: 32-byte data
    timestamp: uint (seconds since epoch)
    difficulty: uint32
    nonce: uint32
    transactions: [
        {...TX message...}
    ]
}
</pre>

#### checkorder, submitorder, reply

Not supported.
