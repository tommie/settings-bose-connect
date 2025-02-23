const DEBUG = false

// Bit fields 0-3 operator, 4-5 port, 6-
export enum PacketKind {
  SET = 0, // Write
  GET = 1, // Write
  SET_GET = 2, // Write
  STATUS = 3, // Read
  ERROR = 4, // Read

  START = 5, // Write
  RESULT = 6, // Read
  PROCESSING = 7, // Read
}

export enum ErrorCode {
  LENGTH = 1,
  CHKSUM = 2,
  FBLOCK_NOT_SUPP = 3,
  FUNC_NOT_SUPP = 4,
  OP_NOT_SUPP = 5,
  INVALID_DATA = 6,
  DATA_UNAVAILABLE = 7,
  RUNTIME = 8,
  TIMEOUT = 9,
  INVALID_STATE = 10,
  DEVICE_NOT_FOUND = 11,
  BUSY = 12,
  NOCONN_TIMEOUT = 13,
  NOCONN_KEY = 14,
  OTA_UPDATE = 15,
  OTA_LOW_BATT = 16,
  OTA_NO_CHARGER = 17,
  FBLOCK_SPECIFIC = -1,
}

export interface Packet<Payload = ArrayBuffer> {
  cmd: number;
  kind: PacketKind;
  payload: Payload;
}

export type PacketTree = Packet<ArrayBuffer | PacketTree[] | Map<number, PacketTree>>

export class BoseConnectLowLevel {
  private readonly reader: Pick<ReadableStreamDefaultReader, "cancel">
  private readBuf = new Uint8Array(new ArrayBuffer(0, { maxByteLength: 1024 }))
  private abortWrite: (() => Promise<void>) | undefined
  private handleReceive: ((tree: PacketTree) => void) | undefined

  public constructor(private readonly port: SerialPort, private readonly onReceive: (tree: PacketTree) => void) {
    if (!port.readable) throw new DOMException('Port not open', 'InvalidStateError')

    const r = port.readable.getReader()
    this.reader = r
    this.runReader(r)
      .finally(() => r.releaseLock())
      .catch(ex => console.error('Reader terminated:', ex))
  }

  public async close() {
    await this.abortWrite?.()
    await this.reader.cancel('Device closed')
    await this.port.close()
  }

  public async request(
    cmd: number,
    kind: PacketKind,
    payload?: Parameters<BoseConnectLowLevel['writePacket']>[2],
  ) {
    for (let attempt = 0; ; ++attempt) {
      await this.writePacket(cmd, kind, payload)

      const abort = new AbortController()
      let timeout: ReturnType<typeof setTimeout> | undefined = setTimeout(() => {
        timeout = undefined
        abort.abort('Timeout')
      }, 1000);

      try {
        const packet = await this.waitForPacketTree(cmd, abort.signal)
        if (!packet) {
          if (attempt < 3 && this.port.connected) {
            if (DEBUG) console.warn('Retry', cmd, kind, abort.signal.reason)

            continue
          }

          throw new Error(abort.signal.reason ?? new Error('Device disconnected'))
        }

        return packet
      } finally {
        clearTimeout(timeout)
      }
    }
  }

  private async writePacket(
    cmd: number,
    kind: PacketKind,
    payload?: Uint8Array | number[],
  ) {
    const payloadLength = Array.isArray(payload) ? payload.length : payload ? payload.byteLength : 0
    const data = new Uint8Array(4 + payloadLength)
    data[0] = (cmd >> 8) & 0xFF
    data[1] = cmd & 0xFF
    data[2] = kind
    data[3] = payloadLength
    if (payload) data.set(payload, 4)

    if (DEBUG) console.log('Write', toHexString(data))

    if (!this.port.writable) throw new DOMException('Port not open', 'InvalidStateError')
    const w = this.port.writable.getWriter()

    try {
      this.abortWrite = () => w.abort()

      await w.write(data)
    } finally {
      this.abortWrite = undefined
      w.releaseLock()
    }
  }

  private async waitForPacketTree(cmd: number, abort?: AbortSignal) {
    return new Promise<PacketTree | null>((resolve) => {
      if (this.handleReceive) throw new Error("Only one reader at a time is supported")

      const end = (packet: PacketTree | null) => {
        abort?.removeEventListener('abort', onAbort)
        this.handleReceive = undefined
        resolve(packet)
      }

      const onAbort = () => end(null)
      abort?.addEventListener('abort', onAbort)

      const onPacket = (packet: PacketTree) => {
        if (packet.cmd === cmd) {
          end(packet)
        }
      }

      this.handleReceive = onPacket
    })
  }

