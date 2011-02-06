
#include <cctype>
#include <cstdlib>
#include <cstring>
#include <stdio.h>

#include <v8.h>

#include <node.h>
#include <node_buffer.h>

#include <openssl/bn.h>
#include <openssl/buffer.h>
#include <openssl/ecdsa.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/sha.h>
#include <openssl/ripemd.h>


using namespace std;
using namespace v8;
using namespace node;



static Handle<Value> VException(const char *msg) {
    HandleScope scope;
    return ThrowException(Exception::Error(String::New(msg)));
}


static Handle<Value>
new_keypair (const Arguments& args)
{
  HandleScope scope;
  EC_KEY* pkey;
  
  // Generate
  pkey = EC_KEY_new_by_curve_name(NID_secp256k1);
  if (pkey == NULL) {
    return VException("Error from EC_KEY_new_by_curve_name");
  }
  if (!EC_KEY_generate_key(pkey)) {
    return VException("Error from EC_KEY_generate_key");
  }
  
  // Export private
  unsigned int priv_size = i2d_ECPrivateKey(pkey, NULL);
  if (!priv_size) {
    return VException("Error from i2d_ECPrivateKey(pkey, NULL)");
  }
  unsigned char *priv = (unsigned char *)malloc(priv_size);
  if (i2d_ECPrivateKey(pkey, &priv) != priv_size) {
   return VException("Error from i2d_ECPrivateKey(pkey, &priv)");
  }
  
  // Export public
  unsigned int pub_size = i2o_ECPublicKey(pkey, NULL);
  if (!pub_size) {
    return VException("Error from i2o_ECPublicKey(pkey, NULL)");
  }
  unsigned char *pub = (unsigned char *)malloc(pub_size);
  if (i2o_ECPublicKey(pkey, &pub) != pub_size) {
    return VException("Error from i2o_ECPublicKey(pkey, &pub)");
  }
  
  // Return [priv_buf, pub_buf]
  
  Local<Array> a = Array::New(2);
  
  Buffer *priv_buf = Buffer::New(priv_size);
  memcpy(Buffer::Data(priv_buf), priv, priv_size);
  a->Set(Integer::New(0), priv_buf->handle_);
  
  Buffer *pub_buf = Buffer::New(pub_size);
  memcpy(Buffer::Data(pub_buf), pub, pub_size);
  a->Set(Integer::New(1), pub_buf->handle_);
  
  return scope.Close(a);
}


static Handle<Value>
pubkey_to_address256 (const Arguments& args)
{
  HandleScope scope;
  
  if (args.Length() != 1) {
    return VException("One argument expected: pubkey Buffer");
  }
  if (!Buffer::HasInstance(args[0])) {
    return VException("One argument expected: pubkey Buffer");
  }
  v8::Handle<v8::Object> pub_buf = args[0]->ToObject();
  
  unsigned char *pub_data = (unsigned char *) Buffer::Data(pub_buf);
  
  // sha256(pubkey)
  unsigned char hash1[SHA256_DIGEST_LENGTH];
  SHA256_CTX c;
  SHA256_Init(&c);
  SHA256_Update(&c, pub_data, Buffer::Length(pub_buf));
  SHA256_Final(hash1, &c);
  
  // ripemd160(sha256(pubkey))
  unsigned char hash2[RIPEMD160_DIGEST_LENGTH];
  RIPEMD160_CTX c2;
  RIPEMD160_Init(&c2);
  RIPEMD160_Update(&c2, hash1, SHA256_DIGEST_LENGTH);
  RIPEMD160_Final(hash2, &c2);
  
  // x = '\x00' + ripemd160(sha256(pubkey))
  // LATER: make the version an optional argument
  unsigned char address256[1 + RIPEMD160_DIGEST_LENGTH + 4];
  address256[0] = 0;
  memcpy(address256 + 1, hash2, RIPEMD160_DIGEST_LENGTH);
  
  // sha256(x)
  unsigned char hash3[SHA256_DIGEST_LENGTH];
  SHA256_CTX c3;
  SHA256_Init(&c3);
  SHA256_Update(&c3, address256, 1 + RIPEMD160_DIGEST_LENGTH);
  SHA256_Final(hash3, &c3);
  
  // address256 = (x + sha256(x)[:4])
  memcpy(
    address256 + (1 + RIPEMD160_DIGEST_LENGTH),
    hash3,
    4);
  
  Buffer *address256_buf = Buffer::New(1 + RIPEMD160_DIGEST_LENGTH + 4);
  memcpy(Buffer::Data(address256_buf), address256, 1 + RIPEMD160_DIGEST_LENGTH + 4);
  return scope.Close(address256_buf->handle_);
}


static const char* BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";


static Handle<Value>
base58_encode (const Arguments& args)
{
  HandleScope scope;
  
  if (args.Length() != 1) {
    return VException("One argument expected: a Buffer");
  }
  if (!Buffer::HasInstance(args[0])) {
    return VException("One argument expected: a Buffer");
  }
  v8::Handle<v8::Object> buf = args[0]->ToObject();
  
  unsigned char *buf_data = (unsigned char *) Buffer::Data(buf);
  int buf_length = Buffer::Length(buf);
  
  BN_CTX *ctx = BN_CTX_new();
  
  BIGNUM *bn = BN_bin2bn(buf_data, buf_length, NULL);
  
  BIGNUM *bn58 = BN_new();
  BN_set_word(bn58, 58);
  
  BIGNUM *bn0 = BN_new();
  BN_set_word(bn0, 0);
  
  BIGNUM *dv = BN_new();
  BIGNUM *rem = BN_new();
  
  // TODO: compute safe length
  char *str = new char[100];
  unsigned int c;
  int i, j, j2;
  
  i = 0;
  while (BN_cmp(bn, bn0) > 0) {
    if (!BN_div(dv, rem, bn, bn58, ctx)) {
      return VException("BN_div failed");
    }
    bn = dv;
    c = BN_get_word(rem);
    str[i] = BASE58_ALPHABET[c];
    i++;
  }
  
  // Leading zeros
  for (j = 0; j < buf_length; j++) {
    if (buf_data[j] != 0) {
      break;
    }
    str[i] = BASE58_ALPHABET[0];
    i++;
  }
  
  // Terminator
  str[i] = 0;
  
  // Reverse string
  int numSwaps = (i / 2);
  char tmp;
  for (j = 0; j < numSwaps; j++) {
    j2 = i - 1 - j;
    tmp = str[j];
    str[j] = str[j2];
    str[j2] = tmp;
  }
  
  BN_free(bn);
  BN_free(bn58);
  BN_free(bn0);
  
  Local<String> ret = String::New(str);
  delete [] str;
  return scope.Close(ret);
}


extern "C" void
init (Handle<Object> target)
{
  HandleScope scope;
  target->Set(String::New("new_keypair"), FunctionTemplate::New(new_keypair)->GetFunction());
  target->Set(String::New("pubkey_to_address256"), FunctionTemplate::New(pubkey_to_address256)->GetFunction());
  target->Set(String::New("base58_encode"), FunctionTemplate::New(base58_encode)->GetFunction());
}

