import { BoseConnectLowLevel, PacketKind, type PacketTree, toHexString } from './boseconnectlow'

const DEBUG = false

export enum ProductId {
  BRUSSELS = 0x23,
  EDELMAN = 0x94f,

  ISAAC = 0x400a,
  WOLFCASTLE = 0x400c,
  FOREMAN = 0x400d,
  FOLGERS = 0x4010,
  HARVEY = 0x4011,
  ICE = 0x4012,
  FLURRY = 0x4013,
  STETSON = 0x4015,
  POWDER = 0x4014,
  KLEOS = 0x4017,
  LEVI = 0x4018,
  LEVI_SLAVE = 0x4019,
  LEVI_CASE = 0x401a,
  BAYWOLF = 0x4020,
  ATLAS = 0x4021,
  MINNOW = 0x4022,
  GOODYEAR = 0x4024,
  BEANIE = 0x402b,
  CELINE = 0x402c,
  REVEL = 0x402d,
  LANDO = 0x402f,
  BUDLITE = 0x4034,
  DURAN = 0x4039,
  GWEN = 0x403a,
  CELINE_II = 0x404c,
  OLIVIA = 0x4060,
  VEDDER = 0x4061,
  SMALLS = 0x4064,
  SMALLS_CASE = 0x4065,
  LONESTARR = 0x4066,
  SERENA_CASE = 0x4067,
  SERENA = 0x4068,
  SCOTTY = 0x4072,
  SCOTTY_CHARGING_CASE = 0x4073,
  PRINCE = 0x4075,

  CHIBI = 0xa211,
  PHELPS = 0xbc59,
  PHELPS_II = 0xbc60,
}

export enum ProductType {
  HEADPHONES = 0,
  SPEAKER = 1,
}

export enum ButtonAction {
  VPA = 1,
  ANR = 2,
  BATTERY_LEVEL = 3,
  PLAY_PAUSE = 4,
}

export enum PairedDeviceStatusMask {
  CONNECTED = 1 << 0,
  LOCAL_DEVICE = 1 << 1,
  BOSE_PRODUCT = 1 << 2,
}

export enum NoiseReduction {
  OFF = 0,
  HIGH = 1,
  WIND = 2,
  LOW = 3,
}

export enum Language {
  EN_UK = 0x00,
  EN_US = 0x01,
  FR = 0x02,
  IT = 0x03,
  DE = 0x04,
  ES_ES = 0x05,
  ES_MX = 0x06,
  PT_BR = 0x07,
  ZH_MA = 0x08, // Mandarin
  KO = 0x09,
  RU = 0x0a,
  PL = 0x0b,
  HE = 0x0c,
  TR = 0x0d,
  NL = 0x0e,
  JA = 0x0f,
  ZH_CA = 0x10, // Cantonese
  AR = 0x11,
  SV = 0x12,
  DA = 0x13,
  NO = 0x14,
  FI = 0x15,
}

export enum SidetoneMode {
  OFF = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
}

export enum AudioControlValue {
  STOP = 0,
  PLAY = 1,
  PAUSE = 2,
  TRACK_FORWARD = 3,
  TRACK_BACK = 4,
  FAST_FORWARD_PRESS = 5,
  FAST_FORWARD_RELEASE = 6,
  REWIND_PRESS = 7,
  REWIND_RELEASE = 8,
}

export enum AudioSourceType {
  NONE = 0,
  BLUETOOTH = 1,
  AUXILIARY = 2,
}

export enum PlaybackStatus {
  PLAYING = 1,
  STOPPED = 2,
}

export enum PlaybackTitleKind {
  SONG_TITLE = 0,
  ARTIST = 1,
  ALBUM = 2,
  TRACK_NUMBER = 3,
  TOTAL_NUMBER_OF_TRACKS = 4,
  GENRE = 5,
  PLAYING_TIME = 6,
}

export enum VoicePersonalAssistant {
  GOOGLE_ASSISTANT = 0,
  ALEXA = 1,
  NONE = 0x7f,
}

export enum VoicePersonalAssistantTrigger {
  VPA_NOT_TRIGGERED = 0,
  BUTTON_PRESS = 1,
  WAKE_UP_WORD = 2,
  VPA_NOTIFICATION = 3,
}

export enum WakeUpWord {
  OK_GOOGLE = 0,
  ALEXA = 1,
}