  private async runReader(r: ReadableStreamDefaultReader) {
    for (; ;) {
      try {
        const packet = await this.readPacketTree(r)
        if (!packet) break

        this.onReceive(packet)
        this.handleReceive?.(packet)
      } catch (ex) {
        if (!(ex instanceof PacketError)) {
          throw ex
        }

        console.error('Retrying after protocol error:', ex)
        await new Promise((done) => setTimeout(done, 100))
      }
    }
  }

  private async readPacketTree(r: ReadableStreamDefaultReader): Promise<PacketTree | null> {
    const packet = await this.readPacket(r)
    if (!packet) return null

    return this.readPacketTreeRec(packet, r)
  }

  private async readPacketTreeRec(packet: Packet, r: ReadableStreamDefaultReader): Promise<PacketTree | null> {
    switch (packet.kind) {
      case PacketKind.STATUS:
        return packet

      case PacketKind.ERROR: {
        const payload = new Uint8Array(packet.payload)
        const name = payload.length === 1 ? ErrorCode[payload[0]] : undefined
        throw new PacketError(`Error received for 0x${packet.cmd.toString(0x10)}: ${name ?? toHexString(payload)}`)
      }

      case PacketKind.PROCESSING:
        break

      case PacketKind.RESULT:
        return { ...packet, payload: [] }

      default:
        throw new PacketError(`Received unexpected kind for 0x${packet.cmd.toString(0x10)}: ${packet.kind}`)
    }

    let tree: PacketTree | undefined
    for (; ;) {
      const pkt = await this.readPacket(r)
      if (!pkt) return null

      if (pkt.cmd === packet.cmd) {
        if (!tree) tree = { ...packet, payload: [] }

        switch (pkt.kind) {
          case PacketKind.STATUS:
            (tree.payload as PacketTree[]).push(pkt)
            break

          case PacketKind.RESULT:
            return tree

          default:
            throw new PacketError(`Received unexpected kind for 0x${packet.cmd.toString(0x10)}: ${packet.kind}`)
        }
      } else {
        if (!tree) tree = { ...packet, payload: new Map() };
        const pktTree = await this.readPacketTreeRec(pkt, r)
        if (!pktTree) return null;

        (tree.payload as Map<number, PacketTree>).set(pkt.cmd, pktTree)
      }
    }
  }

  private async readPacket(r: ReadableStreamDefaultReader): Promise<Packet | null> {
    while (this.readBuf.byteLength < 4 || this.readBuf.byteLength < 4 + this.readBuf[3]) {
      const { done, value } = await r.read()
      if (done) return null

      const oldLength = this.readBuf.byteLength
      this.readBuf.buffer.resize(this.readBuf.byteOffset + oldLength + value.byteLength)
      this.readBuf = new Uint8Array(
        this.readBuf.buffer,
        this.readBuf.byteOffset,
        oldLength + value.byteLength,
      )
      this.readBuf.set(value, oldLength)
    }

    const cmd = new DataView(this.readBuf.buffer, this.readBuf.byteOffset).getUint16(0, false)
    const kind: PacketKind = this.readBuf[2]
    const payload = this.readBuf.buffer.slice(
      this.readBuf.byteOffset + 4,
      this.readBuf.byteOffset + 4 + this.readBuf[3],
    )

    if (DEBUG) console.log('Read', toHexString(this.readBuf.slice(0, 4 + payload.byteLength)))

    new Uint8Array(this.readBuf.buffer).copyWithin(
      0,
      this.readBuf.byteOffset + 4 + payload.byteLength,
    )
    this.readBuf = new Uint8Array(
      this.readBuf.buffer,
      0,
      this.readBuf.byteLength - (4 + payload.byteLength),
    )

    return {
      cmd,
      kind,
      payload,
    }
  }
}

export function toHexString(arr: Uint8Array) {
  return Array.from(arr)
    .map((v) => v.toString(0x10).padStart(2, '0'))
    .join(' ')
}

export class PacketError extends Error {
  public constructor(message: string) {
    super(message)
  }
}
