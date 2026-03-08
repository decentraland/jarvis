export interface Repo {
  url: string
  lastCommit: string | null
}

export const workspaces: Record<string, Repo[]> = {
  'https://github.com/decentraland/core-workspace': [
    { url: 'https://github.com/decentraland/schemas', lastCommit: 'ce200bbfa936f417c6467dda572cbde52734b57d' },
    { url: 'https://github.com/decentraland/worlds-content-server', lastCommit: '6e3176d6731c532e4a643a7968bcd5da227f7be8' },
    { url: 'https://github.com/decentraland/realm-provider', lastCommit: '6e94fcd6ee5a92213b903702585aeb22f97e3a19' },
    { url: 'https://github.com/decentraland/comms-gatekeeper', lastCommit: '3f016c505053b2c7a04b3c1215607863b0a2a86a' },
    { url: 'https://github.com/decentraland/archipelago-workers', lastCommit: 'f6a935459ce3cfd6b85e606dd6884dab490c8144' },
    { url: 'https://github.com/decentraland/social-service-ea', lastCommit: '651efa31c501cc84d49dc5d899ff8aa5097334b7' },
    { url: 'https://github.com/decentraland/catalyst', lastCommit: '14db3b89907803a180279497fe1098d0bcd228f3' },
    { url: 'https://github.com/decentraland/lamb2', lastCommit: 'dbeb1343d58c92e4dbdb21d03986d924571d13bc' },
    { url: 'https://github.com/decentraland/asset-bundle-registry', lastCommit: '7caf25fce68e5609ce38e1db03a508a02db3adfb' },
    { url: 'https://github.com/decentraland/events-notifier', lastCommit: 'fb3e03beac08fde924ace0a7de84dcd8eddf1364' },
    { url: 'https://github.com/decentraland/badges', lastCommit: '64733aeda818a50f296979165efeeb772a0861c6' },
    { url: 'https://github.com/decentraland/credits-server', lastCommit: 'fd1f7e0b6ea1f833de88541d047f4f5848c7f80d' },
    { url: 'https://github.com/decentraland/notifications-workers', lastCommit: 'f90378765feeb4c5a3aeb0e5cf79e97a821b2ac9' },
    { url: 'https://github.com/decentraland/auth-server', lastCommit: 'a21f5f4d1bb0540c13e6c581ec7ae0d52d929312' },
    { url: 'https://github.com/decentraland/marketplace-server', lastCommit: '22727beb390001fb32480108f556955a01078a74' },
    { url: 'https://github.com/decentraland/events', lastCommit: '7d4ab0fe613c81afce69835ac99e6af93289d48c' },
    { url: 'https://github.com/decentraland/referral', lastCommit: '18779831947ebdbf89add759387895746c7c0380' },
    { url: 'https://github.com/decentraland/camera-reel-service', lastCommit: '040eaf0d18664e9eabca41111fa9d9f057d5fee7' },
    { url: 'https://github.com/decentraland/atlas-server', lastCommit: '52447e9cac2275bf9151b0f530c585d08a374a47' },
    { url: 'https://github.com/decentraland/exploration-games', lastCommit: 'fe2ff68c3e34719eeb06737d360a86a3b7f33512' },
    { url: 'https://github.com/decentraland/core-components', lastCommit: 'b1dc5d222aa8732dab718925532ef99feb4e572d' },
    { url: 'https://github.com/decentraland/police-server', lastCommit: '51e704c09b65f9c1b6f8e775dd375ea2cad8959a' },
    { url: 'https://github.com/decentraland/protocol', lastCommit: 'fb11819906bfc84eeb5d434d190731e2a9049c3f' },
    { url: 'https://github.com/decentraland/content-validator', lastCommit: 'b6b5bcdd36252e5b01945408bffbae04f22a5b19' },
    { url: 'https://github.com/decentraland/prometheus-nats-exporter', lastCommit: 'c73e6511064df490a083d732b5eaa0384ca71aab' },
    { url: 'https://github.com/decentraland/architecture', lastCommit: '29f73b2ca7565d2dfa2c1eb03bce791bffb6243e' },
    { url: 'https://github.com/decentraland/block-indexer', lastCommit: '3ee0139a5b380b69a3962d4d991320558df29573' },
    { url: 'https://github.com/decentraland/platform-crypto-middleware', lastCommit: '771159a1a673c64c33a6d2fcc285526c317edf3e' },
    { url: 'https://github.com/decentraland/catalyst-contracts', lastCommit: '7aee08a240f69c0a3e1edf5ebcd15cf97ac20142' },
    { url: 'https://github.com/decentraland/hashing', lastCommit: '66a894cc062650231537f536edf53ddacb8e9859' },
    { url: 'https://github.com/decentraland/decentraland-crypto-middleware', lastCommit: '068b71128a29493599b6b373c78de6fb9d68e0ef' },
    { url: 'https://github.com/decentraland/catalyst-storage', lastCommit: '48892f2099738158c9c6e102783ea59fbea91656' },
    { url: 'https://github.com/decentraland/urn-resolver', lastCommit: '4a9a47e1a7ed95f34f702d46e76a8923a507987f' },
    { url: 'https://github.com/decentraland/reels', lastCommit: '6503da3b457ec47d41cccab9f9a4d4109eb1760f' },
    { url: 'https://github.com/decentraland/snapshots-fetcher', lastCommit: '38a80b5e92820842425aebfebd8b9e861a7e8673' },
    { url: 'https://github.com/decentraland/profile-images', lastCommit: '7d296060967579845bcea4289c3dd2a0c32103c9' },
    { url: 'https://github.com/decentraland/comms-message-sfu', lastCommit: '8685f0331e1f3e1b3ea760303e9abf1c869d1492' },
    { url: 'https://github.com/decentraland/linker-server', lastCommit: 'e0068b1c5c315977fe1d70217ebb250b20f3becc' },
    { url: 'https://github.com/decentraland/deployments-to-sqs', lastCommit: '8b97fae8df875a90d88c26629b15c14ab72ebb27' },
    { url: 'https://github.com/decentraland/asset-bundle-converter', lastCommit: '18bacd4d1823c2a11d10caa5e4fb69c11016c273' },
    { url: 'https://github.com/decentraland/world-storage-service', lastCommit: '15d05b505f8e4f65d7419f4045aa4cf657cce882' },
  ],
}

export const standalone: Repo[] = [
  { url: 'https://github.com/decentraland/unity-explorer', lastCommit: '596c84c0dd1f6a1b5802b1895d0a3cba67ff6bcf' },
]