export type CustomEventListenerOrEventListenerObject<E extends Event> =
  | {
      (evt: E): void
    }
  | {
      handleEvent(evt: E): void
    }

export interface CustomEventTarget<EventMap extends Record<string, Event>> extends EventTarget {
  addEventListener<K extends keyof EventMap>(
    type: K,
    callback: CustomEventListenerOrEventListenerObject<EventMap[K]> | null,
    options?: AddEventListenerOptions | boolean,
  ): void
  removeEventListener<K extends keyof EventMap>(
    type: K,
    callback: CustomEventListenerOrEventListenerObject<EventMap[K]> | null,
    options?: EventListenerOptions | boolean,
  ): void
  dispatchEvent(event: EventMap[keyof EventMap]): boolean
}

export type BoseConnectEvents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  receive: CustomEvent<{ id: Function; payload: any }>
}

export enum Function {
  // Block PRODUCT_INFO
  PRODUCT_INFO = 0x0000,
  PRODUCT_VERSION = 0x0001,
  GET_ALL_FUNCTION_BLOCKS = 0x0002,
  PRODUCT_ID_VARIANT = 0x0003,
  PRODUCT_INFO_GET_ALL_FUNCTIONS = 0x0004,
  FIRMWARE_VERSION = 0x0005,
  MAC_ADDRESS = 0x0006,
  SERIAL_NUMBER = 0x0007,
  HARDWARE_REVISION = 0x000a,
  COMPONENT_DEVICES = 0x000b,

  // Block SETTINGS
  SETTINGS_INFO = 0x0100,
  SETTINGS_GET_ALL = 0x0101,
  PRODUCT_NAME = 0x0102,
  VOICE_PROMPTS = 0x0103,
  STANDBY_TIMER = 0x0104,
  CNC = 0x0105,
  ANR = 0x0106,
  BASS_CONTROL = 0x0107,
  ALERTS = 0x0108,
  BUTTONS = 0x0109,
  MULTIPOINT = 0x010a,
  SIDETONE = 0x010b,
  IMU_VOLUME_CONTROL = 0x0115,

  // Block STATUS
  STATUS_INFO = 0x0200,
  STATUS_GET_ALL_FUNCTIONS = 0x0201,
  BATTERY_LEVEL = 0x0202,
  AUX_CABLE_DETECTION = 0x0203,
  MIC_LEVEL = 0x0204,
  CHARGER_DETECT = 0x0205,

  // Block DEVICE_MANAGEMENT
  DEVICE_MANAGEMENT_INFO = 0x0400,
  CONNECT = 0x0401,
  DISCONNECT = 0x0402,
  REMOVE_DEVICE = 0x0403,
  LIST_DEVICES = 0x0404,
  PAIRED_DEVICE_INFO = 0x0405,
  EXTENDED_PAIRED_DEVICE_INFO = 0x0406,
  CLEAR_DEVICE_LIST = 0x0407,
  PAIRING_MODE = 0x0408,
  LOCAL_MAC_ADDRESS = 0x0409,
  PREPARE_P2P = 0x040a,
  P2P_MODE = 0x040b,
  ROUTING = 0x040c,

  // Block AUDIO_MANAGEMENT
  AUDIO_MANAGEMENT_INFO = 0x0500,
  SOURCE = 0x0501,
  AUDIO_GET_ALL = 0x0502,
  AUDIO_CONTROL = 0x0503,
  PLAYBACK_STATUS = 0x0504,
  VOLUME = 0x0505,
  NOW_PLAYING = 0x0506,

  // Block VPA [voice personal assistant]
  VPA_INFO = 0x1000,
  VPA_GET_ALL = 0x1001,
  SUPPORTED_VPAS = 0x1002,

  // Block 3 FIRMWARE_UPDATE (INFO, STATE, INIT, DATA_TRANSFER, SYNCHRONIZE, VALIDATE, RUN, RESET)
  // Block 6 CALL_MANAGEMENT
  // Block 7 CONTROL (INFO, GET_ALL, CHIRP)
  // Block 8 DEBUG
  // Block 9 NOTIFICATION
  // Block 12 HEARING_ASSISTANCE
  // Block 13 DATA_COLLECTION
  // Block 14 HEART_RATE
  // Block 21 AUGMENTED_REALITY
}

