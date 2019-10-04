
import { getCryptoLib } from './cryptoUtils'

type NodeCryptoCreateHash = typeof import('crypto').createHash

export interface Sha2Hash {
  digest(data: NodeJS.TypedArray, algorithm?: 'sha256' | 'sha512'): Promise<Buffer>;
}

class NodeCryptoSha2Hash {
  createHash: NodeCryptoCreateHash

  constructor(createHash: NodeCryptoCreateHash) {
    this.createHash = createHash
  }

  async digest(data: NodeJS.TypedArray, algorithm = 'sha256'): Promise<Buffer> {
    const result = this.createHash(algorithm)
      .update(data)
      .digest()
    return Promise.resolve(result)
  }
}

class WebCryptoSha2Hash implements Sha2Hash {
  subtleCrypto: SubtleCrypto

  constructor(subtleCrypto: SubtleCrypto) {
    this.subtleCrypto = subtleCrypto
  }

  async digest(data: NodeJS.TypedArray, algorithm = 'sha256'): Promise<Buffer> {
    let algo: string
    if (algorithm === 'sha256') {
      algo = 'SHA-256'
    } else if (algorithm === 'sha512') {
      algo = 'SHA-512'
    } else {
      throw new Error(`Unsupported hash algorithm ${algorithm}`)
    }
    const hash = await this.subtleCrypto.digest(algo, data)
    return Buffer.from(hash)
  }
}

export async function createSha2Hash(): Promise<Sha2Hash> {
  const cryptoLib = await getCryptoLib()
  if (cryptoLib.name === 'subtleCrypto') {
    return new WebCryptoSha2Hash(cryptoLib.lib)
  } else {
    return new NodeCryptoSha2Hash(cryptoLib.lib.createHash)
  }
}
