
*(May contain [CC-BY](http://creativecommons.org/licenses/by/3.0/)-licensed fragments from [the Bitcoin wiki](https://en.bitcoin.it/wiki/Protocol_specification).)*

Except for net_addr's port, integers are little-endian.

#### (24 + *) Message structure
<pre>
4   magic (main: F9BEB4D9, testnet: FABFB5DA)
12  command (ASCII string, null-padded)
4   length
4   sha256(sha256(payload))[:4] *** NOT INCLUDED in {version,verack} ***
*   payload
</pre>

#### {1,3,5,9} var_int
<pre>
00-FC: uint8
FD + uint16
FE + uint32
FF + uint64
</pre>

#### (*) var_str
<pre>
var_int     length
*           string
</pre>

#### (26) net_addr
<pre>
u64         services
char[16]    IPv6/4. Last 4 bytes for v4
u16_BE      port
</pre>

#### (36) inv_vect
<pre>
uint32      type
                0	 ERROR	 Any data of with this number may be ignored
                1	 MSG_TX	 Hash is related to a transaction
                2	 MSG_BLOCK	 Hash is related to a data block
char[32]    hash
</pre>


#### outpoint
<pre>
char[32]    hash        The hash of the referenced transaction
u32         index       The index of the specific output in the transaction. The first output is 0, etc.
</pre>

#### tx_in
<pre>
outpoint    previous_output     The previous output transaction reference, as an OutPoint structure
var_str     signature script    Computational Script for confirming transaction authorization
u32         sequence            Transaction version as defined by the sender. Intended for "replacement" of transactions when information is updated before inclusion into a block.
</pre>


#### tx_out
<pre>
u64         value       Transaction Value (number of 1E-8 BTC quantums)
var_str     pk_script   Usually contains the public key as a Bitcoin script setting up conditions to claim this output.
</pre>