export class BoseConnectDevice extends (EventTarget as {
  new (): CustomEventTarget<BoseConnectEvents>
}) {
  private readonly low: BoseConnectLowLevel
  private readonly productVersion: Promise<string>

  public constructor(public readonly port: SerialPort) {
    super()

    this.low = new BoseConnectLowLevel(port, (tree) => {
      const detail: BoseConnectEvents['receive']['detail'] = {
        id: tree.cmd,
        payload: this.parsePacket(tree),
      }
      if (DEBUG) console.log('Receive', detail)
      this.dispatchEvent(new CustomEvent('receive', { detail }))
    })

    this.productVersion = this.initializeAndGetProductVersion()
  }

  public async close() {
    await this.low.close()
  }

  // This must be the first request on an opened port.
  private async initializeAndGetProductVersion() {
    const resp = await this.low.request(Function.PRODUCT_VERSION, PacketKind.GET)
    return this.parseProductVersion(expectStatus(resp).payload)
  }

  private parseProductVersion(data: ArrayBuffer) {
    return new TextDecoder().decode(data)
  }

  public getProductVersion() {
    return this.productVersion
  }

  public getAllFunctionBlocks() {
    return this.request(Function.GET_ALL_FUNCTION_BLOCKS, undefined, PacketKind.START)
  }

  private parseGetAllFunctionBlocks(data: PacketTree['payload']) {
    if (!(data instanceof Map)) throw new Error()

    const dec = new TextDecoder()

    return Array.from(data.values()).map((packet) => [
      packet.cmd >> 8,
      dec.decode(expectStatus(packet).payload),
    ])
  }

  public async getProductIdVariant() {
    return this.request(Function.PRODUCT_ID_VARIANT) as Promise<
      ReturnType<BoseConnectDevice['parseProductIdVariant']>
    >
  }

  private parseProductIdVariant(data: ArrayBuffer) {
    const view = new DataView(data)

    return { productId: view.getUint16(0), variant: view.getUint8(2) }
  }

  public async getFirmwareVersion() {
    return this.request(Function.FIRMWARE_VERSION) as Promise<
      ReturnType<BoseConnectDevice['parseFirmwareVersion']>
    >
  }

  private parseFirmwareVersion(data: ArrayBuffer) {
    return new TextDecoder().decode(data)
  }

  public getSerialNumber() {
    return this.request(Function.SERIAL_NUMBER) as Promise<
      ReturnType<BoseConnectDevice['parseSerialNumber']>
    >
  }

  private parseSerialNumber(data: ArrayBuffer) {
    return new TextDecoder().decode(data)
  }

  public getAllSettings() {
    return this.request(Function.SETTINGS_GET_ALL, undefined, PacketKind.START) as Promise<
      ReturnType<BoseConnectDevice['parseAllSettings']>
    >
  }

  private parseAllSettings(data: PacketTree['payload']) {
    if (!(data instanceof Map)) throw new Error()

    const name = data.get(Function.PRODUCT_NAME)
    const lang = data.get(Function.VOICE_PROMPTS)
    const autoOff = data.get(Function.STANDBY_TIMER)
    const anc = data.get(Function.ANR)
    const buttons = data.get(Function.BUTTONS)
    return {
      name: !name ? undefined : this.parseProductName(expectStatus(name).payload),
      language: !lang ? undefined : this.parseVoicePrompts(expectStatus(lang).payload),

      autoOff: !autoOff ? undefined : this.parseStandbyTimer(expectStatus(autoOff).payload),
      anc: !anc ? undefined : this.parseNoiseReduction(expectStatus(anc).payload),
      buttons: !buttons ? undefined : this.parseButtons(expectStatus(buttons).payload),
    }
  }

  public async setProductName(name: string) {
    const payload = new TextEncoder().encode(name)

    if (payload.byteLength > 31) throw new Error(`Name too long: ${name}`)

    await this.request(Function.PRODUCT_NAME, payload, PacketKind.SET_GET)
  }

  private parseProductName(data: ArrayBuffer) {
    const view = new Uint8Array(data)

    if (view[0] !== 0x00 && view[0] !== 0x01) {
      console.info(`Unexpected name prefix: ${toHexString(view)}`)
    }

    return {
      name: new TextDecoder().decode(view.slice(1)),
      isDefault: view[0] !== 0,
    }
  }

  public async setVoicePrompts(language: Language, voiceEnabled: boolean) {
    const payload = new Uint8Array([language | (voiceEnabled ? 0x20 : 0)])

    await this.request(Function.VOICE_PROMPTS, payload, PacketKind.SET_GET)
  }

  private parseVoicePrompts(data: ArrayBuffer) {
    const view = new Uint8Array(data)

    if (view[1] !== 0x00 || view[2] !== 0x04 || view[3] !== 0xcf || view[4] !== 0xde) {
      console.info(`Unexpected voice prompt settings: ${toHexString(view)}`)
    }

    return {
      language: view[0] & 0x1f,
      prompt: (view[0] & 0x20) !== 0,
    }
  }

  public async setStandbyTimer(delayMinutes: number) {
    const payload = new Uint8Array([delayMinutes])

    await this.request(Function.STANDBY_TIMER, payload, PacketKind.SET_GET)
  }

  private parseStandbyTimer(data: ArrayBuffer) {
    const view = new DataView(data)

    // 0, 5, 20, 40, 60, 180 minutes
    return view.getUint8(0)
  }

  public async setNoiseReduction(level: NoiseReduction) {
    const payload = new Uint8Array([level])

    await this.request(Function.ANR, payload, PacketKind.SET_GET)
  }

  private parseNoiseReduction(data: ArrayBuffer) {
    const view = new DataView(data)

    return view.getUint8(0)
  }

  private parseButtons(data: ArrayBuffer) {
    const view = new DataView(data)

    if (view.getUint8(0) !== 0x10 || view.getUint8(1) !== 0x04 || view.getUint8(3) !== 0x07) {
      console.info(`Unexpected button settings: ${toHexString(new Uint8Array(data))}`)
    }

    return {
      action: view.getUint8(2) as ButtonAction,
    }
  }

  public getSidetone() {
    return this.request(Function.SIDETONE) as Promise<
      ReturnType<BoseConnectDevice['parseSidetone']>
    >
  }

  public setSidetone(value: SidetoneMode) {
    const payload = new Uint8Array([0x01, value, 0x38])

    return this.request(Function.SIDETONE, payload, PacketKind.SET_GET)
  }

  private parseSidetone(data: ArrayBuffer) {
    const view = new DataView(data)

    if (view.getUint8(0) !== 0x01 || view.getUint8(2) !== 0x0f) {
      console.info(`Unexpected self voice: ${toHexString(new Uint8Array(data))}`)
    }

    return {
      action: view.getUint8(2) as ButtonAction,
    }
  }

  public getBatteryLevel() {
    return this.request(Function.BATTERY_LEVEL) as Promise<
      ReturnType<BoseConnectDevice['parseBatteryLevel']>
    >
  }

  private parseBatteryLevel(data: ArrayBuffer) {
    const view = new DataView(data)

    // 0-100
    return view.getUint8(0)
  }

  public async connectDevice(addr: Uint8Array | Parameters<(typeof Uint8Array)['from']>) {
    const payload = new Uint8Array(1 + 6)
    payload.set(addr, 1)
    const resp = await this.request(Function.CONNECT, payload, PacketKind.START)
    if (DEBUG) console.log(resp)
  }

  public async disconnectDevice(addr: Uint8Array | Parameters<(typeof Uint8Array)['from']>) {
    const payload = Uint8Array.from(addr)
    const resp = await this.request(Function.DISCONNECT, payload, PacketKind.START)
    if (DEBUG) console.log(resp)
  }

  public async removeDevice(addr: Uint8Array | Parameters<(typeof Uint8Array)['from']>) {
    const payload = Uint8Array.from(addr)
    const resp = await this.request(Function.REMOVE_DEVICE, payload, PacketKind.START)
    if (DEBUG) console.log(resp)
  }

  public getPairedDeviceList() {
    return this.request(Function.LIST_DEVICES) as Promise<
      ReturnType<BoseConnectDevice['parsePairedDeviceList']>
    >
  }

  private parsePairedDeviceList(data: ArrayBuffer) {
    const view = new Uint8Array(data)
    const devices: Uint8Array[] = []

    for (let i = 0, off = 1; i < view[0]; ++i, off += 6) {
      devices.push(view.slice(off, off + 6))
    }

    return devices
  }

  public async getPairedDeviceInfo(addr: Uint8Array | Parameters<(typeof Uint8Array)['from']>) {
    const payload = Uint8Array.from(addr)
    const out = (await this.request(Function.PAIRED_DEVICE_INFO, payload)) as ReturnType<
      BoseConnectDevice['parsePairedDeviceInfo']
    >

    if (
      out.address.byteLength < payload.byteLength ||
      !out.address.slice(0, 6).every((v, i) => v === payload[i])
    ) {
      throw new Error()
    }

    return out
  }

  private parsePairedDeviceInfo(data: ArrayBuffer) {
    const view = new Uint8Array(data)
    const dview = new DataView(data)
    const status = view[6] as PairedDeviceStatusMask
    const hasBoseProduct = Boolean(status & PairedDeviceStatusMask.BOSE_PRODUCT)

    return {
      address: view.slice(0, 6),
      status,
      boseProduct: !hasBoseProduct
        ? undefined
        : { productId: dview.getUint16(7, false), variant: dview.getUint8(9) },
      name: new TextDecoder().decode(view.slice(hasBoseProduct ? 10 : 9)),
    }
  }

  public async setPairingMode(enabled: boolean) {
    const payload = new Uint8Array([enabled ? 1 : 0])

    await this.request(Function.PAIRING_MODE, payload, PacketKind.START)
  }

  public getSource() {
    return this.request(Function.SOURCE) as Promise<ReturnType<BoseConnectDevice['parseSource']>>
  }

  private parseSource(data: ArrayBuffer) {
    const view = new Uint8Array(data)

    return {
      address: view.slice(3),
      type: view[2] as AudioSourceType,
      unknown: view.slice(0, 2), // a bit set
    }
  }

  public getAllAudio() {
    return this.request(Function.AUDIO_GET_ALL, undefined, PacketKind.START) as Promise<
      ReturnType<BoseConnectDevice['parseAllAudio']>
    >
  }

  private parseAllAudio(data: PacketTree['payload']) {
    if (!(data instanceof Map)) throw new Error()

    const control = data.get(Function.AUDIO_CONTROL)
    const status = data.get(Function.PLAYBACK_STATUS)
    const volume = data.get(Function.VOLUME)
    const nowPlaying = data.get(Function.NOW_PLAYING)

    return {
      control: !control ? undefined : this.parseAudioControl(expectStatus(control).payload),
      playback: !status ? undefined : this.parsePlaybackStatus(expectStatus(status).payload),
      volume: !volume ? undefined : this.parseVolume(expectStatus(volume).payload),
      title: !nowPlaying ? undefined : this.parseNowPlaying(expectProcessing(nowPlaying).payload),
    }
  }

  private parseAudioControl(data: ArrayBuffer) {
    const view = new Uint8Array(data)

    return view
  }

  private parsePlaybackStatus(data: ArrayBuffer) {
    const view = new DataView(data)

    return view.getUint8(0) as PlaybackStatus
  }

  private parseVolume(data: ArrayBuffer) {
    const view = new DataView(data)

    return {
      max: view.getUint8(0),
      current: view.getUint8(1),
    }
  }

  private parseNowPlaying(data: PacketTree[]) {
    return data.map((data) => {
      const view = new Uint8Array(expectStatus(data).payload)

      return {
        kind: view[0] as PlaybackTitleKind,
        text: new TextDecoder().decode(view.slice(1)),
      }
    })
  }

  public getVolume() {
    return this.request(Function.VOLUME) as Promise<ReturnType<BoseConnectDevice['parseVolume']>>
  }

  public async setVolume(volume: number) {
    const payload = new DataView(new ArrayBuffer(1))
    payload.setUint8(0, volume)
    await this.request(Function.VOLUME, new Uint8Array(payload.buffer), PacketKind.SET_GET)
  }

  public getAllVpa() {
    return this.request(Function.VPA_GET_ALL, undefined, PacketKind.START) as Promise<
      ReturnType<BoseConnectDevice['parseGetAllVpa']>
    >
  }

  private parseGetAllVpa(data: PacketTree['payload']) {
    if (!(data instanceof Map)) throw new Error()

    const supported = data.get(Function.SUPPORTED_VPAS)

    return {
      supported: !supported ? undefined : this.parseSupportedVpas(expectStatus(supported).payload),
    }
  }

  private parseSupportedVpas(data: ArrayBuffer) {
    // The top bit has some special meaning.
    return Array.from(new Uint8Array(data)).map((v) => (v & 0x7f) as VoicePersonalAssistant)
  }

  private async request<C extends Function>(
    cmd: C,
    payload?: Parameters<BoseConnectLowLevel['writePacket']>[2],
    kind = PacketKind.GET,
  ) {
    await this.productVersion

    const resp = await this.low.request(cmd, kind, payload)

    if (DEBUG) console.log('Request', cmd, PacketKind[kind], resp)

    return this.parsePacket(resp)
  }

  private parsePacket<C extends Function>(p: PacketTree & { cmd: C }) {
    switch (p.cmd) {
      case Function.PRODUCT_VERSION:
        return this.parseProductVersion(expectStatus(p).payload)
      case Function.GET_ALL_FUNCTION_BLOCKS:
        return this.parseGetAllFunctionBlocks(expectProcessingMap(p).payload)
      case Function.PRODUCT_ID_VARIANT:
        return this.parseProductIdVariant(expectStatus(p).payload)
      case Function.FIRMWARE_VERSION:
        return this.parseFirmwareVersion(expectStatus(p).payload)
      case Function.SERIAL_NUMBER:
        return this.parseSerialNumber(expectStatus(p).payload)

      case Function.SETTINGS_GET_ALL:
        return this.parseAllSettings(expectProcessingMap(p).payload)
      case Function.PRODUCT_NAME:
        return this.parseProductName(expectStatus(p).payload)
      case Function.VOICE_PROMPTS:
        return this.parseVoicePrompts(expectStatus(p).payload)
      case Function.STANDBY_TIMER:
        return this.parseStandbyTimer(expectStatus(p).payload)
      case Function.ANR:
        return this.parseNoiseReduction(expectStatus(p).payload)
      case Function.BUTTONS:
        return this.parseButtons(expectStatus(p).payload)
      case Function.SIDETONE:
        return this.parseSidetone(expectStatus(p).payload)

      case Function.BATTERY_LEVEL:
        return this.parseBatteryLevel(expectStatus(p).payload)

      case Function.LIST_DEVICES:
        return this.parsePairedDeviceList(expectStatus(p).payload)
      case Function.PAIRED_DEVICE_INFO:
        return this.parsePairedDeviceInfo(expectStatus(p).payload)

      case Function.SOURCE:
        return this.parseSource(expectStatus(p).payload)
      case Function.AUDIO_GET_ALL:
        return this.parseAllAudio(expectProcessingMap(p).payload)
      case Function.AUDIO_CONTROL:
        return this.parseAudioControl(expectStatus(p).payload)
      case Function.PLAYBACK_STATUS:
        return this.parsePlaybackStatus(expectStatus(p).payload)
      case Function.VOLUME:
        return this.parseVolume(expectStatus(p).payload)
      case Function.NOW_PLAYING:
        return this.parseNowPlaying(expectProcessing(p).payload)

      case Function.VPA_GET_ALL:
        return this.parseGetAllVpa(expectProcessingMap(p).payload)
      case Function.SUPPORTED_VPAS:
        return this.parseSupportedVpas(expectStatus(p).payload)

      default:
        return p.payload
    }
  }
}

function isStatus(
  tree: PacketTree,
): tree is PacketTree & { kind: PacketKind.STATUS; payload: ArrayBuffer } {
  return tree.kind === PacketKind.STATUS && tree.payload instanceof ArrayBuffer
}

function expectStatus(tree: PacketTree) {
  if (!isStatus(tree)) throw new Error()

  return tree
}

function isProcessing(
  tree: PacketTree,
): tree is PacketTree & { kind: PacketKind.PROCESSING; payload: PacketTree[] } {
  return tree.kind === PacketKind.PROCESSING && Array.isArray(tree.payload)
}

function expectProcessing(tree: PacketTree) {
  if (!isProcessing(tree)) throw new Error()

  return tree
}

function isProcessingMap(
  tree: PacketTree,
): tree is PacketTree & { kind: PacketKind.PROCESSING; payload: Map<Function, PacketTree> } {
  return tree.kind === PacketKind.PROCESSING && tree.payload instanceof Map
}

function expectProcessingMap(tree: PacketTree) {
  if (!isProcessingMap(tree)) throw new Error()

  return tree
}
